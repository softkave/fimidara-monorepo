import {FimidxConsoleLikeLogger} from 'fimidx';
import {getClientConfig} from '../getClientConfig.js';
import {fimidxLogger} from './fimidx-logger.js';

const {fimidxLoggerEnabled} = getClientConfig();

export const fimidxConsoleLogger = new FimidxConsoleLikeLogger({
  fimidxLogger: fimidxLogger,

  // Enable console fallback in development
  // enableConsoleFallback: nodeEnv === 'development',

  // fimidx is currently disabled, so we need to enable console fallback to
  // avoid losing logs
  enableConsoleFallback: true,
  enabled: fimidxLoggerEnabled,
});
