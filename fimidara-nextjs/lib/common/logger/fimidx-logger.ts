import { FimidxLogger } from "fimidx";
import { getClientConfig } from "../getClientConfig";

const {
  fimidxProjectId,
  fimidxClientToken,
  fimidxSymbolicationVersion,
  fimidxSymbolicationRepo,
  fimidxLoggerMetadataApp,
} = getClientConfig();

export const fimidxLogger = new FimidxLogger({
  projectId: fimidxProjectId,
  clientToken: fimidxClientToken,
  consoleLogOnError: true,
  logRemoteErrors: true,
  metadata: {
    app: fimidxLoggerMetadataApp,
    version: fimidxSymbolicationVersion,
    repo: fimidxSymbolicationRepo,
  },
});
