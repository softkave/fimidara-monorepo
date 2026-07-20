import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {awaitOrTimeout} from '../../../utils/promiseFns.js';
import {validate} from '../../../utils/validate.js';
import {extractPublicFile, getAndCheckFileAuthorization} from '../utils.js';
import {
  fileNeedsImageDimensionsProbe,
  probeAndPersistImageDimensions,
} from '../utils/probeImageDimensions.js';
import {GetFileDetailsEndpoint} from './types.js';
import {getFileDetailsJoiSchema} from './validation.js';

const kProbeTimeoutMs = 8_000;

const getFileDetails: GetFileDetailsEndpoint = async reqData => {
  const data = validate(reqData.data, getFileDetailsJoiSchema);
  const agent = await kIjxUtils
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  let file = await kIjxSemantic.utils().withTxn(opts =>
    getAndCheckFileAuthorization({
      agent,
      opts,
      matcher: data,
      action: kFimidaraPermissionActions.readFile,
      incrementPresignedPathUsageCount: false,
    })
  );

  if (fileNeedsImageDimensionsProbe(file)) {
    const probed = await awaitOrTimeout(
      probeAndPersistImageDimensions(file.resourceId),
      kProbeTimeoutMs
    );
    if (!probed.timedout) {
      file = probed.result.file;
    }
  }

  return {
    file: extractPublicFile(file, agent.agentId, data.uploadSessionId),
  };
};

export default getFileDetails;
