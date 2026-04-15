import {FimidxConsoleLikeLogger} from 'fimidx';
import {getSuppliedConfig} from '../../resources/config.js';
import {fimidxLogger} from './fimidxLogger.js';

const {fimidxLoggerEnabled} = getSuppliedConfig();

export const fimidxConsoleLogger = new FimidxConsoleLikeLogger({
  fimidxLogger: fimidxLogger,
  enableConsoleFallback: true,
  logToFimidx: fimidxLoggerEnabled,
});
