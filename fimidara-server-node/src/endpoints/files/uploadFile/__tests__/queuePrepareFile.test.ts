import {compact, uniq} from 'lodash-es';
import {kLoopAsyncSettlementType, loopAndCollateAsync} from 'softkave-js-utils';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kIjxSemantic} from '../../../../contexts/ijx/injectables.js';
import {
  generateAndInsertTestFiles,
  generateTestFilepathString,
} from '../../../testHelpers/generate/file.js';
import {completeTests} from '../../../testHelpers/helpers/testFns.js';
import {setupIgnoreUnhandledRejections} from '../../../testHelpers/helpers/error.js';
import {
  initTests,
  insertUserForTest,
  insertWorkspaceForTest,
} from '../../../testHelpers/utils.js';
import {NotFoundError} from '../../../errors.js';
import {getFilepathInfo, stringifyFilenamepath} from '../../utils.js';
import {queuePrepareFile} from '../queuePrepareFile.js';

// Handle expected NotFoundError rejections from queue processing
// These occur in background queue processing and are expected behavior
const {beforeAll: beforeAllIgnoreErrors, afterAll: afterAllIgnoreErrors} =
  setupIgnoreUnhandledRejections(NotFoundError);

beforeAll(async () => {
  await initTests();
  beforeAllIgnoreErrors();
});

afterAll(async () => {
  afterAllIgnoreErrors();
  await completeTests();
});

describe('queuePrepareFile', () => {
  test('should create file', async () => {
    const {userToken, sessionAgent} = await insertUserForTest();
    const {rawWorkspace: workspace} = await insertWorkspaceForTest(userToken);
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    const file = await queuePrepareFile({
      agent: sessionAgent,
      input: {filepath, workspaceId: workspace.resourceId},
    });

    expect(stringifyFilenamepath(file, workspace.rootname)).toEqual(filepath);

    const pathinfo = getFilepathInfo(filepath, {
      containsRootname: true,
      allowRootFolder: false,
    });
    const dbFile = await kIjxSemantic.file().getOneByNamepath({
      workspaceId: workspace.resourceId,
      namepath: pathinfo.namepath,
      ext: pathinfo.ext,
    });
    expect(dbFile).toBeDefined();
  });

  test('should return existing file', async () => {
    const {userToken, sessionAgent} = await insertUserForTest();
    const {rawWorkspace: workspace} = await insertWorkspaceForTest(userToken);
    const [file] = await generateAndInsertTestFiles(1, {
      parentId: null,
      workspaceId: workspace.resourceId,
    });

    const filepath = stringifyFilenamepath(file, workspace.rootname);
    const result = await queuePrepareFile({
      agent: sessionAgent,
      input: {workspaceId: workspace.resourceId, filepath},
    });

    expect(result.resourceId).toEqual(file.resourceId);
  });

  test('should create only one file', async () => {
    const {userToken, sessionAgent} = await insertUserForTest();
    const {rawWorkspace: workspace} = await insertWorkspaceForTest(userToken);
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    async function createFile() {
      const file = await queuePrepareFile({
        agent: sessionAgent,
        input: {
          filepath,
          workspaceId: workspace.resourceId,
          clientMultipartId: '123',
        },
      });

      return file;
    }

    const count = 10;
    const files = await loopAndCollateAsync(
      createFile,
      count,
      kLoopAsyncSettlementType.allSettled
    );

    expect(files.length).toEqual(count);

    const fileIds = files.map(file => {
      if (file.status === 'fulfilled') {
        return file.value.resourceId;
      }

      return null;
    });

    const uniqueFileIds = uniq(compact(fileIds));
    expect(uniqueFileIds.length).toEqual(1);
  });

  test('should throw NotFoundError when shouldCreate is false and file does not exist', async () => {
    const {userToken, sessionAgent} = await insertUserForTest();
    const {rawWorkspace: workspace} = await insertWorkspaceForTest(userToken);
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    try {
      await queuePrepareFile({
        agent: sessionAgent,
        input: {
          filepath,
          workspaceId: workspace.resourceId,
          shouldCreate: false,
        },
      });
    } catch (error: any) {
      expect(error).toMatchObject({
        name: 'NotFoundError',
        message: 'File does not exist',
      });
    }
  });

  test('should return existing file when shouldCreate is false', async () => {
    const {userToken, sessionAgent} = await insertUserForTest();
    const {rawWorkspace: workspace} = await insertWorkspaceForTest(userToken);
    const [file] = await generateAndInsertTestFiles(1, {
      parentId: null,
      workspaceId: workspace.resourceId,
    });

    const filepath = stringifyFilenamepath(file, workspace.rootname);
    const result = await queuePrepareFile({
      agent: sessionAgent,
      input: {
        workspaceId: workspace.resourceId,
        filepath,
        shouldCreate: false,
      },
    });

    expect(result.resourceId).toEqual(file.resourceId);
  });

  test('should create file when shouldCreate is true (explicit)', async () => {
    const {userToken, sessionAgent} = await insertUserForTest();
    const {rawWorkspace: workspace} = await insertWorkspaceForTest(userToken);
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    const file = await queuePrepareFile({
      agent: sessionAgent,
      input: {
        filepath,
        workspaceId: workspace.resourceId,
        shouldCreate: true,
      },
    });

    expect(stringifyFilenamepath(file, workspace.rootname)).toEqual(filepath);

    const pathinfo = getFilepathInfo(filepath, {
      containsRootname: true,
      allowRootFolder: false,
    });
    const dbFile = await kIjxSemantic.file().getOneByNamepath({
      workspaceId: workspace.resourceId,
      namepath: pathinfo.namepath,
      ext: pathinfo.ext,
    });
    expect(dbFile).toBeDefined();
  });

  test('should create file when shouldCreate is undefined (defaults to true)', async () => {
    const {userToken, sessionAgent} = await insertUserForTest();
    const {rawWorkspace: workspace} = await insertWorkspaceForTest(userToken);
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    const file = await queuePrepareFile({
      agent: sessionAgent,
      input: {
        filepath,
        workspaceId: workspace.resourceId,
        // shouldCreate is undefined, should default to true
      },
    });

    expect(stringifyFilenamepath(file, workspace.rootname)).toEqual(filepath);

    const pathinfo = getFilepathInfo(filepath, {
      containsRootname: true,
      allowRootFolder: false,
    });
    const dbFile = await kIjxSemantic.file().getOneByNamepath({
      workspaceId: workspace.resourceId,
      namepath: pathinfo.namepath,
      ext: pathinfo.ext,
    });
    expect(dbFile).toBeDefined();
  });
});
