import { FimidxConsoleLikeLogger } from "fimidx";
import { getClientConfig } from "../getClientConfig.ts";
import { fimidxLogger } from "./fimidx-logger.ts";

const { fimidxLoggerEnabled } = getClientConfig();

export const fimidxConsoleLogger = new FimidxConsoleLikeLogger({
  fimidxLogger: fimidxLogger,
  enableConsoleFallback: true,
  logToFimidx: fimidxLoggerEnabled,
});
