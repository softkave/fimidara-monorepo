import assert from 'assert';
import {afterAll, afterEach, beforeAll, describe, expect, test} from 'vitest';
import {MemoryFilePersistenceProvider} from '../../../../contexts/file/MemoryFilePersistenceProvider.js';
import {
  FilePersistenceProviderFeature,
  FileProviderResolver,
} from '../../../../contexts/file/types.js';
import {kIjxSemantic, kIjxUtils} from '../../../../contexts/ijx/injectables.js';
import {kRegisterIjxUtils} from '../../../../contexts/ijx/register.js';
import {kFileBackendType} from '../../../../definitions/fileBackend.js';
import {FimidaraSuppliedConfig} from '../../../../resources/config.js';
import {NotFoundError} from '../../../errors.js';
import {generateTestFilepathString} from '../../../testHelpers/generate/file.js';
import {kGenerateTestFileType} from '../../../testHelpers/generate/file/generateTestFileBinary.js';
import {
  expectErrorThrown,
  setupIgnoreUnhandledRejections,
} from '../../../testHelpers/helpers/error.js';
import {expectFileBodyEqual} from '../../../testHelpers/helpers/file.js';
import {completeTests} from '../../../testHelpers/helpers/testFns.js';
import {
  initTests,
  insertFileForTest,
  insertUserForTest,
  insertWorkspaceForTest,
} from '../../../testHelpers/utils.js';
import {UnsupportedOperationError} from '../../errors.js';
import {stringifyFilenamepath} from '../../utils.js';
import {uploadFileBaseTest} from '../testutils/utils.js';

let defaultFileProviderResolver: FileProviderResolver | undefined;
let defaultSuppliedConfig: FimidaraSuppliedConfig | undefined;

// Handle expected NotFoundError rejections from queue processing
// These occur in background queue processing and are expected behavior
const {beforeAll: beforeAllIgnoreErrors, afterAll: afterAllIgnoreErrors} =
  setupIgnoreUnhandledRejections(NotFoundError);

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

describe('uploadFile append mode', () => {
  test('should append data to existing file', async () => {
    const backend = new MemoryFilePersistenceProvider();
    kRegisterIjxUtils.fileProviderResolver(() => {
      return backend;
    });

    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;

    // Upload initial file
    const {
      resFile,
      dbFile: initialDbFile,
      dataBuffer: initialBuffer,
    } = await uploadFileBaseTest({
      isMultipart: false,
      insertUserResult,
      insertWorkspaceResult,
      type: kGenerateTestFileType.txt,
    });

    assert.ok(initialBuffer);
    const initialSize = initialBuffer.byteLength;

    // Append data to the file
    const {dbFile: appendedDbFile, dataBuffer: appendBuffer} =
      await uploadFileBaseTest({
        isMultipart: false,
        insertUserResult,
        insertWorkspaceResult,
        input: {
          filepath: stringifyFilenamepath(resFile, workspace.rootname),
          append: true,
        },
        type: kGenerateTestFileType.txt,
      });

    assert.ok(appendBuffer);
    const appendSize = appendBuffer.byteLength;

    // Verify file size is sum of initial and appended data
    expect(appendedDbFile.size).toBe(initialSize + appendSize);
    expect(appendedDbFile.version).toBe(initialDbFile.version + 1);

    // Verify the persisted file contains both chunks
    const fimidaraMount = await kIjxSemantic.fileBackendMount().getOneByQuery({
      workspaceId: workspace.resourceId,
      backend: kFileBackendType.fimidara,
    });

    assert.ok(fimidaraMount);
    const persistedFile = backend.getMemoryFile({
      mount: fimidaraMount,
      workspaceId: workspace.resourceId,
      filepath: stringifyFilenamepath(appendedDbFile),
    });

    assert.ok(persistedFile);
    assert.ok(persistedFile.body);

    // Verify the body contains both initial and appended data
    const combinedBuffer = Buffer.concat([initialBuffer, appendBuffer]);
    await expectFileBodyEqual(combinedBuffer, persistedFile.body);
  });

  test('should throw NotFoundError when append=true and onAppendCreateIfNotExists not set (defaults to false)', async () => {
    const backend = new MemoryFilePersistenceProvider();
    kRegisterIjxUtils.fileProviderResolver(() => {
      return backend;
    });

    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    // Append to non-existent file with default onAppendCreateIfNotExists (false)
    await expectErrorThrown(
      async () => {
        await uploadFileBaseTest({
          isMultipart: false,
          insertUserResult,
          insertWorkspaceResult,
          input: {
            filepath,
            append: true,
            // onAppendCreateIfNotExists defaults to false
          },
          type: kGenerateTestFileType.txt,
        });
      },
      (error): boolean => {
        // Error may be serialized through queue, so check by name
        if (error instanceof NotFoundError) {
          return true;
        }
        if (error && typeof error === 'object' && 'name' in error) {
          return error.name === 'NotFoundError';
        }
        return false;
      }
    );
  });

  test('should create file when append=true and onAppendCreateIfNotExists=true (explicit)', async () => {
    const backend = new MemoryFilePersistenceProvider();
    kRegisterIjxUtils.fileProviderResolver(() => {
      return backend;
    });

    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    // Append to non-existent file with explicit onAppendCreateIfNotExists=true
    const {dbFile, dataBuffer} = await uploadFileBaseTest({
      isMultipart: false,
      insertUserResult,
      insertWorkspaceResult,
      input: {
        filepath,
        append: true,
        onAppendCreateIfNotExists: true,
      },
      type: kGenerateTestFileType.txt,
    });

    assert.ok(dataBuffer);
    expect(dbFile.size).toBe(dataBuffer.byteLength);
  });

  test('should throw NotFoundError when append=true and onAppendCreateIfNotExists=false and file does not exist', async () => {
    const backend = new MemoryFilePersistenceProvider();
    kRegisterIjxUtils.fileProviderResolver(() => {
      return backend;
    });

    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    await expectErrorThrown(
      async () => {
        await uploadFileBaseTest({
          isMultipart: false,
          insertUserResult,
          insertWorkspaceResult,
          input: {
            filepath,
            append: true,
            onAppendCreateIfNotExists: false,
          },
          type: kGenerateTestFileType.txt,
        });
      },
      (error): boolean => {
        // Error may be serialized through queue, so check by name
        if (error instanceof NotFoundError) {
          return true;
        }
        if (error && typeof error === 'object' && 'name' in error) {
          return error.name === 'NotFoundError';
        }
        return false;
      }
    );
  });

  test('should append when append=true and onAppendCreateIfNotExists=false and file exists', async () => {
    const backend = new MemoryFilePersistenceProvider();
    kRegisterIjxUtils.fileProviderResolver(() => {
      return backend;
    });

    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;

    // Upload initial file
    const {
      resFile,
      dbFile: initialDbFile,
      dataBuffer: initialBuffer,
    } = await uploadFileBaseTest({
      isMultipart: false,
      insertUserResult,
      insertWorkspaceResult,
      type: kGenerateTestFileType.txt,
    });

    assert.ok(initialBuffer);
    const initialSize = initialBuffer.byteLength;

    // Append with onAppendCreateIfNotExists=false (file exists, so should work)
    const {dbFile: appendedDbFile, dataBuffer: appendBuffer} =
      await uploadFileBaseTest({
        isMultipart: false,
        insertUserResult,
        insertWorkspaceResult,
        input: {
          filepath: stringifyFilenamepath(resFile, workspace.rootname),
          append: true,
          onAppendCreateIfNotExists: false,
        },
        type: kGenerateTestFileType.txt,
      });

    assert.ok(appendBuffer);
    expect(appendedDbFile.size).toBe(initialSize + appendBuffer.byteLength);
    expect(appendedDbFile.version).toBe(initialDbFile.version + 1);
  });

  test('should throw UnsupportedOperationError when backend does not support append', async () => {
    // Create a backend that doesn't support append by extending MemoryFilePersistenceProvider
    class BackendWithoutAppend extends MemoryFilePersistenceProvider {
      supportsFeature = (feature: FilePersistenceProviderFeature): boolean => {
        if (feature === 'appendFile') {
          return false;
        }
        // Call parent's supportsFeature by accessing it directly
        const parentResult =
          MemoryFilePersistenceProvider.prototype.supportsFeature.call(
            this,
            feature
          );
        return parentResult;
      };
    }

    const backend = new BackendWithoutAppend();
    kRegisterIjxUtils.fileProviderResolver(() => {
      return backend;
    });

    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;

    // Upload initial file
    const {resFile} = await uploadFileBaseTest({
      isMultipart: false,
      insertUserResult,
      insertWorkspaceResult,
      type: kGenerateTestFileType.txt,
    });

    // Try to append - should fail
    await expectErrorThrown(
      async () => {
        await uploadFileBaseTest({
          isMultipart: false,
          insertUserResult,
          insertWorkspaceResult,
          input: {
            filepath: stringifyFilenamepath(resFile, workspace.rootname),
            append: true,
          },
          type: kGenerateTestFileType.txt,
        });
      },
      (error): boolean => {
        // Error may be serialized through queue, so check by name
        if (error instanceof UnsupportedOperationError) {
          return true;
        }
        if (error && typeof error === 'object' && 'name' in error) {
          return error.name === 'UnsupportedOperationError';
        }
        return false;
      }
    );
  });

  test('should not allow append with multipart uploads', async () => {
    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;
    const filepath = generateTestFilepathString({
      rootname: workspace.rootname,
    });

    // This should fail validation - append cannot be used with multipart
    await expectErrorThrown(
      async () => {
        await insertFileForTest(
          insertUserResult.userToken,
          insertWorkspaceResult.workspace,
          {
            filepath,
            append: true,
            clientMultipartId: 'test-multipart-id',
            part: 1,
          }
        );
      },
      (error): boolean => {
        // Validation error should be thrown - error may be an array from validation
        if (Array.isArray(error)) {
          return error.some((e): boolean => e instanceof Error);
        }
        return error instanceof Error;
      }
    );
  });

  test('should handle multiple appends correctly', async () => {
    const backend = new MemoryFilePersistenceProvider();
    kRegisterIjxUtils.fileProviderResolver(() => {
      return backend;
    });

    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;

    // Upload initial file
    const {
      resFile,
      dbFile: initialDbFile,
      dataBuffer: initialBuffer,
    } = await uploadFileBaseTest({
      isMultipart: false,
      insertUserResult,
      insertWorkspaceResult,
      type: kGenerateTestFileType.txt,
    });

    assert.ok(initialBuffer);
    let expectedSize = initialBuffer.byteLength;
    let expectedVersion = initialDbFile.version;

    // Append multiple times
    const appendCount = 3;
    const appendBuffers: Buffer[] = [initialBuffer];
    for (let i = 0; i < appendCount; i++) {
      const {dbFile, dataBuffer} = await uploadFileBaseTest({
        isMultipart: false,
        insertUserResult,
        insertWorkspaceResult,
        input: {
          filepath: stringifyFilenamepath(resFile, workspace.rootname),
          append: true,
        },
        type: kGenerateTestFileType.txt,
      });

      assert.ok(dataBuffer);
      appendBuffers.push(dataBuffer);
      expectedSize += dataBuffer.byteLength;
      expectedVersion += 1;

      expect(dbFile.size).toBe(expectedSize);
      expect(dbFile.version).toBe(expectedVersion);
    }

    // Verify final file contains all appended data
    const fimidaraMount = await kIjxSemantic.fileBackendMount().getOneByQuery({
      workspaceId: workspace.resourceId,
      backend: kFileBackendType.fimidara,
    });

    assert.ok(fimidaraMount);
    const finalDbFile = await kIjxSemantic
      .file()
      .getOneById(initialDbFile.resourceId);
    assert.ok(finalDbFile);

    const persistedFile = backend.getMemoryFile({
      mount: fimidaraMount,
      workspaceId: workspace.resourceId,
      filepath: stringifyFilenamepath(finalDbFile),
    });

    assert.ok(persistedFile);
    assert.ok(persistedFile.body);

    const combinedBuffer = Buffer.concat(appendBuffers);
    await expectFileBodyEqual(combinedBuffer, persistedFile.body);
    expect(finalDbFile.size).toBe(expectedSize);
  });

  test('should correctly calculate file size for append (old size + new size)', async () => {
    const backend = new MemoryFilePersistenceProvider();
    kRegisterIjxUtils.fileProviderResolver(() => {
      return backend;
    });

    const insertUserResult = await insertUserForTest();
    const insertWorkspaceResult = await insertWorkspaceForTest(
      insertUserResult.userToken
    );
    const {workspace} = insertWorkspaceResult;

    // Upload initial file
    const {
      resFile,
      dbFile: initialDbFile,
      dataBuffer: initialBuffer,
    } = await uploadFileBaseTest({
      isMultipart: false,
      insertUserResult,
      insertWorkspaceResult,
      type: kGenerateTestFileType.txt,
    });

    assert.ok(initialBuffer);
    const initialSize = initialBuffer.byteLength;
    expect(initialDbFile.size).toBe(initialSize);

    // Append data
    const {dbFile: appendedDbFile, dataBuffer: appendBuffer} =
      await uploadFileBaseTest({
        isMultipart: false,
        insertUserResult,
        insertWorkspaceResult,
        input: {
          filepath: stringifyFilenamepath(resFile, workspace.rootname),
          append: true,
        },
        type: kGenerateTestFileType.txt,
      });

    assert.ok(appendBuffer);
    const appendSize = appendBuffer.byteLength;
    const expectedSize = initialSize + appendSize;

    expect(appendedDbFile.size).toBe(expectedSize);
    expect(appendedDbFile.version).toBe(initialDbFile.version + 1);
  });
});
