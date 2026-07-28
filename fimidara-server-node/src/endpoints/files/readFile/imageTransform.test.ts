import assert from 'assert';
import {mkdtemp, readFile, rm} from 'fs/promises';
import {tmpdir} from 'os';
import path from 'path';
import {fileURLToPath} from 'url';
import sharp from 'sharp';
import {Readable} from 'stream';
import {afterAll, afterEach, beforeAll, describe, expect, test} from 'vitest';
import {completeTests} from '../../testHelpers/helpers/testFns.js';
import {initTests} from '../../testHelpers/utils.js';
import {kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {streamToBuffer} from '../../../utils/fns.js';
import {ImageTransformValidationError} from '../errors.js';
import {
  deleteImageDerivativesForFile,
  getImageDerivativeCachePath,
  getOrCreateImageDerivative,
  purgeIdleImageDerivatives,
} from './imageDerivativeCache.js';
import {
  imageFormatToMimetype,
  isProcessableImageFile,
  resolveOutputImageFormat,
} from './imageFormat.js';
import {
  buildCanonicalTransformParams,
  hashCanonicalTransformParams,
  transformImageToFile,
  validateImageTransformDimensions,
} from './imageTransform.js';
import { ImageFormatEnumMap } from '../../../definitions/file.js';

describe('imageFormat', () => {
  test('preserves source format when imageFormat is omitted', () => {
    expect(
      resolveOutputImageFormat(undefined, {
        mimetype: 'image/jpeg',
        ext: 'jpg',
      })
    ).toBe('jpeg');
    expect(
      resolveOutputImageFormat(undefined, {mimetype: 'image/png', ext: 'png'})
    ).toBe('png');
    expect(
      resolveOutputImageFormat(undefined, {mimetype: 'image/gif', ext: 'gif'})
    ).toBe('gif');
    expect(
      resolveOutputImageFormat(undefined, {mimetype: 'image/avif', ext: 'avif'})
    ).toBe('avif');
  });

  test('isProcessableImageFile', () => {
    expect(isProcessableImageFile({mimetype: 'image/png', ext: 'png'})).toBe(
      true
    );
    expect(
      isProcessableImageFile({mimetype: 'application/pdf', ext: 'pdf'})
    ).toBe(false);
    expect(isProcessableImageFile({mimetype: undefined, ext: 'webp'})).toBe(
      true
    );
  });
});

describe('imageTransform', () => {
  let outDir: string | undefined;

  afterEach(async () => {
    if (outDir) {
      await rm(outDir, {recursive: true, force: true});
      outDir = undefined;
    }
  });

  async function outPath(name: string): Promise<string> {
    if (!outDir) {
      outDir = await mkdtemp(path.join(tmpdir(), 'fimidara-img-xform-'));
    }
    return path.join(outDir, name);
  }

  test('resizes and sets correct mime/length for jpeg from a stream', async () => {
    const input = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 3,
        background: {r: 255, g: 0, b: 0},
      },
    })
      .png()
      .toBuffer();

    const outputPath = await outPath('out.jpg');
    const result = await transformImageToFile({
      input: Readable.from(input),
      imageResize: {width: 100, height: 100},
      format: ImageFormatEnumMap.jpeg,
      outputPath,
    });

    expect(result.mimetype).toBe('image/jpeg');
    expect(result.ext).toBe('jpg');
    const fileBuf = await readFile(outputPath);
    expect(result.contentLength).toBe(fileBuf.length);
    const meta = await sharp(fileBuf).metadata();
    expect(meta.width).toBe(100);
    expect(meta.height).toBe(100);
    expect(meta.format).toBe('jpeg');
  });

  test('encodes avif and gif', async () => {
    const input = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 3,
        background: {r: 0, g: 255, b: 0},
      },
    })
      .png()
      .toBuffer();

    const avifPath = await outPath('out.avif');
    const avif = await transformImageToFile({
      input,
      format: ImageFormatEnumMap.avif,
      outputPath: avifPath,
    });
    expect(avif.mimetype).toBe(imageFormatToMimetype('avif'));
    const avifMeta = await sharp(await readFile(avifPath)).metadata();
    expect(['avif', 'heif']).toContain(avifMeta.format);

    const gifPath = await outPath('out.gif');
    const gif = await transformImageToFile({
      input,
      format: ImageFormatEnumMap.gif,
      outputPath: gifPath,
    });
    expect(gif.mimetype).toBe('image/gif');
    expect((await sharp(await readFile(gifPath)).metadata()).format).toBe(
      'gif'
    );
  });

  test('allows still single-frame gif sources', async () => {
    const still = await sharp({
      create: {
        width: 8,
        height: 8,
        channels: 3,
        background: {r: 0, g: 0, b: 255},
      },
    })
      .gif()
      .toBuffer();
    expect((await sharp(still).metadata()).pages).toBe(1);

    const outputPath = await outPath('still.png');
    const result = await transformImageToFile({
      input: Readable.from(still),
      format: ImageFormatEnumMap.png,
      imageResize: {width: 4},
      outputPath,
    });
    expect(result.format).toBe('png');
  });

  test('rejects oversized requested dimensions', () => {
    expect(() =>
      validateImageTransformDimensions({width: 5000, height: 5001})
    ).toThrow(ImageTransformValidationError);
  });

  test('canonical hash is stable', () => {
    const a = buildCanonicalTransformParams({
      imageResize: {width: 100, height: 100, fit: 'cover'},
      imageFormat: 'webp',
      file: {mimetype: 'image/png', ext: 'png'},
    });
    const b = buildCanonicalTransformParams({
      imageResize: {width: 100, height: 100, fit: 'cover'},
      imageFormat: 'webp',
      file: {mimetype: 'image/png', ext: 'png'},
    });
    expect(hashCanonicalTransformParams(a)).toBe(
      hashCanonicalTransformParams(b)
    );
  });

  test('transforms test-artifacts/border-around-image.png', async () => {
    const fixturePath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../../test-artifacts/border-around-image.png'
    );
    const input = await readFile(fixturePath);
    const sourceMeta = await sharp(input).metadata();
    expect(sourceMeta.width).toBeGreaterThan(0);
    expect(sourceMeta.height).toBeGreaterThan(0);

    const outputPath = await outPath('fixture-out.jpg');
    const result = await transformImageToFile({
      input: Readable.from(input),
      imageResize: {width: 200},
      format: ImageFormatEnumMap.jpeg,
      outputPath,
    });

    expect(result.mimetype).toBe('image/jpeg');
    expect(result.ext).toBe('jpg');
    const outBuf = await readFile(outputPath);
    expect(result.contentLength).toBe(outBuf.length);
    const outMeta = await sharp(outBuf).metadata();
    expect(outMeta.width).toBe(200);
    expect(outMeta.format).toBe('jpeg');
  });
});

describe('imageDerivativeCache', () => {
  beforeAll(async () => {
    await initTests();
  });

  afterAll(async () => {
    await completeTests();
  });

  const cacheDir = path.join(
    process.cwd(),
    'local-fs/test/.fimidara-image-derivatives-unit'
  );

  afterEach(async () => {
    await rm(cacheDir, {recursive: true, force: true});
  });

  test('caches derivative and serves second request from disk', async () => {
    const previous = kIjxUtils.suppliedConfig().imageDerivativeCacheDir;
    (
      kIjxUtils.suppliedConfig() as {imageDerivativeCacheDir?: string}
    ).imageDerivativeCacheDir = cacheDir;

    const input = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: {r: 0, g: 0, b: 255},
      },
    })
      .png()
      .toBuffer();

    const transform = buildCanonicalTransformParams({
      imageResize: {width: 50, height: 50},
      imageFormat: 'png',
      file: {mimetype: 'image/png', ext: 'png'},
    });

    let loadCount = 0;
    const loadOriginal = async () => {
      loadCount += 1;
      return Readable.from(input);
    };

    const first = await getOrCreateImageDerivative({
      fileId: 'file_test_cache_01',
      lastUpdatedAt: 1,
      transform,
      imageResize: {width: 50, height: 50},
      loadOriginal,
    });
    const second = await getOrCreateImageDerivative({
      fileId: 'file_test_cache_01',
      lastUpdatedAt: 1,
      transform,
      imageResize: {width: 50, height: 50},
      loadOriginal,
    });

    const firstBuf = await streamToBuffer(first.stream);
    const secondBuf = await streamToBuffer(second.stream);
    expect(firstBuf.equals(secondBuf)).toBe(true);
    expect(loadCount).toBe(1);

    const cachePath = getImageDerivativeCachePath({
      fileId: 'file_test_cache_01',
      lastUpdatedAt: 1,
      transform,
    });
    assert.ok(cachePath.startsWith(cacheDir));

    await deleteImageDerivativesForFile('file_test_cache_01');
    (
      kIjxUtils.suppliedConfig() as {imageDerivativeCacheDir?: string}
    ).imageDerivativeCacheDir = previous;
  });

  test('different lastUpdatedAt uses a different cache path and reloads', async () => {
    const previous = kIjxUtils.suppliedConfig().imageDerivativeCacheDir;
    (
      kIjxUtils.suppliedConfig() as {imageDerivativeCacheDir?: string}
    ).imageDerivativeCacheDir = cacheDir;

    const input = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: {r: 20, g: 40, b: 60},
      },
    })
      .png()
      .toBuffer();

    const transform = buildCanonicalTransformParams({
      imageResize: {width: 40, height: 40},
      imageFormat: 'png',
      file: {mimetype: 'image/png', ext: 'png'},
    });

    let loadCount = 0;
    const loadOriginal = async () => {
      loadCount += 1;
      return Readable.from(input);
    };

    const pathV1 = getImageDerivativeCachePath({
      fileId: 'file_test_cache_version',
      lastUpdatedAt: 1,
      transform,
    });
    const pathV2 = getImageDerivativeCachePath({
      fileId: 'file_test_cache_version',
      lastUpdatedAt: 2,
      transform,
    });
    expect(pathV1).not.toBe(pathV2);

    await getOrCreateImageDerivative({
      fileId: 'file_test_cache_version',
      lastUpdatedAt: 1,
      transform,
      imageResize: {width: 40, height: 40},
      loadOriginal,
    });
    expect(loadCount).toBe(1);

    await getOrCreateImageDerivative({
      fileId: 'file_test_cache_version',
      lastUpdatedAt: 2,
      transform,
      imageResize: {width: 40, height: 40},
      loadOriginal,
    });
    expect(loadCount).toBe(2);

    await deleteImageDerivativesForFile('file_test_cache_version');
    (
      kIjxUtils.suppliedConfig() as {imageDerivativeCacheDir?: string}
    ).imageDerivativeCacheDir = previous;
  });

  test('purgeIdleImageDerivatives deletes old files', async () => {
    const previous = kIjxUtils.suppliedConfig().imageDerivativeCacheDir;
    const previousRetention =
      kIjxUtils.suppliedConfig().imageDerivativeRetentionMs;
    (
      kIjxUtils.suppliedConfig() as {imageDerivativeCacheDir?: string}
    ).imageDerivativeCacheDir = cacheDir;
    (
      kIjxUtils.suppliedConfig() as {imageDerivativeRetentionMs?: number}
    ).imageDerivativeRetentionMs = 1;

    const input = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: {r: 10, g: 10, b: 10},
      },
    })
      .png()
      .toBuffer();

    const transform = buildCanonicalTransformParams({
      imageFormat: 'png',
      file: {mimetype: 'image/png', ext: 'png'},
    });

    await getOrCreateImageDerivative({
      fileId: 'file_test_purge_01',
      lastUpdatedAt: 1,
      transform,
      loadOriginal: async () => Readable.from(input),
    });

    await new Promise(r => setTimeout(r, 5));
    const deleted = await purgeIdleImageDerivatives();
    expect(deleted).toBeGreaterThanOrEqual(1);

    (
      kIjxUtils.suppliedConfig() as {imageDerivativeCacheDir?: string}
    ).imageDerivativeCacheDir = previous;
    (
      kIjxUtils.suppliedConfig() as {imageDerivativeRetentionMs?: number}
    ).imageDerivativeRetentionMs = previousRetention;
  });
});
