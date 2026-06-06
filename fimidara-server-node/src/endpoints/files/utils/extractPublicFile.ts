import {File, PublicFile} from '../../../definitions/file.js';
import {makeExtract} from '../../../utils/extract.js';
import {
  getFileReadAvailability,
  getFileWriteAvailability,
} from './availability.js';
import {fileFields} from './fileFields.js';

const publicFileExtractor = makeExtract(fileFields);

export function extractPublicFile(
  file: File,
  uploadActorId: string
): PublicFile {
  const base = publicFileExtractor(file);

  return {
    ...base,
    read: getFileReadAvailability(file, uploadActorId),
    write: getFileWriteAvailability(file, uploadActorId),
  };
}

export function extractPublicFileList(
  files: File[],
  uploadActorId: string
): PublicFile[] {
  return files.map(file => extractPublicFile(file, uploadActorId));
}

/** For contexts without a requester (e.g. generic resource extractors). */
export function extractPublicFileWithoutAgent(file: File): PublicFile {
  const base = publicFileExtractor(file);
  const read = getFileReadAvailability(file, '');
  const write = getFileWriteAvailability(file, '');

  return {
    ...base,
    read: {...read, availableForYou: read.available},
    write: {...write, availableForYou: write.available},
  };
}
