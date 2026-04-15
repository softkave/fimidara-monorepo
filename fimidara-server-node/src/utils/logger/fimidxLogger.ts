import {FimidxLogger} from 'fimidx';
import {getSuppliedConfig} from '../../resources/config.js';

const {
  fimidxProjectId,
  fimidxClientToken,
  fimidxServerUrl,
  fimidxLoggerMetadata,
} = getSuppliedConfig();

if (!fimidxProjectId || !fimidxClientToken) {
  throw new Error('Fimidx project ID and client token are required');
}

export const fimidxLogger = new FimidxLogger({
  projectId: fimidxProjectId,
  clientToken: fimidxClientToken,
  consoleLogOnError: true,
  logRemoteErrors: true,
  ...(fimidxServerUrl ? {serverURL: fimidxServerUrl} : {}),
  metadata: fimidxLoggerMetadata,
});
