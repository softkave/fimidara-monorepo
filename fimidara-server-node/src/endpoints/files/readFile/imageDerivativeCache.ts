import {createHash} from 'crypto';
import {createReadStream} from 'fs';
import {pathExists} from 'fs-extra';
import {
  mkdir,
  opendir,
  rename,
  rm,
  stat,
  unlink,
  utimes,
} from 'fs/promises';
import path from 'path';
import {Readable} from 'stream';
import {kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {withFileLock} from '../../../utils/concurrency/withFileLock.js';
import {kFileConstants} from '../constants.js';
import {ImageNotProcessableError} from '../errors.js';
import {
  extToImageFormat,
  imageFormatToExt,
  imageFormatToMimetype,
} from './imageFormat.js';
import {
  CanonicalImageTransformParams,
  hashCanonicalTransformParams,
  transformImageToFile,
} from './imageTransform.js';
import {ImageFormatEnum, ImageResizeParams} from './types.js';

export type ImageDerivativeResult = {
  stream: Readable;
  contentLength: number;
  mimetype: string;
  ext: string;
  format: ImageFormatEnum;
};

const inflight = new Map<string, Promise<void>>();
const lastTouchMs = new Map<string, number>();

export function getImageDerivativeCachePath(params: {
  fileId: string;
  lastUpdatedAt: number;
  transform: CanonicalImageTransformParams;
}): string {
  const hash = hashCanonicalTransformParams(params.transform);
  const ext = imageFormatToExt(params.transform.format);
  return path.join(
    kFileConstants.getImageDerivativeCacheDir(),
    params.fileId,
    String(params.lastUpdatedAt),
    `${hash}.${ext}`
  );
}

async function touchAccessThrottled(cachePath: string): Promise<void> {
  const now = Date.now();
  const last = lastTouchMs.get(cachePath) ?? 0;
  if (now - last < kFileConstants.getImageDerivativeAccessTouchIntervalMs()) {
    return;
  }

  lastTouchMs.set(cachePath, now);
  const touchedAt = new Date(now);
  await utimes(cachePath, touchedAt, touchedAt).catch(() => undefined);
}

/** Open a fresh read stream for a cached derivative (one stream per caller). */
async function openCachedDerivativeStream(
  cachePath: string
): Promise<ImageDerivativeResult | undefined> {
  try {
    const format = extToImageFormat(path.extname(cachePath));
    if (!format) {
      return undefined;
    }

    const fileStat = await stat(cachePath);
    await touchAccessThrottled(cachePath);

    return {
      stream: createReadStream(cachePath),
      contentLength: fileStat.size,
      format,
      mimetype: imageFormatToMimetype(format),
      ext: imageFormatToExt(format),
    };
  } catch {
    return undefined;
  }
}

function tmpSiblingPath(cachePath: string): string {
  return `${cachePath}.${createHash('md5')
    .update(`${process.pid}-${Date.now()}-${Math.random()}`)
    .digest('hex')}.tmp`;
}

/**
 * Stream original → sharp → tmp file → rename onto cachePath.
 */
async function writeDerivativeFromOriginal(params: {
  cachePath: string;
  transform: CanonicalImageTransformParams;
  imageResize?: ImageResizeParams;
  loadOriginal: () => Promise<Readable | Buffer>;
}): Promise<void> {
  await mkdir(path.dirname(params.cachePath), {recursive: true});
  const tmpPath = tmpSiblingPath(params.cachePath);

  try {
    const original = await params.loadOriginal();
    await transformImageToFile({
      input: original,
      imageResize: params.imageResize,
      format: params.transform.format,
      outputPath: tmpPath,
    });
    await rename(tmpPath, params.cachePath);
  } catch (error) {
    await unlink(tmpPath).catch(() => undefined);
    throw error;
  }
}

/**
 * Ensure the derivative exists on disk. Shared across concurrent callers via
 * singleflight — waiters open their own read streams after this resolves.
 */
async function ensureDerivative(params: {
  cachePath: string;
  transform: CanonicalImageTransformParams;
  imageResize?: ImageResizeParams;
  loadOriginal: () => Promise<Readable | Buffer>;
}): Promise<void> {
  const cacheKey = params.cachePath;
  const existingInflight = inflight.get(cacheKey);
  if (existingInflight) {
    return existingInflight;
  }

  const work = (async (): Promise<void> => {
    const lockPath = `${params.cachePath}.lock`;
    try {
      await withFileLock({
        lockPath,
        timeoutMs: kFileConstants.getImageDerivativeLockTimeoutMs(),
        fn: async () => {
          if (await pathExists(params.cachePath)) {
            return;
          }

          await writeDerivativeFromOriginal(params);
        },
      });
    } catch (error) {
      // Lock timeout / contention: still try to materialize on disk so waiters
      // can stream the same file (rename is atomic; last writer wins).
      if (await pathExists(params.cachePath)) {
        return;
      }

      kIjxUtils.logger().error({
        message: 'Image derivative lock failed; transforming without lock',
        reason: error,
        cachePath: params.cachePath,
      });

      await writeDerivativeFromOriginal(params);
    }
  })();

  inflight.set(cacheKey, work);
  try {
    await work;
  } finally {
    inflight.delete(cacheKey);
  }
}

/**
 * Get or create a transformed image. Cache hits and misses are served as fresh
 * disk streams so concurrent callers do not share one Readable.
 */
export async function getOrCreateImageDerivative(params: {
  fileId: string;
  lastUpdatedAt: number;
  transform: CanonicalImageTransformParams;
  imageResize?: ImageResizeParams;
  loadOriginal: () => Promise<Readable | Buffer>;
}): Promise<ImageDerivativeResult> {
  const cachePath = getImageDerivativeCachePath(params);

  const cached = await openCachedDerivativeStream(cachePath);
  if (cached) {
    return cached;
  }

  await ensureDerivative({
    cachePath,
    transform: params.transform,
    imageResize: params.imageResize,
    loadOriginal: params.loadOriginal,
  });

  const fromDisk = await openCachedDerivativeStream(cachePath);
  if (fromDisk) {
    return fromDisk;
  }

  // Rare: ensure finished but file missing (e.g. concurrent purge). Retry once
  // through lock/singleflight — do not write unlocked.
  await ensureDerivative({
    cachePath,
    transform: params.transform,
    imageResize: params.imageResize,
    loadOriginal: params.loadOriginal,
  });

  const rebuilt = await openCachedDerivativeStream(cachePath);
  if (!rebuilt) {
    throw new ImageNotProcessableError(
      'Failed to open transformed image after write.'
    );
  }
  return rebuilt;
}

/** Best-effort delete of all local derivatives for a file. */
export async function deleteImageDerivativesForFile(
  fileId: string
): Promise<void> {
  const dir = path.join(kFileConstants.getImageDerivativeCacheDir(), fileId);
  await rm(dir, {recursive: true, force: true}).catch(() => undefined);
}

/**
 * Depth-first walk that yields paths one at a time (no full-tree path list).
 * Uses opendir so a single huge directory is not fully loaded via readdir.
 */
async function* walkFiles(dir: string): AsyncGenerator<string> {
  let handle;
  try {
    handle = await opendir(dir);
  } catch {
    return;
  }

  for await (const entry of handle) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else if (
      entry.isFile() &&
      !entry.name.endsWith('.lock') &&
      !entry.name.endsWith('.tmp')
    ) {
      yield full;
    }
  }
}

/**
 * Delete derivatives with mtime older than retention. Streams the tree and
 * stops after maxDeletes so each sweep stays bounded; the next interval
 * continues from the start (young files are skipped cheaply via stat).
 */
export async function purgeIdleImageDerivatives(): Promise<number> {
  const root = kFileConstants.getImageDerivativeCacheDir();
  const retentionMs = kFileConstants.getImageDerivativeRetentionMs();
  const maxDeletes = kFileConstants.getImageDerivativeEvictionMaxDeletes();
  const cutoff = Date.now() - retentionMs;
  let deleted = 0;

  for await (const filePath of walkFiles(root)) {
    try {
      const fileStat = await stat(filePath);
      if (fileStat.mtimeMs < cutoff) {
        await unlink(filePath);
        deleted += 1;
        lastTouchMs.delete(filePath);
        if (deleted >= maxDeletes) {
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  return deleted;
}

let evictionInterval: NodeJS.Timeout | undefined;

export function startImageDerivativeCacheEviction(): void {
  if (evictionInterval) {
    return;
  }

  const intervalMs = kFileConstants.getImageDerivativeEvictionIntervalMs();
  evictionInterval = setInterval(() => {
    kIjxUtils.promises().callAndForget(async () => {
      const deleted = await purgeIdleImageDerivatives();
      if (deleted > 0) {
        kIjxUtils.logger().log({
          message: 'Purged idle image derivatives',
          deleted,
        });
      }
    });
  }, intervalMs);

  evictionInterval.unref?.();
}

export function stopImageDerivativeCacheEviction(): void {
  if (evictionInterval) {
    clearInterval(evictionInterval);
    evictionInterval = undefined;
  }
}
