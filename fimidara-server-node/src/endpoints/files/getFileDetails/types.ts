import {FileMatcher, PublicFile} from '../../../definitions/file.js';
import {Endpoint} from '../../types.js';

export interface GetFileDetailsEndpointParams extends FileMatcher {
  uploadSessionId?: string;
}

export interface GetFileDetailsEndpointResult {
  file: PublicFile;
}

export type GetFileDetailsEndpoint = Endpoint<
  GetFileDetailsEndpointParams,
  GetFileDetailsEndpointResult
>;
