import {FimidxLogger} from 'fimidx';
import {getClientConfig} from '../getClientConfig.js';

const {fimidxAppId, fimidxClientToken} = getClientConfig();

export const fimidxLogger = new FimidxLogger({
  appId: fimidxAppId,
  clientToken: fimidxClientToken,
  consoleLogOnError: true,
  logRemoteErrors: true,
});
