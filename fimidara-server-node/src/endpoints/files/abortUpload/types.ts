import {FileMatcher} from '../../../definitions/file.js';
import {Endpoint} from '../../types.js';

export interface AbortUploadEndpointParams extends FileMatcher {
  clientMultipartId?: string;
  part?: number;
}

export interface AbortUploadEndpointResult {}

export type AbortUploadEndpoint = Endpoint<
  AbortUploadEndpointParams,
  AbortUploadEndpointResult
>;
