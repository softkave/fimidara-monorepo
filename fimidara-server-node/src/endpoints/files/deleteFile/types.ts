import {FileMatcher} from '../../../definitions/file.js';
import {LongRunningJobResult} from '../../jobs/types.js';
import {Endpoint} from '../../types.js';

export interface DeleteFileEndpointParams extends FileMatcher {}

export type DeleteFileEndpoint = Endpoint<
  DeleteFileEndpointParams,
  LongRunningJobResult
>;
