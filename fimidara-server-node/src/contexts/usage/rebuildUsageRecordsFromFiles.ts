import {kIjxData, kIjxSemantic} from '../ijx/injectables.js';
import {SemanticProviderOpParams} from '../semantic/types.js';
import {File} from '../../definitions/file.js';
import {
  Agent,
  kFimidaraResourceType,
} from '../../definitions/system.js';
import {
  UsageRecord,
  UsageRecordCategory,
  kUsageRecordCategory,
  kUsageRecordFulfillmentStatus,
  kUsageSummationType,
} from '../../definitions/usageRecord.js';
import {Workspace} from '../../definitions/workspace.js';
import {getCostForUsage} from '../../endpoints/usageRecords/constants.js';
import {
  getUsageRecordReportingPeriod,
  isUsageRecordPersistent,
} from '../../endpoints/usageRecords/utils.js';
import {newWorkspaceResource} from '../../utils/resource.js';

export function sumWorkspaceFileStorageBytes(files: Pick<File, 'size'>[]) {
  return files.reduce((total, file) => total + (file.size || 0), 0);
}

export function buildMonthlyUsageRecordsFromStorage(params: {
  agent: Agent;
  workspaceId: string;
  storageBytes: number;
  month: number;
  year: number;
}): UsageRecord[] {
  const {agent, workspaceId, storageBytes, month, year} = params;
  const categories: UsageRecordCategory[] = [
    kUsageRecordCategory.storage,
    kUsageRecordCategory.storageEverConsumed,
    kUsageRecordCategory.total,
  ];

  return categories.map(category => {
    const status = kUsageRecordFulfillmentStatus.fulfilled;
    const usage =
      category === kUsageRecordCategory.total ? 0 : storageBytes;
    const usageCost =
      category === kUsageRecordCategory.total
        ? getCostForUsage(kUsageRecordCategory.storage, storageBytes)
        : getCostForUsage(category, storageBytes);

    return newWorkspaceResource<UsageRecord>(
      agent,
      kFimidaraResourceType.UsageRecord,
      workspaceId,
      {
        summationType: kUsageSummationType.month,
        month,
        year,
        category,
        status,
        usage,
        usageCost,
        artifacts: [],
        persistent: isUsageRecordPersistent({category, status}),
      }
    );
  });
}

export async function deleteAllUsageRecords(opts?: SemanticProviderOpParams) {
  await kIjxData.usageRecord().deleteManyByQuery({}, opts);
}

export async function rebuildUsageRecordsFromFiles(agent: Agent) {
  const {month, year} = getUsageRecordReportingPeriod();

  await kIjxSemantic.utils().withTxn(async opts => {
    await deleteAllUsageRecords(opts);

    const workspaces = await kIjxSemantic.workspace().getManyByQuery(
      {isDeleted: false},
      opts
    );

    const usageRecords: UsageRecord[] = [];

    for (const workspace of workspaces) {
      usageRecords.push(
        ...(await buildWorkspaceUsageRecordsFromFiles({
          agent,
          workspace,
          month,
          year,
          opts,
        }))
      );
    }

    if (usageRecords.length > 0) {
      await kIjxSemantic.usageRecord().insertItem(usageRecords, opts);
    }
  });
}

export async function buildWorkspaceUsageRecordsFromFiles(params: {
  agent: Agent;
  workspace: Workspace;
  month: number;
  year: number;
  opts?: SemanticProviderOpParams;
}) {
  const {agent, workspace, month, year, opts} = params;
  const files = await kIjxSemantic.file().getManyByQuery(
    {
      workspaceId: workspace.resourceId,
      isDeleted: false,
    },
    opts
  );
  const storageBytes = sumWorkspaceFileStorageBytes(files);

  return buildMonthlyUsageRecordsFromStorage({
    agent,
    workspaceId: workspace.resourceId,
    storageBytes,
    month,
    year,
  });
}
