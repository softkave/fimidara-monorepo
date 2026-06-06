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
  agentId: string,
  uploadSessionId?: string
): PublicFile {
  const base = publicFileExtractor(file);

  return {
    ...base,
    read: getFileReadAvailability(file, agentId, uploadSessionId),
    write: getFileWriteAvailability(file, uploadSessionId),
  };
}

export function extractPublicFileList(
  files: File[],
  agentId: string,
  uploadSessionId?: string
): PublicFile[] {
  return files.map(file =>
    extractPublicFile(file, agentId, uploadSessionId)
  );
}

/** For contexts without a requester (e.g. generic resource extractors). */
export function extractPublicFileWithoutAgent(file: File): PublicFile {
  const base = publicFileExtractor(file);
  const read = getFileReadAvailability(file, '');
  const write = getFileWriteAvailability(file);

  return {
    ...base,
    read: {...read, availableForYou: read.available},
    write: {...write, availableForYou: write.available},
  };
}
