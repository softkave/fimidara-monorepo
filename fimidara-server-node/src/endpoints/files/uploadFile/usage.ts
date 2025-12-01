import {
  decrementStorageUsageRecord,
  incrementBandwidthInUsageRecord,
  incrementStorageEverConsumedUsageRecord,
  incrementStorageUsageRecord,
} from '../../../contexts/usage/usageFns.js';
import {File} from '../../../definitions/file.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {Agent, SessionAgent} from '../../../definitions/system.js';
import {getActionAgentFromSessionAgent} from '../../../utils/sessionUtils.js';

export async function handleIntermediateStorageUsageRecords(params: {
  requestId: string;
  sessionAgent: SessionAgent;
  file: File;
  size: number;
}) {
  const {requestId, sessionAgent, file, size} = params;

  // TODO(abayomi): why is resourceId undefined?
  const fileWithSize = {...file, size, resourceId: undefined};
  const agent = getActionAgentFromSessionAgent(sessionAgent);
  await Promise.all([
    incrementBandwidthInUsageRecord({
      requestId,
      agent,
      file: fileWithSize,
      action: kFimidaraPermissionActions.uploadFile,
    }),
    incrementStorageEverConsumedUsageRecord({
      requestId,
      agent,
      file: fileWithSize,
      action: kFimidaraPermissionActions.uploadFile,
    }),
  ]);
}

export async function handleFinalStorageUsageRecords(params: {
  requestId: string;
  agent: Agent;
  file: File;
  size: number;
  append?: boolean;
}) {
  const {requestId, agent, file, size, append} = params;
  const fileWithSize = {...file, size, resourceId: undefined};

  // For append operations, don't decrement the old file size since we're appending, not replacing
  if (!append) {
    await decrementStorageUsageRecord({agent, file});
  }
  await incrementStorageUsageRecord({
    requestId,
    agent,
    file: fileWithSize,
    action: kFimidaraPermissionActions.uploadFile,
  });
}
