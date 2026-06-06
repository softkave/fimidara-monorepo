import {SessionAgent} from '../../../definitions/system.js';

/** Id recorded in writeLockedBy at checkout (uploadSessionId, or agentId if
 * omitted). */
export function resolveUploadActorId(
  uploadSessionId: string | undefined,
  agent: SessionAgent
): string {
  return uploadSessionId ?? agent.agentId;
}

/** True when the caller may resume a write lock held from a prior upload
 * attempt. */
export function canResumeUploadWriteLock(
  uploadSessionId: string | undefined,
  writeLockedBy: string | null | undefined
): boolean {
  return (
    !!uploadSessionId && !!writeLockedBy && writeLockedBy === uploadSessionId
  );
}

/** True when the caller is the uploader that holds a read block during upload. */
export function callerMatchesWriteLock(
  writeLockedBy: string | null | undefined,
  uploadSessionId: string | undefined,
  agentId: string
): boolean {
  if (!writeLockedBy) {
    return false;
  }
  if (uploadSessionId) {
    return writeLockedBy === uploadSessionId;
  }
  return writeLockedBy === agentId;
}
