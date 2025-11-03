import {Resend} from 'resend';
import {kFimidaraConfigEmailProvider} from '../../resources/config.js';
import {appAssert} from '../../utils/assertion.js';
import {kIjxUtils} from '../ijx/injectables.js';
import {
  EmailProviderSendEmailResult,
  IEmailProviderContext,
  SendEmailParams,
} from './types.js';

export class ResendEmailProviderContext implements IEmailProviderContext {
  protected resend: Resend;

  constructor(apiKey: string) {
    appAssert(apiKey, 'Resend API key is required');
    this.resend = new Resend(apiKey);
  }

  sendEmail = async (
    params: SendEmailParams
  ): Promise<EmailProviderSendEmailResult | undefined> => {
    try {
      const result = await this.resend.emails.send({
        from: params.source,
        to: params.destination,
        subject: params.subject,
        html: params.body.html,
        text: params.body.text,
      });

      if (result.data?.id) {
        return await this.tryGetEmailInsights(result.data.id);
      }

      return undefined;
    } catch (error) {
      kIjxUtils.logger().error({
        message: 'Failed to send email with Resend',
        reason: error,
      });
      throw error;
    }
  };

  dispose = async () => {
    // Resend client doesn't require explicit disposal but we can clean up any
    // resources if needed
  };

  protected async tryGetEmailInsights(
    emailId: string
  ): Promise<EmailProviderSendEmailResult> {
    try {
      // Note: Resend doesn't provide real-time bounce/complaint insights like
      // AWS SES. The insights are typically available through webhooks or by
      // checking the email status via their API. For now, we'll return basic
      // metadata.

      return {
        meta: {
          emailProvider: kFimidaraConfigEmailProvider.resend,
          other: {
            emailId,
            provider: 'resend',
          },
        },
      };
    } catch (error) {
      kIjxUtils.logger().error({
        message: 'Failed to get email insights from Resend',
        reason: error,
      });
      return {
        meta: {
          emailProvider: kFimidaraConfigEmailProvider.resend,
          other: {
            emailId,
            provider: 'resend',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      };
    }
  }
}
