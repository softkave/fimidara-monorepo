import {OmitFrom} from 'softkave-js-utils';
import {Readable} from 'stream';
import {
  FilePersistenceStartMultipartUploadParams,
  FilePersistenceStartMultipartUploadResult,
} from '../../../contexts/file/types.js';
import {
  FileMatcher,
  FileWithRuntimeData,
  PublicFile,
} from '../../../definitions/file.js';
import {Endpoint} from '../../types.js';

export interface UploadFileEndpointParams extends FileMatcher {
  description?: string;
  mimetype?: string; // TODO: define mimetypes
  encoding?: string;
  data: Readable;
  size: number;
  part?: number;
  clientMultipartId?: string;
  append?: boolean;
  onAppendCreateIfNotExists?: boolean;
}

export interface UploadFileEndpointResult {
  file: PublicFile;
}

export type UploadFileEndpoint = Endpoint<
  UploadFileEndpointParams,
  UploadFileEndpointResult
>;

export type IInternalMultipartIdQueueInput = OmitFrom<
  FilePersistenceStartMultipartUploadParams,
  'filepath'
> & {
  namepath: string[];
  clientMultipartId: string;
  mountFilepath: string;
};

export type IInternalMultipartIdQueueOutput =
  FilePersistenceStartMultipartUploadResult;

export interface IPrepareFileQueueInput
  extends Pick<
    UploadFileEndpointParams,
    'filepath' | 'clientMultipartId' | 'fileId'
  > {
  workspaceId: string;
  shouldCreate?: boolean; // defaults to true
}

export type IPrepareFileQueueOutput = FileWithRuntimeData;
