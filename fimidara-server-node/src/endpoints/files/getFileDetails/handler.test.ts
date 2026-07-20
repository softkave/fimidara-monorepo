import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {kImageDimensionsStatus} from '../../../definitions/file.js';
import RequestData from '../../RequestData.js';
import {kGenerateTestFileType} from '../../testHelpers/generate/file/generateTestFileBinary.js';
import {completeTests} from '../../testHelpers/helpers/testFns.js';
import {
  assertEndpointResultOk,
  initTests,
  insertFileForTest,
  insertUserForTest,
  insertWorkspaceForTest,
  mockExpressRequestWithAgentToken,
} from '../../testHelpers/utils.js';
import {stringifyFilenamepath} from '../utils.js';
import getFileDetails from './handler.js';
import {GetFileDetailsEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('getFileDetails', () => {
  test('file details returned', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {file} = await insertFileForTest(userToken, workspace);
    await kIjxUtils.promises().flush();

    const reqData =
      RequestData.fromExpressRequest<GetFileDetailsEndpointParams>(
        mockExpressRequestWithAgentToken(userToken),
        {filepath: stringifyFilenamepath(file, workspace.rootname)}
      );
    const result = await getFileDetails(reqData);
    assertEndpointResultOk(result);
    expect(result.file.resourceId).toBe(file.resourceId);
    expect(result.file.name).toBe(file.name);
    expect(result.file.size).toBe(file.size);
  });

  test('fills missing image dimensions for image files', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {file, rawFile} = await insertFileForTest(
      userToken,
      workspace,
      {},
      kGenerateTestFileType.png,
      {width: 300, height: 150}
    );
    await kIjxUtils.promises().flush();

    // Simulate historical file that never got probed
    await kIjxSemantic.utils().withTxn(async opts => {
      await kIjxSemantic.file().getAndUpdateOneById(
        rawFile.resourceId,
        {
          imageWidth: null,
          imageHeight: null,
          imageDimensionsStatus: kImageDimensionsStatus.pending,
        },
        opts
      );
    });

    const reqData =
      RequestData.fromExpressRequest<GetFileDetailsEndpointParams>(
        mockExpressRequestWithAgentToken(userToken),
        {filepath: stringifyFilenamepath(file, workspace.rootname)}
      );
    const result = await getFileDetails(reqData);
    assertEndpointResultOk(result);

    expect(result.file.imageDimensionsStatus).toBe(
      kImageDimensionsStatus.ready
    );
    expect(result.file.imageWidth).toBe(300);
    expect(result.file.imageHeight).toBe(150);
    expect(result.file.aspectRatio).toBe(2);
  });
});
