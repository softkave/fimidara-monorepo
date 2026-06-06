import {isNumber} from 'lodash-es';
import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {validate} from '../../../utils/validate.js';
import {InvalidRequestError} from '../../errors.js';
import {getAndCheckFileAuthorization} from '../utils.js';
import {deleteMultipartUpload} from '../deleteFile/deleteMultipartUpload.js';
import {setFileWritable} from '../uploadFile/update.js';
import {AbortUploadEndpoint} from './types.js';
import {abortUploadJoiSchema} from './validation.js';
import {appAssert} from '../../../utils/assertion.js';

const abortUpload: AbortUploadEndpoint = async reqData => {
  const data = validate(reqData.data, abortUploadJoiSchema);
  const agent = await kIjxUtils
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const file = await kIjxSemantic.utils().withTxn(async opts => {
    return await getAndCheckFileAuthorization({
      action: kFimidaraPermissionActions.uploadFile,
      incrementPresignedPathUsageCount: false,
      shouldIngestFile: false,
      matcher: data,
      agent,
      opts,
    });
  });

  if (data.clientMultipartId) {
    appAssert(
      file.internalMultipartId,
      new InvalidRequestError('File is not a multipart upload.')
    );
    appAssert(
      file.clientMultipartId === data.clientMultipartId,
      new InvalidRequestError(
        'clientMultipartId does not match the active multipart upload.'
      )
    );

    if (isNumber(data.part)) {
      await deleteMultipartUpload({
        file,
        multipartId: file.internalMultipartId,
        part: data.part,
        shouldCleanupFile: false,
      });
      await kIjxUtils.partUploadLock().forceRelease(file.resourceId, data.part);
    } else {
      await deleteMultipartUpload({
        file,
        multipartId: file.internalMultipartId,
        shouldCleanupFile: true,
      });
    }

    return {};
  }

  appAssert(
    !isNumber(data.part),
    new InvalidRequestError(
      'part can only be provided with clientMultipartId for multipart uploads.'
    )
  );

  if (file.internalMultipartId) {
    await deleteMultipartUpload({
      file,
      multipartId: file.internalMultipartId,
      shouldCleanupFile: true,
    });
  } else {
    await setFileWritable(file.resourceId);
  }

  return {};
};

export default abortUpload;
