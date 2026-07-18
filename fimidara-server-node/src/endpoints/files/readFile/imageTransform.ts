import {createHash} from 'crypto';
import sharp from 'sharp';
import {Readable} from 'stream';
import {File} from '../../../definitions/file.js';
import {kFileConstants} from '../constants.js';
import {
  ImageNotProcessableError,
  ImageTransformValidationError,
} from '../errors.js';
import {
  imageFormatToExt,
  imageFormatToMimetype,
  resolveOutputImageFormat,
} from './imageFormat.js';
import {
  ImageFormatEnum,
  ImageFormatEnumMap,
  ImageResizeParams,
} from './types.js';

export type CanonicalImageTransformParams = {
  width?: number;
  height?: number;
  fit?: string;
  position?: string | number;
  background?: string;
  withoutEnlargement?: boolean;
  format: ImageFormatEnum;
};

export function buildCanonicalTransformParams(params: {
  imageResize?: ImageResizeParams;
  imageFormat?: ImageFormatEnum;
  file: Pick<File, 'mimetype' | 'ext'>;
}): CanonicalImageTransformParams {
  const format = resolveOutputImageFormat(params.imageFormat, params.file);
  const resize = params.imageResize ?? {};
  const canonical: CanonicalImageTransformParams = {format};

  if (resize.width != null) canonical.width = resize.width;
  if (resize.height != null) canonical.height = resize.height;
  if (resize.fit != null) canonical.fit = resize.fit;
  if (resize.position != null) canonical.position = resize.position;
  if (resize.background != null) canonical.background = resize.background;
  if (resize.withoutEnlargement != null) {
    canonical.withoutEnlargement = resize.withoutEnlargement;
  }

  return canonical;
}

export function hashCanonicalTransformParams(
  params: CanonicalImageTransformParams
): string {
  const keys = Object.keys(params).sort() as Array<
    keyof CanonicalImageTransformParams
  >;
  const normalized: Record<string, unknown> = {};
  for (const key of keys) {
    const value = params[key];
    if (value !== undefined && value !== null) {
      normalized[key] = value;
    }
  }

  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

export function validateImageTransformDimensions(
  resize: ImageResizeParams | undefined
): void {
  if (!resize) {
    return;
  }

  const width = resize.width;
  const height = resize.height;
  if (width != null && height != null) {
    if (width * height > kFileConstants.maxImagePixelArea) {
      throw new ImageTransformValidationError(
        `Requested dimensions exceed max pixel area (${kFileConstants.maxImagePixelArea}).`
      );
    }
  } else if (width != null) {
    if (
      width * kFileConstants.maxFileHeight >
      kFileConstants.maxImagePixelArea
    ) {
      throw new ImageTransformValidationError(
        `Requested width exceeds max pixel area (${kFileConstants.maxImagePixelArea}).`
      );
    }
  } else if (height != null) {
    if (
      height * kFileConstants.maxFileWidth >
      kFileConstants.maxImagePixelArea
    ) {
      throw new ImageTransformValidationError(
        `Requested height exceeds max pixel area (${kFileConstants.maxImagePixelArea}).`
      );
    }
  }
}

export type TransformedImageFileResult = {
  mimetype: string;
  ext: string;
  format: ImageFormatEnum;
  contentLength: number;
};

function applyOutputFormat(
  pipeline: sharp.Sharp,
  format: ImageFormatEnum
): sharp.Sharp {
  switch (format) {
    case ImageFormatEnumMap.avif:
      return pipeline.avif({quality: kFileConstants.defaultAvifQuality});
    case ImageFormatEnumMap.jpeg:
      return pipeline.jpeg();
    case ImageFormatEnumMap.png:
      return pipeline.png();
    case ImageFormatEnumMap.webp:
      return pipeline.webp();
    case ImageFormatEnumMap.tiff:
      return pipeline.tiff();
    case ImageFormatEnumMap.gif:
      return pipeline.gif();
    case ImageFormatEnumMap.raw:
      return pipeline.raw();
    default:
      return pipeline.toFormat(format);
  }
}

function buildSharpPipeline(
  input: Readable | Buffer,
  imageResize: ImageResizeParams | undefined,
  format: ImageFormatEnum
): sharp.Sharp {
  // sequentialRead lets libvips stream decode→encode when possible.
  // sharp@0.32 accepts stream input only via pipe (not constructor + options).
  let pipeline: sharp.Sharp;
  if (Buffer.isBuffer(input)) {
    pipeline = sharp(input, {failOn: 'error', sequentialRead: true});
  } else {
    pipeline = sharp({failOn: 'error', sequentialRead: true});
    input.pipe(pipeline);
  }

  // rotate() applies EXIF orientation; metadata is omitted on encode by default.
  pipeline = pipeline.rotate();

  if (imageResize) {
    const resize = imageResize;
    const hasDims = resize.width != null || resize.height != null;
    if (hasDims) {
      pipeline = pipeline.resize({
        withoutEnlargement: resize.withoutEnlargement,
        background: resize.background,
        position: resize.position,
        height: resize.height,
        width: resize.width,
        fit: resize.fit,
      });
    }
  }

  return applyOutputFormat(pipeline, format);
}

/**
 * Streams an image through sharp and writes the result to `outputPath`.
 * Pixel-area is validated from requested dimensions only.
 *
 * TODO: Clean preflight for animated GIF/WebP and multi-page TIFF via
 * sharp.metadata() on a path/stream (header-only — does not require buffering
 * the whole body). Until then, those inputs may fail inside sharp or yield an
 * unexpected still frame rather than a dedicated error. Also TODO: full
 * multi-frame/page transform support (resize all frames, delays, cache key).
 */
export async function transformImageToFile(params: {
  input: Readable | Buffer;
  imageResize?: ImageResizeParams;
  format: ImageFormatEnum;
  outputPath: string;
}): Promise<TransformedImageFileResult> {
  validateImageTransformDimensions(params.imageResize);

  try {
    const pipeline = buildSharpPipeline(
      params.input,
      params.imageResize,
      params.format
    );
    const info = await pipeline.toFile(params.outputPath);

    return {
      format: params.format,
      mimetype: imageFormatToMimetype(params.format),
      ext: imageFormatToExt(params.format),
      contentLength: info.size,
    };
  } catch (error) {
    if (
      error instanceof ImageTransformValidationError ||
      error instanceof ImageNotProcessableError
    ) {
      throw error;
    }

    throw new ImageNotProcessableError(
      error instanceof Error ? error.message : undefined
    );
  }
}
