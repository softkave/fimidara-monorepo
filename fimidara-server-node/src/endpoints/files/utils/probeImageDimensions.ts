import sharp from 'sharp';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {
  File,
  kImageDimensionsStatus,
} from '../../../definitions/file.js';
import {isProcessableImageFile} from '../readFile/imageFormat.js';
import {readPersistedFile} from '../readFile/readPersistedFile.js';

/** Whether getFileDetails / backfill should attempt a dimensions probe. */
export function fileNeedsImageDimensionsProbe(
  file: Pick<
    File,
    'mimetype' | 'ext' | 'imageWidth' | 'imageHeight' | 'imageDimensionsStatus'
  >
): boolean {
  if (!isProcessableImageFile(file)) {
    return false;
  }

  if (
    file.imageDimensionsStatus === kImageDimensionsStatus.unsupported ||
    file.imageDimensionsStatus === kImageDimensionsStatus.failed
  ) {
    return false;
  }

  if (
    file.imageDimensionsStatus === kImageDimensionsStatus.ready &&
    file.imageWidth != null &&
    file.imageHeight != null
  ) {
    return false;
  }

  return true;
}

/** EXIF orientations 5–8 swap width/height for display. */
export function displaySizeFromMetadata(meta: {
  width?: number;
  height?: number;
  orientation?: number;
}): {width: number; height: number} | undefined {
  if (!meta.width || !meta.height) {
    return undefined;
  }

  const orientation = meta.orientation ?? 1;
  if (orientation >= 5 && orientation <= 8) {
    return {width: meta.height, height: meta.width};
  }

  return {width: meta.width, height: meta.height};
}

async function readImageMetadata(
  input: NodeJS.ReadableStream | Buffer
): Promise<sharp.Metadata> {
  if (Buffer.isBuffer(input)) {
    return sharp(input, {failOn: 'error', sequentialRead: true}).metadata();
  }

  const pipeline = sharp({failOn: 'error', sequentialRead: true});
  input.pipe(pipeline);
  return pipeline.metadata();
}

export type ProbeImageDimensionsResult = {
  file: File;
  updated: boolean;
};

function asProbeResult(
  file: File,
  updated: File | null | undefined
): ProbeImageDimensionsResult {
  return {file: updated ?? file, updated: !!updated};
}

function hasReadyDimensions(
  file: Pick<File, 'imageWidth' | 'imageHeight' | 'imageDimensionsStatus'>
): boolean {
  return (
    file.imageDimensionsStatus === kImageDimensionsStatus.ready &&
    file.imageWidth != null &&
    file.imageHeight != null
  );
}

function isTerminalDimensionsStatus(
  file: Pick<File, 'imageDimensionsStatus'>
): boolean {
  return (
    file.imageDimensionsStatus === kImageDimensionsStatus.unsupported ||
    file.imageDimensionsStatus === kImageDimensionsStatus.failed
  );
}

async function markImageDimensionsUnsupported(
  file: File
): Promise<ProbeImageDimensionsResult> {
  const updated = await kIjxSemantic.utils().withTxn(async opts => {
    return kIjxSemantic.file().getAndUpdateOneById(
      file.resourceId,
      {
        imageWidth: null,
        imageHeight: null,
        imageDimensionsStatus: kImageDimensionsStatus.unsupported,
      },
      opts
    );
  });
  return asProbeResult(file, updated);
}

async function readDisplaySizeFromStorage(file: File): Promise<{
  width: number;
  height: number;
}> {
  const persisted = await readPersistedFile(file, undefined);
  if (persisted.streams.length === 0) {
    throw new Error('Could not read source file for image dimensions');
  }

  const stream = persisted.streams[0];
  try {
    const meta = await readImageMetadata(stream);
    const size = displaySizeFromMetadata(meta);
    if (!size) {
      throw new Error('Image metadata missing width/height');
    }
    return size;
  } finally {
    stream.destroy?.();
  }
}

async function updateDimensionsIfVersionUnchanged(params: {
  fileId: string;
  versionAtStart: number;
  update: Partial<File>;
  shouldSkip?: (current: File) => boolean;
}): Promise<File | null> {
  const {fileId, versionAtStart, update, shouldSkip} = params;

  return kIjxSemantic.utils().withTxn(async opts => {
    const current = await kIjxSemantic.file().getOneById(fileId, opts);
    if (!current || current.version !== versionAtStart) {
      return null;
    }
    if (shouldSkip?.(current)) {
      return null;
    }

    return kIjxSemantic.file().getAndUpdateOneById(fileId, update, opts);
  });
}

async function persistReadyImageDimensions(params: {
  file: File;
  versionAtStart: number;
  width: number;
  height: number;
}): Promise<ProbeImageDimensionsResult> {
  const {file, versionAtStart, width, height} = params;
  const updated = await updateDimensionsIfVersionUnchanged({
    fileId: file.resourceId,
    versionAtStart,
    update: {
      imageWidth: width,
      imageHeight: height,
      imageDimensionsStatus: kImageDimensionsStatus.ready,
    },
    shouldSkip: hasReadyDimensions,
  });
  return asProbeResult(file, updated);
}

async function persistFailedImageDimensions(params: {
  file: File;
  versionAtStart: number;
  fileId: string;
  error: unknown;
}): Promise<ProbeImageDimensionsResult> {
  const {file, versionAtStart, fileId, error} = params;

  kIjxUtils.logger().error({
    message: 'Failed to probe image dimensions',
    reason: error,
    fileId,
  });

  const updated = await updateDimensionsIfVersionUnchanged({
    fileId,
    versionAtStart,
    update: {
      imageWidth: null,
      imageHeight: null,
      imageDimensionsStatus: kImageDimensionsStatus.failed,
    },
    shouldSkip: current =>
      current.imageDimensionsStatus === kImageDimensionsStatus.ready,
  });
  return asProbeResult(file, updated);
}

/**
 * Probe image width/height from storage and persist when still pending/missing.
 * Non-images → unsupported. Probe errors → failed. Does not throw for probe
 * failures.
 */
export async function probeAndPersistImageDimensions(
  fileId: string
): Promise<ProbeImageDimensionsResult> {
  const file = await kIjxSemantic.file().getOneById(fileId);
  if (!file) {
    throw new Error(`File not found: ${fileId}`);
  }

  if (hasReadyDimensions(file) || isTerminalDimensionsStatus(file)) {
    return {file, updated: false};
  }

  if (!isProcessableImageFile(file)) {
    return markImageDimensionsUnsupported(file);
  }

  const versionAtStart = file.version;

  try {
    const size = await readDisplaySizeFromStorage(file);
    return persistReadyImageDimensions({
      file,
      versionAtStart,
      width: size.width,
      height: size.height,
    });
  } catch (error) {
    return persistFailedImageDimensions({
      file,
      versionAtStart,
      fileId,
      error,
    });
  }
}
