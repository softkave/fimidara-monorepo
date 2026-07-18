import {File} from '../../../definitions/file.js';
import {ImageFormatEnum, ImageFormatEnumMap} from './types.js';

const kExtToFormat: Record<string, ImageFormatEnum> = {
  jpg: ImageFormatEnumMap.jpeg,
  jpeg: ImageFormatEnumMap.jpeg,
  png: ImageFormatEnumMap.png,
  webp: ImageFormatEnumMap.webp,
  tiff: ImageFormatEnumMap.tiff,
  tif: ImageFormatEnumMap.tiff,
  gif: ImageFormatEnumMap.gif,
  avif: ImageFormatEnumMap.avif,
  raw: ImageFormatEnumMap.raw,
};

const kMimeToFormat: Record<string, ImageFormatEnum> = {
  'image/jpeg': ImageFormatEnumMap.jpeg,
  'image/jpg': ImageFormatEnumMap.jpeg,
  'image/png': ImageFormatEnumMap.png,
  'image/webp': ImageFormatEnumMap.webp,
  'image/tiff': ImageFormatEnumMap.tiff,
  'image/gif': ImageFormatEnumMap.gif,
  'image/avif': ImageFormatEnumMap.avif,
};

const kFormatToMime: Record<ImageFormatEnum, string> = {
  [ImageFormatEnumMap.jpeg]: 'image/jpeg',
  [ImageFormatEnumMap.png]: 'image/png',
  [ImageFormatEnumMap.webp]: 'image/webp',
  [ImageFormatEnumMap.tiff]: 'image/tiff',
  [ImageFormatEnumMap.raw]: 'application/octet-stream',
  [ImageFormatEnumMap.gif]: 'image/gif',
  [ImageFormatEnumMap.avif]: 'image/avif',
};

const kFormatToExt: Record<ImageFormatEnum, string> = {
  [ImageFormatEnumMap.jpeg]: 'jpg',
  [ImageFormatEnumMap.png]: 'png',
  [ImageFormatEnumMap.webp]: 'webp',
  [ImageFormatEnumMap.tiff]: 'tiff',
  [ImageFormatEnumMap.raw]: 'raw',
  [ImageFormatEnumMap.gif]: 'gif',
  [ImageFormatEnumMap.avif]: 'avif',
};

/** Map a file extension (with or without leading dot) to an image format. */
export function extToImageFormat(
  ext: string | undefined | null
): ImageFormatEnum | undefined {
  if (!ext) {
    return undefined;
  }

  const normalized = ext.toLowerCase().replace(/^\./, '');
  return kExtToFormat[normalized];
}

export function isProcessableImageFile(
  file: Pick<File, 'mimetype' | 'ext'>
): boolean {
  const mime = file.mimetype?.toLowerCase();
  if (mime?.startsWith('image/')) {
    return true;
  }

  return !!extToImageFormat(file.ext);
}

export function resolveSourceImageFormat(
  file: Pick<File, 'mimetype' | 'ext'>
): ImageFormatEnum | undefined {
  const mime = file.mimetype?.toLowerCase();
  if (mime && kMimeToFormat[mime]) {
    return kMimeToFormat[mime];
  }

  return extToImageFormat(file.ext);
}

/** Prefer explicit format; otherwise preserve source format; fall back to jpeg. */
export function resolveOutputImageFormat(
  requested: ImageFormatEnum | undefined,
  file: Pick<File, 'mimetype' | 'ext'>
): ImageFormatEnum {
  if (requested) {
    return requested;
  }

  return resolveSourceImageFormat(file) ?? ImageFormatEnumMap.jpeg;
}

export function imageFormatToMimetype(format: ImageFormatEnum): string {
  return kFormatToMime[format];
}

export function imageFormatToExt(format: ImageFormatEnum): string {
  return kFormatToExt[format];
}
