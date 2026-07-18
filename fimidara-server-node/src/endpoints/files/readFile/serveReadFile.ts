import {Readable} from 'stream';
import {incrementBandwidthOutUsageRecord} from '../../../contexts/usage/usageFns.js';
import {File} from '../../../definitions/file.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {Agent, SessionAgent} from '../../../definitions/system.js';
import {isObjectFieldsEmpty} from '../../../utils/fns.js';
import {ImageNotProcessableError} from '../errors.js';
import {getOrCreateImageDerivative} from './imageDerivativeCache.js';
import {isProcessableImageFile} from './imageFormat.js';
import {
  buildCanonicalTransformParams,
  hashCanonicalTransformParams,
} from './imageTransform.js';
import {readPersistedFile} from './readPersistedFile.js';
import {
  ImageFormatEnum,
  ImageResizeParams,
  ReadFileEndpointResult,
} from './types.js';

export function hasImageTransformRequest(params: {
  imageResize?: ImageResizeParams;
  imageFormat?: ImageFormatEnum;
}): boolean {
  const isImageResizeEmpty = isObjectFieldsEmpty(params.imageResize ?? {});
  return !isImageResizeEmpty || !!params.imageFormat;
}

/** Fingerprint for ETag when a transform is requested; validates processable
 * image. */
export function getImageTransformFingerprint(params: {
  file: Pick<File, 'mimetype' | 'ext'>;
  imageResize?: ImageResizeParams;
  imageFormat?: ImageFormatEnum;
}): string {
  if (!isProcessableImageFile(params.file)) {
    throw new ImageNotProcessableError(
      'File is not a processable image for transform.'
    );
  }

  const canonical = buildCanonicalTransformParams({
    imageResize: params.imageResize,
    imageFormat: params.imageFormat,
    file: params.file,
  });
  return hashCanonicalTransformParams(canonical);
}

export async function readTransformedImage(params: {
  agent: Agent | SessionAgent;
  file: File;
  requestId: string;
  lastModified: number;
  etag: string;
  imageResize?: ImageResizeParams;
  imageFormat?: ImageFormatEnum;
}): Promise<ReadFileEndpointResult> {
  const isImageResizeEmpty = isObjectFieldsEmpty(params.imageResize ?? {});
  const canonical = buildCanonicalTransformParams({
    imageResize: params.imageResize,
    imageFormat: params.imageFormat,
    file: params.file,
  });

  const transformed = await getOrCreateImageDerivative({
    fileId: params.file.resourceId,
    lastUpdatedAt: params.lastModified,
    transform: canonical,
    imageResize: isImageResizeEmpty ? undefined : params.imageResize,
    loadOriginal: async () => {
      const persistedFileResult = await readPersistedFile(
        params.file,
        undefined
      );
      if (persistedFileResult.streams.length === 0) {
        throw new ImageNotProcessableError('Could not read source file.');
      }
      return persistedFileResult.streams[0];
    },
  });

  await incrementBandwidthOutUsageRecord({
    agent: params.agent,
    file: params.file,
    requestId: params.requestId,
    action: kFimidaraPermissionActions.readFile,
    usage: transformed.contentLength,
  });

  return {
    contentLength: transformed.contentLength,
    mimetype: transformed.mimetype,
    stream: transformed.stream,
    name: params.file.name,
    ext: transformed.ext,
    lastModified: params.lastModified,
    etag: params.etag,
    isImageTransform: true,
  };
}

export async function readRawFile(params: {
  agent: Agent | SessionAgent;
  file: File;
  requestId: string;
  lastModified: number;
  etag: string;
  ranges?: Array<{start: number; end: number}>;
}): Promise<ReadFileEndpointResult> {
  await incrementBandwidthOutUsageRecord({
    agent: params.agent,
    file: params.file,
    requestId: params.requestId,
    action: kFimidaraPermissionActions.readFile,
  });

  const persistedFileResult = await readPersistedFile(
    params.file,
    params.ranges
  );
  const streams = persistedFileResult.streams;
  const isMultipart = params.ranges ? streams.length > 1 : undefined;

  return {
    mimetype: params.file.mimetype ?? 'application/octet-stream',
    stream: isMultipart ? streams : streams[0] ?? Readable.from([]),
    contentLength: persistedFileResult.size,
    name: params.file.name,
    ext: params.file.ext,
    lastModified: params.lastModified,
    etag: params.etag,
    ranges: persistedFileResult.ranges,
    isMultipart,
  };
}
