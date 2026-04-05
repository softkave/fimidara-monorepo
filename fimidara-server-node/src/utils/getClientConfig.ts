import {z} from 'zod';

const fimidxProjectId = process.env.NEXT_PUBLIC_FIMIDX_LOGGER_PROJECT_ID;
const fimidxClientToken = process.env.NEXT_PUBLIC_FIMIDX_LOGGER_CLIENT_TOKEN;
const fimidxLoggerEnabled = process.env.NEXT_PUBLIC_FIMIDX_LOGGER_ENABLED;
const fimidxServerUrl = process.env.NEXT_PUBLIC_FIMIDX_LOGGER_SERVER_URL;

const clientConfigSchema = z.object({
  fimidxProjectId: z.string(),
  fimidxClientToken: z.string(),
  fimidxLoggerEnabled: z.boolean().default(false),
  fimidxServerUrl: z.string().url().optional(),
});

export const getClientConfig = () => {
  return clientConfigSchema.parse({
    fimidxProjectId,
    fimidxClientToken,
    fimidxLoggerEnabled: fimidxLoggerEnabled === 'true',
    fimidxServerUrl,
  });
};
