import {DisposableResource} from 'softkave-js-utils';

export interface PartUploadLockData {
  lockedBy: string;
}

export interface IPartUploadLockContext extends DisposableResource {
  using<T>(
    fileId: string,
    part: number,
    actorId: string,
    fn: () => Promise<T>
  ): Promise<T>;
  release(fileId: string, part: number, actorId: string): Promise<void>;
  forceRelease(fileId: string, part: number): Promise<void>;
}
