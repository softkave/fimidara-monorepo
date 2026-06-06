import {getNewId} from 'softkave-js-utils';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kIjxSemantic} from '../../../contexts/ijx/injectables.js';
import {kRegisterIjxUtils} from '../../../contexts/ijx/register.js';
import {AgentToken} from '../../../definitions/agentToken.js';
import RequestData from '../../RequestData.js';
import TestMemoryFilePersistenceProviderContext from '../../testHelpers/context/file/TestMemoryFilePersistenceProviderContext.js';
import {generateAndInsertTestFileParts} from '../../testHelpers/generate/file.js';
import {completeTests} from '../../testHelpers/helpers/testFns.js';
import {
  assertEndpointResultOk,
  initTests,
  insertFileForTest,
  insertUserForTest,
  insertWorkspaceForTest,
  mockExpressRequestWithAgentToken,
} from '../../testHelpers/utils.js';
import startMultipartUpload from '../startMultipartUpload/handler.js';
import {StartMultipartUploadEndpointParams} from '../startMultipartUpload/types.js';
import {stringifyFilenamepath} from '../utils.js';
import abortUpload from './handler.js';
import {AbortUploadEndpointParams} from './types.js';
import {appAssert} from '../../../utils/assertion.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('abortUpload', () => {
  test('unlocks stuck single upload', async () => {
    const {userToken, sessionAgent} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {rawFile} = await insertFileForTest(userToken, workspace);
    await kIjxSemantic.utils().withTxn(async opts => {
      await kIjxSemantic.file().updateOneById(
        rawFile.resourceId,
        {
          isWriteAvailable: false,
          writeLockedBy: sessionAgent.agentId,
        },
        opts
      );
    });

    const reqData = RequestData.fromExpressRequest<AbortUploadEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {filepath: stringifyFilenamepath(rawFile, workspace.rootname)}
    );
    const result = await abortUpload(reqData);
    assertEndpointResultOk(result);

    const dbFile = await kIjxSemantic.file().getOneById(rawFile.resourceId);
    expect(dbFile?.isWriteAvailable).toBeTruthy();
    expect(dbFile?.writeLockedBy).toBeFalsy();
  });

  test('multipart upload part deleted', async () => {
    const backend = new TestMemoryFilePersistenceProviderContext();
    kRegisterIjxUtils.fileProviderResolver(() => backend);

    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {rawFile: file} = await insertFileForTest(userToken, workspace);

    const {clientMultipartId, internalMultipartId} =
      await callStartMultipartUpload({
        fileId: file.resourceId,
        workspaceId: workspace.resourceId,
        userToken,
      });

    await generateAndInsertTestFileParts(3, {
      fileId: file.resourceId,
      multipartId: internalMultipartId,
      part: 1,
    });

    const reqData = RequestData.fromExpressRequest<AbortUploadEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {
        clientMultipartId,
        part: 1,
        filepath: stringifyFilenamepath(file, workspace.rootname),
      }
    );

    const result = await abortUpload(reqData);
    assertEndpointResultOk(result);

    expect(backend.deleteMultipartUploadPart).toHaveBeenCalledWith({
      multipartId: internalMultipartId,
      part: 1,
      fileId: file.resourceId,
      filepath: stringifyFilenamepath(file),
      mount: expect.anything(),
      workspaceId: workspace.resourceId,
    });

    expect(backend.cleanupMultipartUpload).not.toHaveBeenCalled();

    const [dbFilePart] = await kIjxSemantic
      .filePart()
      .getManyByMultipartIdAndPart({
        multipartId: internalMultipartId,
        part: 1,
      });

    expect(dbFilePart).toBeFalsy();
  });

  test('multipart upload aborted without clientMultipartId', async () => {
    const backend = new TestMemoryFilePersistenceProviderContext();
    kRegisterIjxUtils.fileProviderResolver(() => backend);

    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {rawFile: file} = await insertFileForTest(userToken, workspace);

    const {internalMultipartId} = await callStartMultipartUpload({
      fileId: file.resourceId,
      workspaceId: workspace.resourceId,
      userToken,
    });

    await generateAndInsertTestFileParts(3, {
      fileId: file.resourceId,
      multipartId: internalMultipartId,
      part: 1,
    });

    const reqData = RequestData.fromExpressRequest<AbortUploadEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {filepath: stringifyFilenamepath(file, workspace.rootname)}
    );
    const result = await abortUpload(reqData);
    assertEndpointResultOk(result);

    const parts = await kIjxSemantic.filePart().getManyByMultipartIdAndPart({
      multipartId: internalMultipartId,
    });

    expect(parts.length).toBe(0);

    const dbFile = await kIjxSemantic.file().getOneById(file.resourceId);
    expect(dbFile?.clientMultipartId).toBeFalsy();
    expect(dbFile?.isWriteAvailable).toBeTruthy();
    expect(dbFile?.writeLockedBy).toBeFalsy();

    expect(backend.cleanupMultipartUpload).toHaveBeenCalledWith({
      multipartId: internalMultipartId,
      fileId: file.resourceId,
      filepath: stringifyFilenamepath(file),
      mount: expect.anything(),
      workspaceId: workspace.resourceId,
    });
  });

  test('multipart upload aborted', async () => {
    const backend = new TestMemoryFilePersistenceProviderContext();
    kRegisterIjxUtils.fileProviderResolver(() => backend);

    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {rawFile: file} = await insertFileForTest(userToken, workspace);

    const {clientMultipartId, internalMultipartId} =
      await callStartMultipartUpload({
        fileId: file.resourceId,
        workspaceId: workspace.resourceId,
        userToken,
      });

    await generateAndInsertTestFileParts(3, {
      fileId: file.resourceId,
      multipartId: internalMultipartId,
      part: 1,
    });

    const reqData = RequestData.fromExpressRequest<AbortUploadEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {
        clientMultipartId,
        filepath: stringifyFilenamepath(file, workspace.rootname),
      }
    );
    const result = await abortUpload(reqData);
    assertEndpointResultOk(result);

    const parts = await kIjxSemantic.filePart().getManyByMultipartIdAndPart({
      multipartId: internalMultipartId,
    });

    expect(parts.length).toBe(0);

    const dbFile = await kIjxSemantic.file().getOneById(file.resourceId);
    expect(dbFile?.clientMultipartId).toBeFalsy();
    expect(dbFile?.isWriteAvailable).toBeTruthy();

    expect(backend.deleteMultipartUploadPart).not.toHaveBeenCalled();
    expect(backend.cleanupMultipartUpload).toHaveBeenCalledWith({
      multipartId: internalMultipartId,
      fileId: file.resourceId,
      filepath: stringifyFilenamepath(file),
      mount: expect.anything(),
      workspaceId: workspace.resourceId,
    });
  });
});

async function callStartMultipartUpload(params: {
  fileId: string;
  workspaceId: string;
  userToken: AgentToken;
}) {
  const clientMultipartId = getNewId();
  const reqData =
    RequestData.fromExpressRequest<StartMultipartUploadEndpointParams>(
      mockExpressRequestWithAgentToken(params.userToken),
      {fileId: params.fileId, clientMultipartId}
    );

  const result = await startMultipartUpload(reqData);
  assertEndpointResultOk(result);

  const dbFile = await kIjxSemantic.file().getOneById(params.fileId);
  const internalMultipartId = dbFile?.internalMultipartId;
  appAssert(internalMultipartId);

  return {clientMultipartId, internalMultipartId};
}
