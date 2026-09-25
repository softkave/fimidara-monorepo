import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {
  checkAuthorizationWithAgent,
  getFilePermissionContainers,
} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {File, FileMatcher} from '../../../definitions/file.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {SessionAgent} from '../../../definitions/system.js';
import RequestData from '../../RequestData.js';
import {getFileWithMatcher} from '../getFilesWithMatcher.js';
import {assertFile} from '../utils.js';

export async function getReadFileAgent(
  reqData: RequestData
): Promise<SessionAgent> {
  return kIjxUtils
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );
}

/** Load file by matcher and enforce read permission (unless presigned). */
export async function getAuthorizedFileForRead(params: {
  reqData: RequestData;
  matcher: FileMatcher;
  agent: SessionAgent;
}): Promise<File> {
  const file = await kIjxSemantic.utils().withTxn(async opts => {
    const {file, presignedPath} = await getFileWithMatcher({
      presignedPathAction: kFimidaraPermissionActions.readFile,
      incrementPresignedPathUsageCount: true,
      supportPresignedPath: true,
      matcher: params.matcher,
      opts,
    });

    // If there's `presignedPath`, then permission is already checked
    if (!presignedPath && file) {
      await checkAuthorizationWithAgent({
        target: {
          action: kFimidaraPermissionActions.readFile,
          targetId: getFilePermissionContainers(
            file.workspaceId,
            file,
            /** include resource ID */ true
          ),
        },
        workspaceId: file.workspaceId,
        agent: params.agent,
        opts,
      });
    }

    return file;
  });

  assertFile(file);
  return file;
}
