import {kIjxUtils} from '../contexts/ijx/injectables.js';
import {rebuildUsageRecordsFromFiles} from '../contexts/usage/rebuildUsageRecordsFromFiles.js';
import {kSystemSessionAgent} from '../utils/agent.js';

/**
 * Deletes all usage records and rebuilds monthly storage, storageEver, and
 * total records from current workspace files. Run only while the server is off.
 */
export default async function SCRIPT_rebuildUsageRecordsFromFiles() {
  kIjxUtils.logger().log({
    message: 'Rebuilding usage records from workspace files',
  });

  await rebuildUsageRecordsFromFiles(kSystemSessionAgent);

  kIjxUtils.logger().log({
    message: 'Finished rebuilding usage records from workspace files',
  });
}
