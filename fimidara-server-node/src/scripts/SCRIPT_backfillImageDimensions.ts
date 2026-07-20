import {kIjxUtils} from '../contexts/ijx/injectables.js';
import {backfillImageDimensionsFromFiles} from '../endpoints/files/utils/backfillImageDimensions.js';
import {runScript} from './runScript.js';

/**
 * One-time warm pass: probe and persist image dimensions for historical files
 * so folder/list grids have width/height without calling getFileDetails.
 */
export default async function SCRIPT_backfillImageDimensions() {
  await runScript({
    name: 'SCRIPT_backfillImageDimensions',
    isUnique: true,
    isMandatory: true,
    fn: async () => {
      kIjxUtils.logger().log({
        message: 'Backfilling image dimensions from files',
      });

      const result = await backfillImageDimensionsFromFiles();

      kIjxUtils.logger().log({
        message: 'Finished backfilling image dimensions from files',
        ...result,
      });
    },
  });
}
