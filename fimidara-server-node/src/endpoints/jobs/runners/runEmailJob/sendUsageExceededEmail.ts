import {first} from 'lodash-es';
import {kIjxSemantic, kIjxUtils} from '../../../../contexts/ijx/injectables.js';
import {EmailJobParams, kEmailJobType} from '../../../../definitions/job.js';
import {
  kUsageExceededEmailArtifacts,
  usageExceededEmailHTML,
  usageExceededEmailText,
  UsageExceededEmailProps,
} from '../../../../emailTemplates/usageExceeded.js';
import {appAssert} from '../../../../utils/assertion.js';
import {getUsageThreshold} from '../../../usageRecords/utils.js';
import {assertWorkspace} from '../../../workspaces/utils.js';
import {getBaseEmailTemplateProps} from './utils.js';

export async function sendUsageExceededEmail(
  jobId: string,
  params: EmailJobParams
) {
  appAssert(
    params.type === kEmailJobType.usageExceeded,
    `Email job type is not ${kEmailJobType.usageExceeded}`
  );

  const {user, base, source} = await getBaseEmailTemplateProps(params);
  const recipientEmail = user?.email || first(params.emailAddress);

  if (!recipientEmail) {
    throw new Error(`No recipient email for job ${jobId}`);
  }

  const workspace = await kIjxSemantic
    .workspace()
    .getOneById(params.params.workspaceId);

  assertWorkspace(workspace);

  const threshold = getUsageThreshold(
    workspace,
    params.params.exceededCategory
  );

  if (!threshold) {
    throw new Error(
      `Usage threshold not found for category ${params.params.exceededCategory} in job ${jobId}`
    );
  }

  const emailProps: UsageExceededEmailProps = {
    ...base,
    workspaceName: workspace.name,
    threshold,
  };
  const html = usageExceededEmailHTML(emailProps);
  const text = usageExceededEmailText(emailProps);

  return await kIjxUtils.email().sendEmail({
    source,
    subject: kUsageExceededEmailArtifacts.title(
      workspace.name,
      threshold
    ),
    body: {html, text},
    destination: params.emailAddress,
  });
}
