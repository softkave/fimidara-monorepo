import {kIjxUtils} from '../ijx/injectables.js';
import {ResourceLockedError} from '../../endpoints/errors.js';
import {kFileConstants} from '../../endpoints/files/constants.js';
import {IPartUploadLockContext, PartUploadLockData} from './types.js';

const kPartUploadLockTtlMs = 10 * 60 * 1000; // 10 minutes
const kAcquireLockMaxAttempts = 3;

export class PartUploadLockProvider implements IPartUploadLockContext {
  async acquire(fileId: string, part: number, actorId: string): Promise<void> {
    const key = kFileConstants.getPartUploadLockKey(fileId, part);
    const value: PartUploadLockData = {lockedBy: actorId};

    for (let attempt = 0; attempt < kAcquireLockMaxAttempts; attempt++) {
      const acquired = await kIjxUtils.cache().setJsonNx(key, value, {
        ttlMs: kPartUploadLockTtlMs,
      });
      if (acquired) {
        return;
      }

      const existing = await kIjxUtils.cache().getJson<PartUploadLockData>(key);
      if (!existing) {
        continue;
      }

      if (existing.lockedBy === actorId) {
        await kIjxUtils.cache().setJson(key, value, {
          ttlMs: kPartUploadLockTtlMs,
        });
        return;
      }

      throw new ResourceLockedError();
    }

    throw new ResourceLockedError();
  }

  async release(fileId: string, part: number, actorId: string): Promise<void> {
    const key = kFileConstants.getPartUploadLockKey(fileId, part);
    await kIjxUtils.cache().deleteJsonIfOwner(key, actorId);
  }

  async forceRelease(fileId: string, part: number): Promise<void> {
    await kIjxUtils
      .cache()
      .delete(kFileConstants.getPartUploadLockKey(fileId, part));
  }

  async using<T>(
    fileId: string,
    part: number,
    actorId: string,
    fn: () => Promise<T>
  ): Promise<T> {
    await this.acquire(fileId, part, actorId);
    try {
      return await fn();
    } finally {
      await this.release(fileId, part, actorId);
    }
  }

  async dispose(): Promise<void> {
    // no-op
  }
}
