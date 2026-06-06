import {File, ResourceAvailability} from '../../../definitions/file.js';

function getAvailabilityForActor(params: {
  available: boolean;
  lockedBy?: string | null;
  uploadActorId: string;
}): ResourceAvailability {
  const {available, lockedBy, uploadActorId} = params;
  const lockedByValue = lockedBy ?? undefined;

  return {
    available,
    availableForYou:
      available || (!!lockedByValue && lockedByValue === uploadActorId),
    ...(available ? {} : lockedByValue ? {lockedBy: lockedByValue} : {}),
  };
}

export function getFileReadAvailability(
  file: Pick<File, 'isReadAvailable' | 'writeLockedBy'>,
  uploadActorId: string
): ResourceAvailability {
  const available = file.isReadAvailable === true;
  return getAvailabilityForActor({
    available,
    lockedBy: available ? undefined : file.writeLockedBy,
    uploadActorId,
  });
}

export function getFileWriteAvailability(
  file: Pick<File, 'isWriteAvailable' | 'writeLockedBy'>,
  uploadActorId: string
): ResourceAvailability {
  const available = file.isWriteAvailable !== false;
  return getAvailabilityForActor({
    available,
    lockedBy: available ? undefined : file.writeLockedBy,
    uploadActorId,
  });
}

