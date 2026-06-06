import {FileMatcher, PublicFile} from '../../../definitions/file.js';
import {Endpoint} from '../../types.js';

export interface StartMultipartUploadEndpointParams extends FileMatcher {
  clientMultipartId: string;
  uploadSessionId?: string;
}

export interface StartMultipartUploadEndpointResult {
  file: PublicFile;
}

export type StartMultipartUploadEndpoint = Endpoint<
  StartMultipartUploadEndpointParams,
  StartMultipartUploadEndpointResult
>;
