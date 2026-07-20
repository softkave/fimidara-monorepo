import {
  File,
  ImageFormatEnum,
  ImageFormatEnumMap,
  kExtToFormat,
  kFormatToExt,
  kFormatToMime,
  kMimeToFormat,
} from '../../../definitions/file.js';

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
