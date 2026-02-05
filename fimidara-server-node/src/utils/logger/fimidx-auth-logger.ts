import {FimidxNextAuthLogger} from 'fimidx';
import {fimidxConsoleLogger} from './fimidx-console-logger.js';

export const fimidxNextAuthLogger = new FimidxNextAuthLogger({
  fimidxConsoleLogger,
  debug: false,
});
