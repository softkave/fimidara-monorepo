import {isMainThread} from 'worker_threads';
import {fimidxConsoleLogger} from '../../../utils/logger/index.js';
import {FimidaraWorker} from './FimidaraWorker.js';

async function main() {
  const fimidaraWorker = new FimidaraWorker();
  await fimidaraWorker.start();
}

if (!isMainThread) {
  main().catch(error => {
    fimidxConsoleLogger.error(error);
  });
}
