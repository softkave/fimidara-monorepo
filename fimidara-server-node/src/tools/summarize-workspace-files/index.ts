import {globalDispose, globalSetup} from '../../contexts/globalUtils.js';
import {
  formatWorkspaceFileSummariesTable,
  getWorkspaceFileSummaries,
} from '../../contexts/usage/summarizeWorkspaceFiles.js';

async function main() {
  await globalSetup(
    {useFimidaraApp: false, useFimidaraWorkerPool: false},
    {}
  );

  const summaries = await getWorkspaceFileSummaries();
  console.log(formatWorkspaceFileSummariesTable(summaries));

  await globalDispose();
}

main();
