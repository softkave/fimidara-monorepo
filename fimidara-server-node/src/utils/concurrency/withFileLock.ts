import {open, stat, unlink} from 'fs/promises';
import {waitTimeout} from 'softkave-js-utils';

export type WithFileLockParams<T> = {
  /** Absolute or relative path of the lock file to create exclusively. */
  lockPath: string;
  /** Work to run while holding the lock. */
  fn: () => Promise<T>;
  /**
   * Max time to wait for the lock, and max age before a lock file is treated as
   * stale and removed. Defaults to 30 seconds.
   */
  timeoutMs?: number;
  /** Delay between acquire retries. Defaults to 50ms. */
  retryDelayMs?: number;
};

const kDefaultTimeoutMs = 30_000;
const kDefaultRetryDelayMs = 50;

/**
 * Cross-process mutex via exclusive file create (`open(..., 'wx')`).
 * Suitable for coordinating work on a shared local filesystem.
 */
export async function withFileLock<T>(
  params: WithFileLockParams<T>
): Promise<T> {
  const timeoutMs = params.timeoutMs ?? kDefaultTimeoutMs;
  const retryDelayMs = params.retryDelayMs ?? kDefaultRetryDelayMs;
  const start = Date.now();

  while (true) {
    try {
      const handle = await open(params.lockPath, 'wx');
      try {
        return await params.fn();
      } finally {
        await handle.close().catch(() => undefined);
        await unlink(params.lockPath).catch(() => undefined);
      }
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'EEXIST') {
        throw error;
      }

      try {
        const lockStat = await stat(params.lockPath);
        if (Date.now() - lockStat.mtimeMs > timeoutMs) {
          await unlink(params.lockPath).catch(() => undefined);
          continue;
        }
      } catch {
        // lock gone — retry acquire
      }

      if (Date.now() - start > timeoutMs) {
        throw error;
      }

      await waitTimeout(retryDelayMs);
    }
  }
}
