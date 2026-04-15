import { z } from "zod";

const fimidxProjectId = process.env.NEXT_PUBLIC_FIMIDX_LOGGER_PROJECT_ID;
const fimidxClientToken = process.env.NEXT_PUBLIC_FIMIDX_LOGGER_CLIENT_TOKEN;
const fimidxLoggerEnabled = process.env.NEXT_PUBLIC_FIMIDX_LOGGER_ENABLED;
const fimidxLoggerMetadataApp =
  process.env.NEXT_PUBLIC_FIMIDX_LOGGER_METADATA_APP;
const fimidxSymbolicationVersion =
  process.env.NEXT_PUBLIC_FIMIDX_SYMBOLICATION_VERSION;
const fimidxSymbolicationRepo =
  process.env.NEXT_PUBLIC_FIMIDX_SYMBOLICATION_REPO;

const clientConfigSchema = z.object({
  fimidxProjectId: z.string(),
  fimidxClientToken: z.string(),
  fimidxLoggerEnabled: z.boolean().default(false),
  fimidxSymbolicationVersion: z.string(),
  fimidxSymbolicationRepo: z.string().default("fimidara-nextjs"),
  fimidxLoggerMetadataApp: z.string().default("fimidara-nextjs"),
});

export const getClientConfig = () => {
  return clientConfigSchema.parse({
    fimidxProjectId,
    fimidxClientToken,
    fimidxLoggerEnabled: fimidxLoggerEnabled === "true",
    fimidxSymbolicationVersion,
    fimidxSymbolicationRepo,
    fimidxLoggerMetadataApp,
  });
};
