import {Logger} from 'softkave-js-utils';
import {fimidxConsoleLogger, fimidxLogger} from '../../utils/logger/index.js';
import {kIjxUtils} from '../ijx/injectables.js';

export class ConsoleLogger implements Logger {
  constructor() {
    const config = kIjxUtils.suppliedConfig();
    if (config.loggerMetadata) {
      fimidxLogger.mergeMetadata(config.loggerMetadata);
    }
  }

  log: (...args: unknown[]) => void = (...args) => {
    fimidxConsoleLogger.log(...args);
  };
  error: (...args: unknown[]) => void = (...args) => {
    fimidxConsoleLogger.error(...args);
  };
}
