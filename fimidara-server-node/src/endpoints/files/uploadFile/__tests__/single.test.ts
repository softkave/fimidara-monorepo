import assert from 'assert';
import {afterAll, afterEach, beforeAll, describe, expect, test} from 'vitest';
import {MemoryFilePersistenceProvider} from '../../../../contexts/file/MemoryFilePersistenceProvider.js';
import {
  FilePersistenceProvider,
  FilePersistenceUploadFileParams,
  FileProviderResolver,
} from '../../../../contexts/file/types.js';
import {kIjxSemantic, kIjxUtils} from '../../../../contexts/ijx/injectables.js';
import {kRegisterIjxUtils} from '../../../../contexts/ijx/register.js';
import {FimidaraSuppliedConfig} from '../../../../resources/config.js';
import {generateTestFilepathString} from '../../../testHelpers/generate/file.js';
import {kGenerateTestFileType} from '../../../testHelpers/generate/file/generateTestFileBinary.js';
import {
  expectErrorThrown,
  setupIgnoreUnhandledRejections,
} from '../../../testHelpers/helpers/error.js';
import {completeTests} from '../../../testHelpers/helpers/testFns.js';
import {
  initTests,
  insertFileForTest,
  insertUserForTest,
  insertWorkspaceForTest,
} from '../../../testHelpers/utils.js';
import {FileNotWritableError} from '../../errors.js';
import {FileQueries} from '../../queries.js';
import {stringifyFilenamepath} from '../../utils.js';
import {UploadFileEndpointParams} from '../types.js';
import {uploadFileBaseTest} from '../testutils/utils.js';

let defaultFileProviderResolver: FileProviderResolver | undefined;
let defaultSuppliedConfig: FimidaraSuppliedConfig | undefined;

const {beforeAll: beforeAllIgnoreErrors, afterAll: afterAllIgnoreErrors} =
  setupIgnoreUnhandledRejections(FileNotWritableError);

beforeAll(async () => {
  await initTests();
  defaultFileProviderResolver = kIjxUtils.fileProviderResolver();
  defaultSuppliedConfig = kIjxUtils.suppliedConfig();
  beforeAllIgnoreErrors();
});

afterEach(() => {
  assert.ok(defaultFileProviderResolver);
  kRegisterIjxUtils.fileProviderResolver(defaultFileProviderResolver);
  if (defaultSuppliedConfig) {
    kRegisterIjxUtils.suppliedConfig(defaultSuppliedConfig);
  }
});

afterAll(async () => {
  afterAllIgnoreErrors();
  await completeTests();
});

describe('single.uploadFile', () => {
  test('file marked write available on error', async () => {
    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {file} = await insertFileForTest(
      insertUserResult.userToken,
      insertWorkspaceResult.workspace
    );

    class TestFileProvider
      extends MemoryFilePersistenceProvider
      implements FilePersistenceProvider
    {
      uploadFile = async () => {
        throw new Error();
      };
    }

    kRegisterIjxUtils.fileProviderResolver(() => {
      return new TestFileProvider();
    });

    await expectErrorThrown(async () => {
      await uploadFileBaseTest({
        insertUserResult,
        insertWorkspaceResult,
        isMultipart: false,
        input: {
          filepath: stringifyFilenamepath(
            file,
            insertWorkspaceResult.workspace.rootname
          ),
        },
      });
    });

    await kIjxUtils.promises().flush();
    const dbFile = await kIjxSemantic.file().getOneById(file.resourceId);
    expect(dbFile?.isWriteAvailable).toBeTruthy();
  });

  test('concurrent uploads from different upload sessions reject all but one', async () => {
    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    async function callUploadFile(uploadSessionId: string) {
      try {
        const result = await uploadFileBaseTest({
          isMultipart: false,
          insertUserResult,
          insertWorkspaceResult,
          input: {filepath, uploadSessionId},
          type: kGenerateTestFileType.txt,
        });
        return {status: 'fulfilled', value: result} as const;
      } catch (error) {
        return {status: 'rejected', reason: error} as const;
      }
    }

    const results = await Promise.all([
      callUploadFile('concurrent-session-1'),
      callUploadFile('concurrent-session-2'),
      callUploadFile('concurrent-session-3'),
    ]);

    await kIjxUtils.promises().flush();

    const fulfilled = results.filter(result => result.status === 'fulfilled');
    const rejected = results.filter(result => result.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(2);
    for (const result of rejected) {
      expect((result.reason as Error)?.name).toBe(FileNotWritableError.name);
    }

    const successResult = fulfilled[0]?.value;
    assert.ok(successResult);

    const files = await kIjxSemantic
      .file()
      .getManyByQuery(FileQueries.getByNamepath(successResult.dbFile));
    expect(files).toHaveLength(1);
  }, 30_000);

  test('cannot double write file', async () => {
    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    const uploadSessionId = 'primary-upload-session';

    async function callUploadFile(
      input: Partial<UploadFileEndpointParams> = {}
    ) {
      try {
        const result = await uploadFileBaseTest({
          isMultipart: false,
          insertUserResult,
          insertWorkspaceResult,
          input: {filepath, uploadSessionId, ...input},
          type: kGenerateTestFileType.txt,
        });
        return {status: 'fulfilled', value: result} as const;
      } catch (error) {
        return {status: 'rejected', reason: error} as const;
      }
    }

    let probeConcurrentUploads = true;

    class TestFileProvider
      extends MemoryFilePersistenceProvider
      implements FilePersistenceProvider
    {
      uploadFile = async (params: FilePersistenceUploadFileParams) => {
        if (probeConcurrentUploads) {
          probeConcurrentUploads = false;

          const concurrentResults = await Promise.all([
            callUploadFile({uploadSessionId: 'other-upload-session-1'}),
            callUploadFile({uploadSessionId: 'other-upload-session-2'}),
          ]);

          for (const result of concurrentResults) {
            expect(result.status).toBe('rejected');
            expect((result.reason as Error)?.name).toBe(
              FileNotWritableError.name
            );
          }
        }

        return super.uploadFile(params);
      };
    }

    kRegisterIjxUtils.fileProviderResolver(() => {
      return new TestFileProvider();
    });

    const firstResult = await callUploadFile();
    expect(firstResult.status).toBe('fulfilled');
    assert.ok(firstResult.status === 'fulfilled');

    await kIjxUtils.promises().flush();

    const files = await kIjxSemantic
      .file()
      .getManyByQuery(FileQueries.getByNamepath(firstResult.value.dbFile));
    expect(files).toHaveLength(1);
  }, 30_000);
});
