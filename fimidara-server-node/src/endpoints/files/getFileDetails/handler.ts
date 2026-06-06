import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {validate} from '../../../utils/validate.js';
import {extractPublicFile, getAndCheckFileAuthorization} from '../utils.js';
import {GetFileDetailsEndpoint} from './types.js';
import {getFileDetailsJoiSchema} from './validation.js';

const getFileDetails: GetFileDetailsEndpoint = async reqData => {
  const data = validate(reqData.data, getFileDetailsJoiSchema);
  const agent = await kIjxUtils
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const file = await kIjxSemantic.utils().withTxn(opts =>
    getAndCheckFileAuthorization({
      agent,
      opts,
      matcher: data,
      action: kFimidaraPermissionActions.readFile,
      incrementPresignedPathUsageCount: false,
    })
  );

  return {
    file: extractPublicFile(file, agent.agentId, data.uploadSessionId),
  };
};

export default getFileDetails;
