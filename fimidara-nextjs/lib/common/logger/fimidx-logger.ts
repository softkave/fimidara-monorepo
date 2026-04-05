import { FimidxLogger } from "fimidx";
import { getClientConfig } from "../getClientConfig.ts";

const { fimidxProjectId, fimidxClientToken, fimidxServerUrl } =
  getClientConfig();

export const fimidxLogger = new FimidxLogger({
  projectId: fimidxProjectId,
  clientToken: fimidxClientToken,
  consoleLogOnError: true,
  logRemoteErrors: true,
  ...(fimidxServerUrl ? { serverURL: fimidxServerUrl } : {}),
  metadata: {
    app: "fimidara-nextjs",
  },
});
