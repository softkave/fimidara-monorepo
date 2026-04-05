import {FimidxConsoleLikeLogger} from 'fimidx';
import {getClientConfig} from '../getClientConfig.js';
import {fimidxLogger} from './fimidxLogger.js';

const {fimidxLoggerEnabled} = getClientConfig();

export const fimidxConsoleLogger = new FimidxConsoleLikeLogger({
  fimidxLogger: fimidxLogger,
  enableConsoleFallback: true,
  logToFimidx: fimidxLoggerEnabled,
});
