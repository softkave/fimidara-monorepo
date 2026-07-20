import {globalDispose, globalSetup} from '../../contexts/globalUtils.js';
import SCRIPT_backfillImageDimensions from '../../scripts/SCRIPT_backfillImageDimensions.js';

async function main() {
  await globalSetup(
    {useFimidaraApp: false, useFimidaraWorkerPool: false},
    {}
  );

  await SCRIPT_backfillImageDimensions();

  await globalDispose();
}

main();
