import {kIjxSemantic} from '../ijx/injectables.js';
import {SemanticProviderOpParams} from '../semantic/types.js';
import {
  EmailJobParams,
  kEmailJobType,
  kJobType,
} from '../../definitions/job.js';
import {
  UsageRecordCategory,
  kUsageRecordCategory,
} from '../../definitions/usageRecord.js';
import {User} from '../../definitions/user.js';
import {
  Agent,
  kFimidaraResourceType,
} from '../../definitions/system.js';
import {Workspace} from '../../definitions/workspace.js';
import {DEFAULT_ADMIN_PERMISSION_GROUP_NAME} from '../../endpoints/workspaces/addWorkspace/utils.js';
import {queueJobs} from '../../endpoints/jobs/queueJobs.js';
import {getUsageThreshold} from '../../endpoints/usageRecords/utils.js';
import {kSystemSessionAgent} from '../../utils/agent.js';
import {assertWorkspace} from '../../endpoints/workspaces/utils.js';

export interface UsageExceededNotificationParams {
  workspaceId: string;
  exceededCategory: UsageRecordCategory;
  month: number;
  year: number;
  agent?: Agent;
}

export async function getWorkspaceUsageNotificationRecipients(
  workspace: Workspace,
  opts?: SemanticProviderOpParams
): Promise<User[]> {
  const recipients = new Map<string, User>();

  if (workspace.createdBy.agentType === kFimidaraResourceType.User) {
    const creator = await kIjxSemantic
      .user()
      .getOneById(workspace.createdBy.agentId, opts);

    if (creator?.isEmailVerified) {
      recipients.set(creator.resourceId, creator);
    }
  }

  const adminPermissionGroup = await kIjxSemantic
    .permissionGroup()
    .getOneByQuery(
      {
        workspaceId: workspace.resourceId,
        name: DEFAULT_ADMIN_PERMISSION_GROUP_NAME,
        isDeleted: false,
      },
      opts
    );

  if (adminPermissionGroup) {
    const adminAssignments = await kIjxSemantic.assignedItem().getManyByQuery(
      {
        workspaceId: workspace.resourceId,
        assignedItemType: kFimidaraResourceType.PermissionGroup,
        assigneeType: kFimidaraResourceType.User,
        assignedItemId: adminPermissionGroup.resourceId,
        isDeleted: false,
      },
      opts
    );

    await Promise.all(
      adminAssignments.map(async assignment => {
        const user = await kIjxSemantic
          .user()
          .getOneById(assignment.assigneeId, opts);

        if (user?.isEmailVerified) {
          recipients.set(user.resourceId, user);
        }
      })
    );
  }

  return [...recipients.values()];
}

export async function notifyWorkspaceUsageExceeded(
  params: UsageExceededNotificationParams
) {
  const {
    workspaceId,
    exceededCategory,
    month,
    year,
    agent = kSystemSessionAgent,
  } = params;

  const workspace = await kIjxSemantic.workspace().getOneById(workspaceId);
  assertWorkspace(workspace);

  const threshold = getUsageThreshold(workspace, exceededCategory);
  if (!threshold) {
    return;
  }

  const recipients = await getWorkspaceUsageNotificationRecipients(workspace);
  if (recipients.length === 0) {
    return;
  }

  await Promise.all(
    recipients.map(user =>
      queueJobs<EmailJobParams>(workspace.resourceId, undefined, {
        createdBy: agent,
        type: kJobType.email,
        idempotencyToken: [
          kEmailJobType.usageExceeded,
          workspaceId,
          exceededCategory,
          month,
          year,
          user.resourceId,
        ].join('_'),
        params: {
          type: kEmailJobType.usageExceeded,
          emailAddress: [user.email],
          userId: [user.resourceId],
          params: {
            workspaceId: workspace.resourceId,
            exceededCategory,
          },
        },
      })
    )
  );
}

export function shouldNotifyUsageExceeded(
  exceededCategory: UsageRecordCategory | undefined
): exceededCategory is UsageRecordCategory {
  return (
    !!exceededCategory &&
    exceededCategory !== kUsageRecordCategory.storageEverConsumed
  );
}
