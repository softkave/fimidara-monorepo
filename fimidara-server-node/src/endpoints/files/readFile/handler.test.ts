import {faker} from '@faker-js/faker';
import assert from 'assert';
import {difference} from 'lodash-es';
import {expectErrorThrownAsync, waitTimeout} from 'softkave-js-utils';
import {Readable} from 'stream';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import {
  FilePersistenceProvider,
  FileProviderResolver,
  PersistedFile,
} from '../../../contexts/file/types.js';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {kRegisterIjxUtils} from '../../../contexts/ijx/register.js';
import {getStringListQuery} from '../../../contexts/semantic/utils.js';
import {ResolvedMountEntry} from '../../../definitions/fileBackend.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {kFimidaraResourceType} from '../../../definitions/system.js';
import {
  FileUsageRecordArtifact,
  UsageRecordCategory,
  kUsageRecordCategory,
  kUsageRecordFulfillmentStatus,
  kUsageSummationType,
} from '../../../definitions/usageRecord.js';
import {UsageThresholdsByCategory} from '../../../definitions/workspace.js';
import {kSystemSessionAgent} from '../../../utils/agent.js';
import {pathJoin, streamToBuffer} from '../../../utils/fns.js';
import {newWorkspaceResource} from '../../../utils/resource.js';
import {makeUserSessionAgent} from '../../../utils/sessionUtils.js';
import {addRootnameToPath, stringifyFolderpath} from '../../folders/utils.js';
import RequestData from '../../RequestData.js';
import NoopFilePersistenceProviderContext from '../../testHelpers/context/file/NoopFilePersistenceProviderContext.js';
import {
  generateTestFileName,
  generateTestFilepathString,
} from '../../testHelpers/generate/file.js';
import {generateAndInsertUsageRecordList} from '../../testHelpers/generate/usageRecord.js';
import {
  getTestSessionAgent,
  kTestSessionAgentTypes,
} from '../../testHelpers/helpers/agent.js';
import {
  expectFileBodyEqual,
  expectFileBodyEqualById,
} from '../../testHelpers/helpers/file.js';
import {completeTests} from '../../testHelpers/helpers/testFns.js';
import {
  assertEndpointResultOk,
  initTests,
  insertFileBackendMountForTest,
  insertFileForTest,
  insertFolderForTest,
  insertPermissionItemsForTest,
  insertUserForTest,
  insertWorkspaceForTest,
  mockExpressRequestForPublicAgent,
  mockExpressRequestWithAgentToken,
} from '../../testHelpers/utils.js';
import {getCostForUsage} from '../../usageRecords/constants.js';
import {UsageLimitExceededError} from '../../usageRecords/errors.js';
import {getUsageRecordReportingPeriod} from '../../usageRecords/utils.js';
import {PermissionDeniedError} from '../../users/errors.js';
import {RangeNotSatisfiableError} from '../errors.js';
import {stringifyFilenamepath} from '../utils.js';
import readFile from './handler.js';
import {ReadFileEndpointParams} from './types.js';
import {generateETag} from './utils.js';
import sharp = require('sharp');

const kUsageRefreshWorkspaceIntervalMs = 100;
const kUsageCommitIntervalMs = 50;

let resolvedFileProvider: FileProviderResolver | undefined;

beforeAll(async () => {
  await initTests({
    usageRefreshWorkspaceIntervalMs: kUsageRefreshWorkspaceIntervalMs,
    usageCommitIntervalMs: kUsageCommitIntervalMs,
  });
});

beforeEach(async () => {
  resolvedFileProvider = kIjxUtils.fileProviderResolver();
});

afterAll(async () => {
  await completeTests();
});

afterEach(async () => {
  if (resolvedFileProvider) {
    kRegisterIjxUtils.fileProviderResolver(resolvedFileProvider);
  }
});

async function getUsageL2(workspaceId: string, category: UsageRecordCategory) {
  return await kIjxSemantic.usageRecord().getOneByQuery({
    ...getUsageRecordReportingPeriod(),
    status: kUsageRecordFulfillmentStatus.fulfilled,
    summationType: kUsageSummationType.month,
    workspaceId,
    category,
  });
}

async function getUsageL1(
  workspaceId: string,
  category: UsageRecordCategory,
  filepath: string[]
) {
  return await kIjxSemantic.usageRecord().getOneByQuery({
    ...getUsageRecordReportingPeriod(),
    status: kUsageRecordFulfillmentStatus.fulfilled,
    summationType: kUsageSummationType.instance,
    workspaceId,
    category,
    artifacts: {
      $elemMatch: {
        artifact: {
          $objMatch: getStringListQuery<FileUsageRecordArtifact>(
            filepath,
            /** prefix */ 'filepath',
            /** op */ '$regex',
            /** includeSizeOp */ true
          ),
        },
      },
    },
  });
}

describe('readFile', () => {
  test.each(kTestSessionAgentTypes)(
    'file returned using %s',
    async agentType => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(agentType, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });
      const {file} = await insertFileForTest(userToken, workspace);

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        /** data */ {filepath: stringifyFilenamepath(file, workspace.rootname)}
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      assert.ok(!Array.isArray(result.stream));
      await expectFileBodyEqualById(file.resourceId, result.stream as Readable);
    }
  );

  test('file resized', async () => {
    const {
      sessionAgent,
      workspace,
      adminUserToken: userToken,
    } = await getTestSessionAgent(kFimidaraResourceType.User, {
      permissions: {actions: [kFimidaraPermissionActions.readFile]},
    });
    const startWidth = 500;
    const startHeight = 500;
    const {file} = await insertFileForTest(
      userToken,
      workspace,
      /** file input */ {},
      /** file type */ 'png',
      /** image props */ {width: startWidth, height: startHeight}
    );

    const expectedWidth = 300;
    const expectedHeight = 300;
    const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
      mockExpressRequestWithAgentToken(sessionAgent.agentToken),
      /** data */ {
        filepath: stringifyFilenamepath(file, workspace.rootname),
        imageResize: {width: expectedWidth, height: expectedHeight},
      }
    );
    const result = await readFile(reqData);
    assertEndpointResultOk(result);

    assert.ok(!Array.isArray(result.stream));
    const resultBuffer = await streamToBuffer(result.stream as Readable);
    assert.ok(resultBuffer);
    const fileMetadata = await sharp(resultBuffer).metadata();
    expect(fileMetadata.width).toEqual(expectedWidth);
    expect(fileMetadata.height).toEqual(expectedHeight);
  });

  test.each(kTestSessionAgentTypes)(
    '%s can read file from public folder',
    async agentType => {
      const {workspace, adminUserToken: userToken} = await getTestSessionAgent(
        agentType
      );
      const {folder} = await insertFolderForTest(userToken, workspace);
      await insertPermissionItemsForTest(userToken, workspace.resourceId, {
        targetId: folder.resourceId,
        action: kFimidaraPermissionActions.readFile,
        access: true,
        entityId: workspace.publicPermissionGroupId,
      });

      const {file} = await insertFileForTest(userToken, workspace, {
        filepath: addRootnameToPath(
          pathJoin(
            folder.namepath.concat([
              generateTestFileName({includeStraySlashes: true}),
            ])
          ),
          workspace.rootname
        ),
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestForPublicAgent(),
        {filepath: stringifyFilenamepath(file, workspace.rootname)}
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);
    }
  );

  test.each(kTestSessionAgentTypes)(
    '%s can read public file',
    async agentType => {
      const {workspace, adminUserToken} = await getTestSessionAgent(agentType);
      const {file} = await insertFileForTest(adminUserToken, workspace);
      await insertPermissionItemsForTest(adminUserToken, workspace.resourceId, {
        targetId: file.resourceId,
        action: kFimidaraPermissionActions.readFile,
        access: true,
        entityId: workspace.publicPermissionGroupId,
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestForPublicAgent(),
        {filepath: stringifyFilenamepath(file, workspace.rootname)}
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);
    }
  );

  test.each(kTestSessionAgentTypes)(
    '%s cannot read private file',
    async agentType => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(agentType);

      const {file} = await insertFileForTest(userToken, workspace);
      await insertPermissionItemsForTest(userToken, workspace.resourceId, {
        targetId: file.resourceId,
        action: kFimidaraPermissionActions.readFile,
        access: false,
        entityId:
          agentType === kFimidaraResourceType.Public
            ? workspace.publicPermissionGroupId
            : sessionAgent.agentId,
      });

      try {
        const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
          mockExpressRequestForPublicAgent(),
          {filepath: stringifyFilenamepath(file, workspace.rootname)}
        );
        await readFile(reqData);
      } catch (error) {
        expect((error as Error)?.name).toBe(PermissionDeniedError.name);
      }
    }
  );

  test('reads file from other entries if primary entry is not present', async () => {
    const {userToken, rawUser} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {file} = await insertFileForTest(userToken, workspace, {
      filepath: generateTestFilepathString({rootname: workspace.rootname}),
    });
    const {mount} = await insertFileBackendMountForTest(userToken, workspace, {
      folderpath: stringifyFolderpath(
        {namepath: file.namepath.slice(0, -1)},
        workspace.rootname
      ),
    });

    await kIjxSemantic.utils().withTxn(async opts => {
      const entry = newWorkspaceResource<ResolvedMountEntry>(
        makeUserSessionAgent(rawUser, userToken),
        kFimidaraResourceType.ResolvedMountEntry,
        workspace.resourceId,
        /** seed */ {
          mountId: mount.resourceId,
          forType: kFimidaraResourceType.File,
          forId: file.resourceId,
          backendNamepath: file.namepath,
          backendExt: file.ext,
          fimidaraNamepath: file.namepath,
          fimidaraExt: file.ext,
          persisted: {
            mountId: mount.resourceId,
            encoding: file.encoding,
            mimetype: file.mimetype,
            size: file.size,
            lastUpdatedAt: file.lastUpdatedAt,
            filepath: stringifyFilenamepath(file),
            raw: undefined,
          },
        }
      );

      await kIjxSemantic.resolvedMountEntry().insertItem(entry, opts);
    });

    const testBuffer = Buffer.from('Reading from secondary mount source');
    const testStream = Readable.from([testBuffer]);
    kRegisterIjxUtils.fileProviderResolver(forMount => {
      if (mount.resourceId === forMount.resourceId) {
        class SecondaryFileProvider
          extends NoopFilePersistenceProviderContext
          implements FilePersistenceProvider
        {
          readFile = async (): Promise<PersistedFile> => ({
            body: testStream,
            size: testBuffer.byteLength,
          });
        }

        return new SecondaryFileProvider();
      } else {
        return new NoopFilePersistenceProviderContext();
      }
    });

    const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {filepath: stringifyFilenamepath(file, workspace.rootname)}
    );
    const result = await readFile(reqData);
    assertEndpointResultOk(result);

    assert.ok(!Array.isArray(result.stream));
    await expectFileBodyEqual(testBuffer, result.stream as Readable);
  });

  test('returns an empty stream if file exists and backends do not have file', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {file} = await insertFileForTest(userToken, workspace, {
      filepath: generateTestFilepathString({rootname: workspace.rootname}),
    });

    kRegisterIjxUtils.fileProviderResolver(() => {
      return new NoopFilePersistenceProviderContext();
    });

    const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {filepath: stringifyFilenamepath(file, workspace.rootname)}
    );
    const result = await readFile(reqData);
    assertEndpointResultOk(result);

    const testBuffer = Buffer.from([]);
    assert.ok(!Array.isArray(result.stream));
    await expectFileBodyEqual(testBuffer, result.stream as Readable);
  });

  test('increments usage', async () => {
    const {
      adminUserToken: userToken,
      sessionAgent,
      workspace,
    } = await getTestSessionAgent(kFimidaraResourceType.User, {
      permissions: {
        actions: [kFimidaraPermissionActions.readFile],
      },
    });
    const {file} = await insertFileForTest(userToken, workspace);

    const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
      mockExpressRequestWithAgentToken(sessionAgent.agentToken),
      /** data */ {filepath: stringifyFilenamepath(file, workspace.rootname)}
    );
    const result = await readFile(reqData);
    assertEndpointResultOk(result);

    await waitTimeout(kUsageCommitIntervalMs * 1.5);
    const [dbBandwidthOutUsageL1, dbBandwidthOutUsageL2, dbTotalUsageL2] =
      await Promise.all([
        getUsageL1(
          workspace.resourceId,
          kUsageRecordCategory.bandwidthOut,
          file.namepath
        ),
        getUsageL2(workspace.resourceId, kUsageRecordCategory.bandwidthOut),
        getUsageL2(workspace.resourceId, kUsageRecordCategory.total),
      ]);

    assert.ok(dbBandwidthOutUsageL1);
    assert.ok(dbBandwidthOutUsageL2);
    assert.ok(dbTotalUsageL2);

    expect(dbBandwidthOutUsageL2.usage).toBe(file.size);
    expect(dbBandwidthOutUsageL2.usageCost).toBe(
      getCostForUsage(kUsageRecordCategory.bandwidthOut, file.size)
    );

    expect(dbTotalUsageL2.usageCost).toBeGreaterThanOrEqual(
      dbBandwidthOutUsageL2.usageCost
    );
  });

  test.each([kUsageRecordCategory.bandwidthOut, kUsageRecordCategory.total])(
    'fails if usage exceeded for category=%s',
    async category => {
      const {
        adminUserToken: userToken,
        sessionAgent,
        workspace,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      // create a usage record so we can use their IDs to retrieve them later from
      // the db
      const [[usageL2], [usageDroppedL2]] = await Promise.all([
        generateAndInsertUsageRecordList(/** count */ 1, {
          status: kUsageRecordFulfillmentStatus.fulfilled,
          summationType: kUsageSummationType.month,
          usageCost: 0,
          ...getUsageRecordReportingPeriod(),
          usage: 0,
          workspaceId: workspace.resourceId,
          category,
        }),
        generateAndInsertUsageRecordList(/** count */ 1, {
          status: kUsageRecordFulfillmentStatus.dropped,
          summationType: kUsageSummationType.month,
          usageCost: 0,
          ...getUsageRecordReportingPeriod(),
          usage: 0,
          workspaceId: workspace.resourceId,
          category,
        }),
      ]);
      assert.ok(usageL2);

      const {file} = await insertFileForTest(userToken, workspace);

      await kIjxSemantic.utils().withTxn(opts =>
        kIjxSemantic.workspace().updateOneById(
          workspace.resourceId,
          {
            usageThresholds: {
              [category]: {
                lastUpdatedBy: kSystemSessionAgent,
                budget: usageL2.usageCost - 1,
                lastUpdatedAt: Date.now(),
                usage: usageL2.usage - 1,
                category,
              },
            },
          },
          opts
        )
      );

      await waitTimeout(kUsageRefreshWorkspaceIntervalMs * 2);
      await expectErrorThrownAsync(
        async () => {
          const reqData =
            RequestData.fromExpressRequest<ReadFileEndpointParams>(
              mockExpressRequestWithAgentToken(sessionAgent.agentToken),
              /** data */ {
                filepath: stringifyFilenamepath(file, workspace.rootname),
              }
            );
          await readFile(reqData);
        },
        {
          expectFn: error => {
            expect(error).toBeInstanceOf(UsageLimitExceededError);
            assert.ok(error instanceof UsageLimitExceededError);
            expect(error.blockingCategory).toBe(category);
          },
        }
      );

      await waitTimeout(kUsageCommitIntervalMs * 1.5);

      const [dbUsageL2, dbUsageDroppedL2] = await Promise.all([
        kIjxSemantic.usageRecord().getOneById(usageL2.resourceId),
        usageDroppedL2
          ? kIjxSemantic.usageRecord().getOneById(usageDroppedL2.resourceId)
          : undefined,
      ]);
      assert.ok(dbUsageL2);

      expect(dbUsageL2.usage).toBeGreaterThanOrEqual(usageL2.usage);
      expect(dbUsageL2.usageCost).toBeGreaterThanOrEqual(usageL2.usageCost);

      if (category !== kUsageRecordCategory.total) {
        assert.ok(dbUsageDroppedL2);
        expect(dbUsageDroppedL2.usage).toBe(usageDroppedL2.usage + file.size);
        expect(dbUsageDroppedL2.usageCost).toBe(
          usageDroppedL2.usageCost + getCostForUsage(category, file.size)
        );
      }
    }
  );

  test('does not fail if usage exceeded for non total or bout usage', async () => {
    const {
      sessionAgent,
      workspace,
      adminUserToken: userToken,
    } = await getTestSessionAgent(kFimidaraResourceType.User, {
      permissions: {
        actions: [kFimidaraPermissionActions.readFile],
      },
    });
    const {file} = await insertFileForTest(userToken, workspace);
    const usage = faker.number.int({min: 1});
    const usageCost = faker.number.int({min: 1});
    const categories = difference(Object.values(kUsageRecordCategory), [
      kUsageRecordCategory.bandwidthOut,
      kUsageRecordCategory.total,
    ]);
    await kIjxSemantic.utils().withTxn(opts =>
      kIjxSemantic.workspace().updateOneById(
        workspace.resourceId,
        {
          usageThresholds: {
            ...categories.reduce(
              (acc, category) => ({
                [category]: {
                  lastUpdatedBy: kSystemSessionAgent,
                  lastUpdatedAt: Date.now(),
                  budget: usageCost,
                  category,
                  usage,
                },
              }),
              {} as UsageThresholdsByCategory
            ),
          },
        },
        opts
      )
    );

    const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
      mockExpressRequestWithAgentToken(sessionAgent.agentToken),
      /** data */ {
        filepath: stringifyFilenamepath(file, workspace.rootname),
      }
    );
    const result = await readFile(reqData);
    assertEndpointResultOk(result);
  });

  describe('range requests', () => {
    test('reads file with single range request', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      // Create a file with known content
      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          ranges: [{start: 5, end: 9}],
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      const expectedContent = fileContent.slice(5, 10);
      assert.ok(!Array.isArray(result.stream));
      await expectFileBodyEqual(expectedContent, result.stream as Readable);
      expect(result.ranges).toEqual([{start: 5, end: 9}]);
      expect(result.isMultipart).toBe(false);
    });

    test('reads file with multiple range requests (multipart)', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          ranges: [
            {start: 0, end: 4},
            {start: 10, end: 14},
          ],
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      expect(result.isMultipart).toBe(true);
      expect(Array.isArray(result.stream)).toBe(true);
      expect(result.ranges).toEqual([
        {start: 0, end: 4},
        {start: 10, end: 14},
      ]);

      // Verify multipart streams
      const streams = result.stream as Readable[];
      expect(streams.length).toBe(2);

      const firstRangeContent = await streamToBuffer(streams[0]);
      const secondRangeContent = await streamToBuffer(streams[1]);

      expect(firstRangeContent).toEqual(fileContent.slice(0, 5));
      expect(secondRangeContent).toEqual(fileContent.slice(10, 15));
    });

    test('parses Range header and reads file', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          rangeHeader: 'bytes=5-9',
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      const expectedContent = fileContent.slice(5, 10);
      assert.ok(!Array.isArray(result.stream));
      await expectFileBodyEqual(expectedContent, result.stream as Readable);
      expect(result.ranges).toEqual([{start: 5, end: 9}]);
    });

    test('parses multiple ranges from Range header', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          rangeHeader: 'bytes=0-4,10-14',
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      expect(result.isMultipart).toBe(true);
      expect(Array.isArray(result.stream)).toBe(true);
      expect(result.ranges).toEqual([
        {start: 0, end: 4},
        {start: 10, end: 14},
      ]);
    });

    test('validates If-Range header with ETag and honors range when valid', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      // Get the expected ETag
      const etag = generateETag(file.lastUpdatedAt, file.size);

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          rangeHeader: 'bytes=5-9',
          ifRangeHeader: etag,
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      const expectedContent = fileContent.slice(5, 10);
      assert.ok(!Array.isArray(result.stream));
      await expectFileBodyEqual(expectedContent, result.stream as Readable);
      expect(result.ranges).toEqual([{start: 5, end: 9}]);
    });

    test('ignores range when If-Range header does not match', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          rangeHeader: 'bytes=5-9',
          ifRangeHeader: '"invalid-etag"',
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      // Should return full file when If-Range doesn't match
      assert.ok(!Array.isArray(result.stream));
      await expectFileBodyEqual(fileContent, result.stream as Readable);
      expect(result.ranges).toBeUndefined();
    });

    test('validates If-Range header with Last-Modified date', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      // Use Last-Modified date in If-Range header
      const lastModifiedDate = new Date(file.lastUpdatedAt!).toUTCString();

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          rangeHeader: 'bytes=5-9',
          ifRangeHeader: lastModifiedDate,
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      const expectedContent = fileContent.slice(5, 10);
      assert.ok(!Array.isArray(result.stream));
      await expectFileBodyEqual(expectedContent, result.stream as Readable);
      expect(result.ranges).toEqual([{start: 5, end: 9}]);
    });

    test('disables ranges when image transforms are requested', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const {file} = await insertFileForTest(
        userToken,
        workspace,
        /** file input */ {},
        /** file type */ 'png',
        /** image props */ {width: 500, height: 500}
      );

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          rangeHeader: 'bytes=0-99',
          imageResize: {width: 300, height: 300},
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      // Ranges should be disabled
      expect(result.ranges).toBeUndefined();
      expect(result.isMultipart).toBeUndefined();
    });

    test('disables ranges when imageFormat is requested', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const {file} = await insertFileForTest(
        userToken,
        workspace,
        /** file input */ {},
        /** file type */ 'png',
        /** image props */ {width: 500, height: 500}
      );

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          rangeHeader: 'bytes=0-99',
          imageFormat: 'jpeg',
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      expect(result.ranges).toBeUndefined();
      expect(result.isMultipart).toBeUndefined();
    });

    test('throws RangeNotSatisfiableError for invalid range header', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      await expectErrorThrownAsync(
        async () => {
          const reqData =
            RequestData.fromExpressRequest<ReadFileEndpointParams>(
              mockExpressRequestWithAgentToken(sessionAgent.agentToken),
              {
                filepath: stringifyFilenamepath(file, workspace.rootname),
                rangeHeader: 'bytes=100-200', // Out of range
              }
            );
          await readFile(reqData);
        },
        {
          expectFn: error => {
            console.error(error);
            expect(error).toBeInstanceOf(RangeNotSatisfiableError);
            assert.ok(error instanceof RangeNotSatisfiableError);
            expect(error.fileSize).toBe(fileContent.byteLength);
          },
        }
      );
    });

    test('throws RangeNotSatisfiableError for empty file with range request', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const emptyContent = Buffer.from('');
      const fileStream = Readable.from([emptyContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: 0,
      });

      await expectErrorThrownAsync(
        async () => {
          const reqData =
            RequestData.fromExpressRequest<ReadFileEndpointParams>(
              mockExpressRequestWithAgentToken(sessionAgent.agentToken),
              {
                filepath: stringifyFilenamepath(file, workspace.rootname),
                rangeHeader: 'bytes=0-0',
              }
            );
          await readFile(reqData);
        },
        {
          expectFn: error => {
            expect(error).toBeInstanceOf(RangeNotSatisfiableError);
            assert.ok(error instanceof RangeNotSatisfiableError);
            expect(error.fileSize).toBe(0);
          },
        }
      );
    });

    test('handles suffix range request (-500)', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          rangeHeader: 'bytes=-5', // Last 5 bytes
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      // Last 5 bytes: 'FGHIJ' (indices 15-19)
      const expectedContent = fileContent.slice(-5);
      assert.ok(!Array.isArray(result.stream));
      await expectFileBodyEqual(expectedContent, result.stream as Readable);
      expect(result.ranges).toEqual([{start: 15, end: 19}]);
    });

    test('handles open-ended range request (9500-)', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          rangeHeader: 'bytes=15-', // From byte 15 to end
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      // From byte 15 to end: 'FGHIJ'
      const expectedContent = fileContent.slice(15);
      assert.ok(!Array.isArray(result.stream));
      await expectFileBodyEqual(expectedContent, result.stream as Readable);
      expect(result.ranges).toEqual([{start: 15, end: 19}]);
    });

    test('returns correct ETag and lastModified in range response', async () => {
      const {
        sessionAgent,
        workspace,
        adminUserToken: userToken,
      } = await getTestSessionAgent(kFimidaraResourceType.User, {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      });

      const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
      const fileStream = Readable.from([fileContent]);
      const {file} = await insertFileForTest(userToken, workspace, {
        data: fileStream,
        size: fileContent.byteLength,
      });

      const reqData = RequestData.fromExpressRequest<ReadFileEndpointParams>(
        mockExpressRequestWithAgentToken(sessionAgent.agentToken),
        {
          filepath: stringifyFilenamepath(file, workspace.rootname),
          ranges: [{start: 5, end: 9}],
        }
      );
      const result = await readFile(reqData);
      assertEndpointResultOk(result);

      expect(result.lastModified).toBe(file.lastUpdatedAt);
      expect(result.etag).toBe(generateETag(file.lastUpdatedAt, file.size));
    });
  });
});
