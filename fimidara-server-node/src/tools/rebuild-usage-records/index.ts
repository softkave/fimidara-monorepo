import {globalDispose, globalSetup} from '../../contexts/globalUtils.js';
import SCRIPT_rebuildUsageRecordsFromFiles from '../../scripts/SCRIPT_rebuildUsageRecordsFromFiles.js';

async function main() {
  await globalSetup(
    {useFimidaraApp: false, useFimidaraWorkerPool: false},
    {}
  );

  await SCRIPT_rebuildUsageRecordsFromFiles();

  await globalDispose();
}

main();
