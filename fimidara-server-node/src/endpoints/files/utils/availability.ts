import {File, ResourceAvailability} from '../../../definitions/file.js';
import {
  callerMatchesWriteLock,
  canResumeUploadWriteLock,
} from './uploadSession.js';

export function getFileReadAvailability(
  file: Pick<File, 'isReadAvailable' | 'writeLockedBy'>,
  agentId: string,
  uploadSessionId?: string
): ResourceAvailability {
  const available = file.isReadAvailable === true;
  const lockedByValue = file.writeLockedBy ?? undefined;

  return {
    available,
    availableForYou:
      available ||
      callerMatchesWriteLock(lockedByValue, uploadSessionId, agentId),
    ...(available ? {} : lockedByValue ? {lockedBy: lockedByValue} : {}),
  };
}

export function getFileWriteAvailability(
  file: Pick<File, 'isWriteAvailable' | 'writeLockedBy'>,
  uploadSessionId?: string
): ResourceAvailability {
  const available = file.isWriteAvailable !== false;
  const lockedByValue = file.writeLockedBy ?? undefined;
  const canResume = canResumeUploadWriteLock(uploadSessionId, lockedByValue);

  return {
    available,
    availableForYou: available || canResume,
    ...(available ? {} : lockedByValue ? {lockedBy: lockedByValue} : {}),
  };
}
