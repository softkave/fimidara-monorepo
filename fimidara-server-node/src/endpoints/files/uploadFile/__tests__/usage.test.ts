import {faker} from '@faker-js/faker';
import assert from 'assert';
import {difference} from 'lodash-es';
import {expectErrorThrownAsync, waitTimeout} from 'softkave-js-utils';
import {Readable} from 'stream';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kIjxSemantic} from '../../../../contexts/ijx/injectables.js';
import {getStringListQuery} from '../../../../contexts/semantic/utils.js';
import {kFimidaraPermissionActions} from '../../../../definitions/permissionItem.js';
import {kFimidaraResourceType} from '../../../../definitions/system.js';
import {
  FileUsageRecordArtifact,
  UsageRecordCategory,
  kUsageRecordCategory,
  kUsageRecordFulfillmentStatus,
  kUsageSummationType,
} from '../../../../definitions/usageRecord.js';
import {UsageThresholdsByCategory} from '../../../../definitions/workspace.js';
import {kSystemSessionAgent} from '../../../../utils/agent.js';
import {generateAndInsertUsageRecordList} from '../../../testHelpers/generate/usageRecord.js';
import {getTestSessionAgent} from '../../../testHelpers/helpers/agent.js';
import {completeTests} from '../../../testHelpers/helpers/testFns.js';
import {initTests} from '../../../testHelpers/utils.js';
import {getStringCostForUsage} from '../../../usageRecords/constants.js';
import {getUsageRecordReportingPeriod} from '../../../usageRecords/utils.js';
import {stringifyFilenamepath} from '../../utils.js';
import {simpleRunUpload} from '../testutils/testUploadFns.js';
import {UploadFileEndpointParams} from '../types.js';

const kUsageCommitIntervalMs = 50;

beforeAll(async () => {
  await initTests({usageCommitIntervalMs: kUsageCommitIntervalMs});
});

afterAll(async () => {
  await completeTests();
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

describe.each([{isMultipart: true}, {isMultipart: false}])(
  'usage.uploadFile, params=%s',
  ({isMultipart}) => {
    test('increments usage', async () => {
      const {adminUserToken: userToken, workspace} = await getTestSessionAgent(
        kFimidaraResourceType.User,
        {
          permissions: {
            actions: [kFimidaraPermissionActions.readFile],
          },
        }
      );

      const {dbFile} = await simpleRunUpload(isMultipart, {
        userToken,
        workspace,
      });

      await waitTimeout(kUsageCommitIntervalMs * 2);
      const [
        dbBandwidthInUsageL1,
        dbStorageUsageL1,
        dbStorageEverConsumedUsageL1,
        dbBandwidthInUsageL2,
        dbStorageUsageL2,
        dbStorageEverConsumedUsageL2,
        dbTotalUsageL2,
        ...otherDbUsageL2s
      ] = await Promise.all([
        getUsageL1(
          workspace.resourceId,
          kUsageRecordCategory.bandwidthIn,
          dbFile.namepath
        ),
        getUsageL1(
          workspace.resourceId,
          kUsageRecordCategory.storage,
          dbFile.namepath
        ),
        getUsageL1(
          workspace.resourceId,
          kUsageRecordCategory.storageEverConsumed,
          dbFile.namepath
        ),
        getUsageL2(workspace.resourceId, kUsageRecordCategory.bandwidthIn),
        getUsageL2(workspace.resourceId, kUsageRecordCategory.storage),
        getUsageL2(
          workspace.resourceId,
          kUsageRecordCategory.storageEverConsumed
        ),
        getUsageL2(workspace.resourceId, kUsageRecordCategory.total),
        ...difference(Object.values(kUsageRecordCategory), [
          kUsageRecordCategory.bandwidthIn,
          kUsageRecordCategory.storage,
          kUsageRecordCategory.storageEverConsumed,
          kUsageRecordCategory.total,
        ]).map(category => getUsageL2(workspace.resourceId, category)),
      ]);

      assert.ok(dbBandwidthInUsageL1);
      assert.ok(dbStorageUsageL1);
      assert.ok(dbStorageEverConsumedUsageL1);
      assert.ok(dbBandwidthInUsageL2);
      assert.ok(dbStorageUsageL2);
      assert.ok(dbStorageEverConsumedUsageL2);
      assert.ok(dbTotalUsageL2);

      expect(dbBandwidthInUsageL2.usage).toBe(dbFile.size);
      expect(dbBandwidthInUsageL2.usageCost.toFixed(2)).toBe(
        getStringCostForUsage(kUsageRecordCategory.bandwidthIn, dbFile.size)
      );

      expect(dbStorageUsageL2.usage).toBe(dbFile.size);
      expect(dbStorageUsageL2.usageCost.toFixed(2)).toBe(
        getStringCostForUsage(kUsageRecordCategory.storage, dbFile.size)
      );

      expect(dbStorageEverConsumedUsageL2.usage).toBe(dbFile.size);
      expect(dbStorageEverConsumedUsageL2.usageCost.toFixed(2)).toBe(
        getStringCostForUsage(
          kUsageRecordCategory.storageEverConsumed,
          dbFile.size
        )
      );

      // TODO: doing string + slice because I think JS decimals are not aligning.
      // The values ar every close but not completely equal
      expect(dbTotalUsageL2.usageCost.toFixed(2)).toBe(
        (
          dbBandwidthInUsageL2.usageCost +
          dbStorageUsageL2.usageCost +
          dbStorageEverConsumedUsageL2.usageCost
        ).toFixed(2)
      );

      otherDbUsageL2s.forEach(dbUsageL2 => {
        expect(dbUsageL2).toBeFalsy();
      });
    });

    test.each([
      kUsageRecordCategory.storageEverConsumed,
      kUsageRecordCategory.bandwidthIn,
      kUsageRecordCategory.storage,
      kUsageRecordCategory.total,
    ])('fails if usage exceeded for category=%s', async category => {
      const {workspace, adminUserToken: userToken} = await getTestSessionAgent(
        kFimidaraResourceType.User,
        {
          permissions: {
            actions: [kFimidaraPermissionActions.readFile],
          },
        }
      );

      const [[usageL2], [usageDroppedL2]] = await Promise.all([
        generateAndInsertUsageRecordList(/** count */ 1, {
          status: kUsageRecordFulfillmentStatus.fulfilled,
          summationType: kUsageSummationType.month,
          ...getUsageRecordReportingPeriod(),
          usage: faker.number.int({min: 1, max: 100}),
          workspaceId: workspace.resourceId,
          category,
        }),
        category !== kUsageRecordCategory.total
          ? generateAndInsertUsageRecordList(/** count */ 1, {
              status: kUsageRecordFulfillmentStatus.dropped,
              summationType: kUsageSummationType.month,
              ...getUsageRecordReportingPeriod(),
              usage: faker.number.int({min: 1, max: 100}),
              workspaceId: workspace.resourceId,
              category,
            })
          : [],
      ]);

      await kIjxSemantic.utils().withTxn(opts =>
        kIjxSemantic.workspace().updateOneById(
          workspace.resourceId,
          {
            usageThresholds: {
              [category]: {
                lastUpdatedBy: kSystemSessionAgent,
                budget: usageL2.usageCost / 2,
                lastUpdatedAt: Date.now(),
                usage: usageL2.usage / 2,
                category,
              },
            },
          },
          opts
        )
      );

      const buf = Buffer.from('Hello, world!');
      const fileInput: Partial<UploadFileEndpointParams> = {
        data: Readable.from([buf]),
        size: buf.byteLength,
      };

      await expectErrorThrownAsync(
        async () => {
          await simpleRunUpload(isMultipart, {userToken, workspace, fileInput});
        },
        {
          expectFn: error => {
            assert.ok(error instanceof Error);
            expect(error.message).toMatch(/Usage limit exceeded/);
          },
        }
      );

      const [dbUsageL2, dbUsageDroppedL2] = await Promise.all([
        kIjxSemantic.usageRecord().getOneById(usageL2.resourceId),
        usageDroppedL2
          ? kIjxSemantic.usageRecord().getOneById(usageDroppedL2.resourceId)
          : undefined,
      ]);
      assert.ok(dbUsageL2);

      expect(dbUsageL2.usage).toBe(usageL2.usage);
      expect(dbUsageL2.usageCost).toBe(usageL2.usageCost);

      if (category !== kUsageRecordCategory.total) {
        assert.ok(dbUsageDroppedL2);
        expect(dbUsageDroppedL2.usage).toBeGreaterThanOrEqual(
          usageDroppedL2.usage
        );
        expect(dbUsageDroppedL2.usageCost).toBeGreaterThanOrEqual(
          usageDroppedL2.usageCost
        );
      }
    });

    test('does not fail if usage exceeded for non total or bout usage', async () => {
      const {workspace, adminUserToken: userToken} = await getTestSessionAgent(
        kFimidaraResourceType.User,
        {
          permissions: {
            actions: [kFimidaraPermissionActions.readFile],
          },
        }
      );
      const usage = faker.number.int({min: 1});
      const usageCost = faker.number.int({min: 1});
      const categories = difference(Object.values(kUsageRecordCategory), [
        kUsageRecordCategory.bandwidthIn,
        kUsageRecordCategory.storage,
        kUsageRecordCategory.storageEverConsumed,
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

      await simpleRunUpload(isMultipart, {userToken, workspace});
    });
  }
);

describe('usage.uploadFile append mode', () => {
  // Append mode only works with non-multipart uploads
  test('append mode: storage usage only increments by appended size (does not decrement old size)', async () => {
    const {adminUserToken: userToken, workspace} = await getTestSessionAgent(
      kFimidaraResourceType.User,
      {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      }
    );

    // Upload initial file (non-multipart)
    const {dbFile: initialFile, dataBuffer: initialBuffer} =
      await simpleRunUpload(false, {
        userToken,
        workspace,
      });

    assert.ok(initialBuffer);
    const initialSize = initialBuffer.byteLength;

    // Wait for usage to be committed
    await waitTimeout(kUsageCommitIntervalMs * 2);

    // Get initial storage usage
    const initialStorageUsageL2 = await getUsageL2(
      workspace.resourceId,
      kUsageRecordCategory.storage
    );
    assert.ok(initialStorageUsageL2);
    const initialStorageUsage = initialStorageUsageL2.usage;

    // Append to the file (non-multipart)
    const {dbFile: appendedFile, dataBuffer: appendBuffer} =
      await simpleRunUpload(false, {
        userToken,
        workspace,
        fileInput: {
          filepath: stringifyFilenamepath(initialFile, workspace.rootname),
          append: true,
          onAppendCreateIfNotExists: false,
        },
      });

    assert.ok(appendBuffer);
    const appendSize = appendBuffer.byteLength;
    const expectedFinalSize = initialSize + appendSize;

    // Verify file size is sum of initial and appended
    expect(appendedFile.size).toBe(expectedFinalSize);

    // Wait for usage to be committed
    await waitTimeout(kUsageCommitIntervalMs * 2);

    // Get final storage usage
    const finalStorageUsageL2 = await getUsageL2(
      workspace.resourceId,
      kUsageRecordCategory.storage
    );
    assert.ok(finalStorageUsageL2);

    // For append: storage usage should only increase by appended size
    // (not decrement old size first, then increment new size)
    const storageUsageIncrease =
      finalStorageUsageL2.usage - initialStorageUsage;
    expect(storageUsageIncrease).toBe(appendSize);

    // Verify storage usage equals the final file size
    expect(finalStorageUsageL2.usage).toBe(expectedFinalSize);
    expect(finalStorageUsageL2.usageCost.toFixed(2)).toBe(
      getStringCostForUsage(kUsageRecordCategory.storage, expectedFinalSize)
    );
  });

  test('append mode: bandwidth and storageEverConsumed increment normally', async () => {
    const {adminUserToken: userToken, workspace} = await getTestSessionAgent(
      kFimidaraResourceType.User,
      {
        permissions: {
          actions: [kFimidaraPermissionActions.readFile],
        },
      }
    );

    // Upload initial file (non-multipart)
    const {dbFile: initialFile, dataBuffer: initialBuffer} =
      await simpleRunUpload(false, {
        userToken,
        workspace,
      });

    assert.ok(initialBuffer);
    const initialSize = initialBuffer.byteLength;

    // Wait for usage to be committed
    await waitTimeout(kUsageCommitIntervalMs * 2);

    // Get initial usage
    const [initialBandwidthUsageL2, initialStorageEverConsumedUsageL2] =
      await Promise.all([
        getUsageL2(workspace.resourceId, kUsageRecordCategory.bandwidthIn),
        getUsageL2(
          workspace.resourceId,
          kUsageRecordCategory.storageEverConsumed
        ),
      ]);

    assert.ok(initialBandwidthUsageL2);
    assert.ok(initialStorageEverConsumedUsageL2);
    const initialBandwidthUsage = initialBandwidthUsageL2.usage;
    const initialStorageEverConsumedUsage =
      initialStorageEverConsumedUsageL2.usage;

    // Append to the file (non-multipart)
    const {dataBuffer: appendBuffer} = await simpleRunUpload(false, {
      userToken,
      workspace,
      fileInput: {
        filepath: stringifyFilenamepath(initialFile, workspace.rootname),
        append: true,
        onAppendCreateIfNotExists: false,
      },
    });

    assert.ok(appendBuffer);
    const appendSize = appendBuffer.byteLength;

    // Wait for usage to be committed
    await waitTimeout(kUsageCommitIntervalMs * 2);

    // Get final usage
    const [finalBandwidthUsageL2, finalStorageEverConsumedUsageL2] =
      await Promise.all([
        getUsageL2(workspace.resourceId, kUsageRecordCategory.bandwidthIn),
        getUsageL2(
          workspace.resourceId,
          kUsageRecordCategory.storageEverConsumed
        ),
      ]);

    assert.ok(finalBandwidthUsageL2);
    assert.ok(finalStorageEverConsumedUsageL2);

    // Bandwidth and storageEverConsumed should increment by appended size
    // (same as regular upload)
    expect(finalBandwidthUsageL2.usage - initialBandwidthUsage).toBe(
      appendSize
    );
    expect(
      finalStorageEverConsumedUsageL2.usage - initialStorageEverConsumedUsage
    ).toBe(appendSize);

    // Verify costs
    expect(finalBandwidthUsageL2.usageCost.toFixed(2)).toBe(
      getStringCostForUsage(
        kUsageRecordCategory.bandwidthIn,
        initialSize + appendSize
      )
    );
    expect(finalStorageEverConsumedUsageL2.usageCost.toFixed(2)).toBe(
      getStringCostForUsage(
        kUsageRecordCategory.storageEverConsumed,
        initialSize + appendSize
      )
    );
  });
});
