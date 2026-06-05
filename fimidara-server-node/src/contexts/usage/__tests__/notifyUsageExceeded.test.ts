import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {kEmailJobType, kJobType} from '../../../definitions/job.js';
import {
  kUsageRecordCategory,
  kUsageRecordFulfillmentStatus,
  kUsageSummationType,
} from '../../../definitions/usageRecord.js';
import {kFimidaraResourceType} from '../../../definitions/system.js';
import {generateAndInsertUsageRecordList} from '../../../endpoints/testHelpers/generate/usageRecord.js';
import {generateAndInsertWorkspaceListForTest} from '../../../endpoints/testHelpers/generate/workspace.js';
import {generateAndInsertUserListForTest} from '../../../endpoints/testHelpers/generate/user.js';
import {completeTests} from '../../../endpoints/testHelpers/helpers/testFns.js';
import {initTests} from '../../../endpoints/testHelpers/utils.js';
import {getCostForUsage} from '../../../endpoints/usageRecords/constants.js';
import {
  getUsageRecordPreviousReportingPeriod,
  getUsageRecordReportingPeriod,
} from '../../../endpoints/usageRecords/utils.js';
import {DEFAULT_ADMIN_PERMISSION_GROUP_NAME} from '../../../endpoints/workspaces/addWorkspace/utils.js';
import {addAssignedPermissionGroupList} from '../../../endpoints/assignedItems/addAssignedItems.js';
import {kSystemSessionAgent} from '../../../utils/agent.js';
import {kIjxSemantic} from '../../ijx/injectables.js';
import * as queueJobsModule from '../../../endpoints/jobs/queueJobs.js';
import {
  getWorkspaceUsageNotificationRecipients,
  notifyWorkspaceUsageExceeded,
} from '../notifyUsageExceeded.js';

beforeEach(async () => {
  await initTests();
});

afterEach(async () => {
  await completeTests();
  vi.restoreAllMocks();
});

describe('notifyUsageExceeded', () => {
  test('getWorkspaceUsageNotificationRecipients returns creator and admins', async () => {
    const [creator, admin] = await generateAndInsertUserListForTest(2, {
      isEmailVerified: true,
    });
    const [workspace] = await generateAndInsertWorkspaceListForTest(1, {
      createdBy: {
        agentId: creator.resourceId,
        agentType: kFimidaraResourceType.User,
        agentTokenId: 'token',
      },
    });
    const adminPermissionGroup = await kIjxSemantic
      .permissionGroup()
      .getOneByQuery({
        workspaceId: workspace.resourceId,
        name: DEFAULT_ADMIN_PERMISSION_GROUP_NAME,
      });

    expect(adminPermissionGroup).toBeTruthy();

    await kIjxSemantic.utils().withTxn(async opts => {
      await addAssignedPermissionGroupList(
        kSystemSessionAgent,
        workspace.resourceId,
        [adminPermissionGroup!.resourceId],
        admin.resourceId,
        false,
        true,
        true,
        opts
      );
    });

    const recipients = await getWorkspaceUsageNotificationRecipients(workspace);

    expect(recipients.map(user => user.resourceId).sort()).toEqual(
      [creator.resourceId, admin.resourceId].sort()
    );
  });

  test('notifyWorkspaceUsageExceeded queues one email job per recipient', async () => {
    const queueJobsSpy = vi
      .spyOn(queueJobsModule, 'queueJobs')
      .mockResolvedValue([]);

    const [user] = await generateAndInsertUserListForTest(1, {
      isEmailVerified: true,
    });
    const [workspace] = await generateAndInsertWorkspaceListForTest(1, {
      createdBy: {
        agentId: user.resourceId,
        agentType: kFimidaraResourceType.User,
        agentTokenId: 'token',
      },
      usageThresholds: {
        [kUsageRecordCategory.storage]: {
          budget: 1,
          category: kUsageRecordCategory.storage,
          usage: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: kSystemSessionAgent,
        },
      },
    });
    const {month, year} = getUsageRecordReportingPeriod();

    await notifyWorkspaceUsageExceeded({
      workspaceId: workspace.resourceId,
      exceededCategory: kUsageRecordCategory.storage,
      month,
      year,
    });

    expect(queueJobsSpy).toHaveBeenCalledTimes(1);
    const jobInput = queueJobsSpy.mock.calls[0][2];
    const job = Array.isArray(jobInput) ? jobInput[0] : jobInput;

    expect(job.type).toBe(kJobType.email);
    expect(job.params.type).toBe(kEmailJobType.usageExceeded);
    expect(job.params.emailAddress).toEqual([user.email]);
    expect(job.idempotencyToken).toContain(kEmailJobType.usageExceeded);
  });
});

describe('storage carryover query period', () => {
  test('previous reporting period month/year match inserted records', async () => {
    const {month, year} = getUsageRecordReportingPeriod();
    const previous = getUsageRecordPreviousReportingPeriod({month, year});
    const usageThreshold = 1024;

    const [workspace] = await generateAndInsertWorkspaceListForTest(1);
    const [previousMonthUsage] = await generateAndInsertUsageRecordList(1, {
      ...previous,
      status: kUsageRecordFulfillmentStatus.fulfilled,
      summationType: kUsageSummationType.month,
      workspaceId: workspace.resourceId,
      category: kUsageRecordCategory.storage,
      usage: usageThreshold,
      usageCost: getCostForUsage(
        kUsageRecordCategory.storage,
        usageThreshold
      ),
    });

    const found = await kIjxSemantic.usageRecord().getOneByQuery({
      ...previous,
      workspaceId: workspace.resourceId,
      category: kUsageRecordCategory.storage,
      summationType: kUsageSummationType.month,
      status: kUsageRecordFulfillmentStatus.fulfilled,
    });

    expect(found?.resourceId).toBe(previousMonthUsage.resourceId);
    expect(found?.month).toBe(previous.month);
    expect(found?.year).toBe(previous.year);
  });
});
