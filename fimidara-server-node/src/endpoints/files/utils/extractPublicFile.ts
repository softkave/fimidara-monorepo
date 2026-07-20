import {
  File,
  ImageDimensionsStatus,
  PublicFile,
} from '../../../definitions/file.js';
import {makeExtract} from '../../../utils/extract.js';
import {
  getFileReadAvailability,
  getFileWriteAvailability,
} from './availability.js';
import {fileFields, withPublicFileAspectRatio} from './fileFields.js';

const publicFileExtractor = makeExtract(fileFields);

function publicImageFields(file: File): {
  imageWidth?: number;
  imageHeight?: number;
  imageDimensionsStatus?: ImageDimensionsStatus;
} {
  return {
    ...(file.imageWidth != null ? {imageWidth: file.imageWidth} : {}),
    ...(file.imageHeight != null ? {imageHeight: file.imageHeight} : {}),
    ...(file.imageDimensionsStatus != null
      ? {imageDimensionsStatus: file.imageDimensionsStatus}
      : {}),
  };
}

export function extractPublicFile(
  file: File,
  agentId: string,
  uploadSessionId?: string
): PublicFile {
  const base = publicFileExtractor(file);

  return withPublicFileAspectRatio({
    ...base,
    ...publicImageFields(file),
    read: getFileReadAvailability(file, agentId, uploadSessionId),
    write: getFileWriteAvailability(file, uploadSessionId),
  });
}

export function extractPublicFileList(
  files: File[],
  agentId: string,
  uploadSessionId?: string
): PublicFile[] {
  return files.map(file => extractPublicFile(file, agentId, uploadSessionId));
}

/** For contexts without a requester (e.g. generic resource extractors). */
export function extractPublicFileWithoutAgent(file: File): PublicFile {
  const base = publicFileExtractor(file);
  const read = getFileReadAvailability(file, '');
  const write = getFileWriteAvailability(file);

  return withPublicFileAspectRatio({
    ...base,
    ...publicImageFields(file),
    read: {...read, availableForYou: read.available},
    write: {...write, availableForYou: write.available},
  });
}
