import {describe, expect, test} from 'vitest';
import {kUsageRecordCategory} from '../../../definitions/usageRecord.js';
import {getCostForUsage} from '../../../endpoints/usageRecords/constants.js';
import {kSystemSessionAgent} from '../../../utils/agent.js';
import {
  buildMonthlyUsageRecordsFromStorage,
  sumWorkspaceFileStorageBytes,
} from '../rebuildUsageRecordsFromFiles.js';

describe('rebuildUsageRecordsFromFiles', () => {
  test('sumWorkspaceFileStorageBytes totals file sizes', () => {
    expect(
      sumWorkspaceFileStorageBytes([
        {size: 100},
        {size: 250},
        {size: 0},
      ])
    ).toBe(350);
  });

  test('buildMonthlyUsageRecordsFromStorage sets storage and storageEver equally', () => {
    const storageBytes = 4096;
    const records = buildMonthlyUsageRecordsFromStorage({
      agent: kSystemSessionAgent,
      workspaceId: 'workspace-1',
      storageBytes,
      month: 3,
      year: 2025,
    });

    const storage = records.find(
      record => record.category === kUsageRecordCategory.storage
    );
    const storageEver = records.find(
      record => record.category === kUsageRecordCategory.storageEverConsumed
    );
    const total = records.find(
      record => record.category === kUsageRecordCategory.total
    );

    expect(storage?.usage).toBe(storageBytes);
    expect(storageEver?.usage).toBe(storageBytes);
    expect(total?.usage).toBe(0);
    expect(total?.usageCost).toBe(
      getCostForUsage(kUsageRecordCategory.storage, storageBytes)
    );
    expect(storage?.persistent).toBe(true);
    expect(storageEver?.persistent).toBe(false);
  });
});
