import {SessionAgent} from '../../../definitions/system.js';

export function resolveUploadActorId(
  uploadSessionId: string | undefined,
  agent: SessionAgent
): string {
  return uploadSessionId ?? agent.agentId;
}
