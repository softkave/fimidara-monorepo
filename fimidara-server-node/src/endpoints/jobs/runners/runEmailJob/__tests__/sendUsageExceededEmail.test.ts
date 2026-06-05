import {first} from 'lodash-es';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {IEmailProviderContext} from '../../../../../contexts/email/types.js';
import {kIjxUtils} from '../../../../../contexts/ijx/injectables.js';
import {kRegisterIjxUtils} from '../../../../../contexts/ijx/register.js';
import {kEmailJobType} from '../../../../../definitions/job.js';
import {kUsageRecordCategory} from '../../../../../definitions/usageRecord.js';
import {kUsageExceededEmailArtifacts} from '../../../../../emailTemplates/usageExceeded.js';
import {kFimidaraResourceType} from '../../../../../definitions/system.js';
import {getNewIdForResource} from '../../../../../utils/resource.js';
import MockTestEmailProviderContext from '../../../../testHelpers/context/email/MockTestEmailProviderContext.js';
import {generateAndInsertUserListForTest} from '../../../../testHelpers/generate/user.js';
import {generateAndInsertWorkspaceListForTest} from '../../../../testHelpers/generate/workspace.js';
import {completeTests} from '../../../../testHelpers/helpers/testFns.js';
import {initTests} from '../../../../testHelpers/utils.js';
import {kSystemSessionAgent} from '../../../../../utils/agent.js';
import {sendUsageExceededEmail} from '../sendUsageExceededEmail.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('sendUsageExceededEmail', () => {
  test('sendEmail called with usage exceeded content', async () => {
    const [user] = await generateAndInsertUserListForTest(1);
    const [workspace] = await generateAndInsertWorkspaceListForTest(1, {
      usageThresholds: {
        [kUsageRecordCategory.storage]: {
          budget: 10,
          category: kUsageRecordCategory.storage,
          usage: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: kSystemSessionAgent,
        },
      },
    });

    const testEmailProvider = new MockTestEmailProviderContext();
    kRegisterIjxUtils.email(testEmailProvider);

    await sendUsageExceededEmail(
      getNewIdForResource(kFimidaraResourceType.Job),
      {
        emailAddress: [user.email],
        userId: [user.resourceId],
        type: kEmailJobType.usageExceeded,
        params: {
          workspaceId: workspace.resourceId,
          exceededCategory: kUsageRecordCategory.storage,
        },
      }
    );

    const call = testEmailProvider.sendEmail.mock.lastCall as Parameters<
      IEmailProviderContext['sendEmail']
    >;
    const params = call[0];
    const threshold = workspace.usageThresholds[kUsageRecordCategory.storage]!;

    expect(params.body.html).toBeTruthy();
    expect(params.body.text).toBeTruthy();
    expect(params.destination).toEqual([user.email]);
    expect(params.subject).toBe(
      kUsageExceededEmailArtifacts.title(workspace.name, threshold)
    );
    expect(params.source).toBe(kIjxUtils.suppliedConfig().senderEmailAddress);
    expect(first(params.destination)).toBe(user.email);
  });
});
