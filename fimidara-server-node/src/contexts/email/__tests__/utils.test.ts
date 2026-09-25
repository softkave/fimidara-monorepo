import {describe, expect, test} from 'vitest';
import NoopEmailProviderContext from '../../../endpoints/testHelpers/context/email/NoopEmailProviderContext.js';
import {
  FimidaraSuppliedConfig,
  kFimidaraConfigEmailProvider,
} from '../../../resources/config.js';
import {ResendEmailProviderContext} from '../ResendEmailProviderContext.js';
import {SESEmailProviderContext} from '../SESEmailProviderContext.js';
import {kRegisterIjxUtils} from '../../ijx/register.js';
import {getEmailProvider} from '../utils.js';

describe('getEmailProvider', () => {
  test('should return NoopEmailProviderContext for noop provider', () => {
    const config: FimidaraSuppliedConfig = {
      emailProvider: kFimidaraConfigEmailProvider.noop,
    };

    const provider = getEmailProvider(config);
    expect(provider).toBeInstanceOf(NoopEmailProviderContext);
  });

  test('should return ResendEmailProviderContext for resend provider', () => {
    const config: FimidaraSuppliedConfig = {
      emailProvider: kFimidaraConfigEmailProvider.resend,
      resendApiKey: 'test-api-key',
    };

    const provider = getEmailProvider(config);
    expect(provider).toBeInstanceOf(ResendEmailProviderContext);
  });

  test('should throw error for resend provider without API key', () => {
    const config: FimidaraSuppliedConfig = {
      emailProvider: kFimidaraConfigEmailProvider.resend,
    };

    expect(() => getEmailProvider(config)).toThrow(
      'provide resendApiKey for Resend email provider'
    );
  });

  test('should return SESEmailProviderContext for ses provider', () => {
    const config: FimidaraSuppliedConfig = {
      emailProvider: kFimidaraConfigEmailProvider.ses,
      awsConfigs: {
        all: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
          region: 'us-east-1',
        },
        sesEmailEncoding: 'UTF-8',
      },
    };

    kRegisterIjxUtils.suppliedConfig(config);
    const provider = getEmailProvider(config);
    expect(provider).toBeInstanceOf(SESEmailProviderContext);
  });

  test('should throw error for unknown provider', () => {
    const config = {
      emailProvider: 'unknown' as any,
    };

    expect(() => getEmailProvider(config)).toThrow(
      'Unknown email provider: unknown'
    );
  });
});
