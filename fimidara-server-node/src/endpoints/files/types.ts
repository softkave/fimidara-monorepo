import {MfdocFieldBinaryTypePrimitive} from 'mfdoc';
import {EmptyObject} from '../../utils/types.js';
import {
  ExportedHttpEndpointWithMfdocDefinition,
  HttpEndpointRequestHeaders_AuthOptional,
  HttpEndpointRequestHeaders_AuthOptional_ContentType,
  HttpEndpointResponseHeaders_ContentType_ContentLength,
} from '../types.js';
import {CompleteMultipartUploadEndpoint} from './completeMultipartUpload/types.js';
import {DeleteFileEndpoint} from './deleteFile/types.js';
import {GetFileDetailsEndpoint} from './getFileDetails/types.js';
import {ListPartsEndpoint} from './listParts/types.js';
import {
  ReadFileEndpoint,
  ReadFileEndpointHttpQuery,
  ReadFileEndpointParams,
} from './readFile/types.js';
import {StartMultipartUploadEndpoint} from './startMultipartUpload/types.js';
import {UpdateFileDetailsEndpoint} from './updateFileDetails/types.js';
import {
  UploadFileEndpoint,
  UploadFileEndpointParams,
  UploadFileEndpointResult,
} from './uploadFile/types.js';

export type UploadFileEndpointHTTPHeaders =
  HttpEndpointRequestHeaders_AuthOptional_ContentType & {
    'x-fimidara-file-encoding'?: string;
    'x-fimidara-file-description'?: string;
    'x-fimidara-file-mimetype'?: string;
    'x-fimidara-file-size'?: number;
    'x-fimidara-multipart-id'?: string;
    'x-fimidara-multipart-part'?: number;
    'content-length': number;
  };

export type ReadFileEndpointHTTPHeaders =
  HttpEndpointResponseHeaders_ContentType_ContentLength & {
    'Content-Disposition'?: string;
    'Accept-Ranges'?: string;
    'Last-Modified'?: string;
    ETag?: string;
    'Content-Range'?: string;
  };

export type ReadFilePOSTHttpEndpoint = ExportedHttpEndpointWithMfdocDefinition<
  /** TEndpoint */ ReadFileEndpoint,
  /** TRequestHeaders */ HttpEndpointRequestHeaders_AuthOptional_ContentType,
  /** TPathParameters */ FileMatcherPathParameters,
  /** TQuery */ ReadFileEndpointHttpQuery,
  /** TRequestBody */ ReadFileEndpointParams,
  /** TResponseHeaders */ ReadFileEndpointHTTPHeaders,
  /** TResponseBody */ MfdocFieldBinaryTypePrimitive,
  /** TSdkparams */ ReadFileEndpointParams
>;
export type ReadFileGETHttpEndpoint = ExportedHttpEndpointWithMfdocDefinition<
  /** TEndpoint */ ReadFileEndpoint,
  /** TRequestHeaders */ HttpEndpointRequestHeaders_AuthOptional,
  /** TPathParameters */ FileMatcherPathParameters,
  /** TQuery */ ReadFileEndpointHttpQuery,
  /** TRequestBody */ {},
  /** TResponseHeaders */ ReadFileEndpointHTTPHeaders,
  /** TResponseBody */ MfdocFieldBinaryTypePrimitive,
  /** TSdkparams */ ReadFileEndpointParams
>;
export type ReadFileHEADHttpEndpoint = ExportedHttpEndpointWithMfdocDefinition<
  /** TEndpoint */ ReadFileEndpoint,
  /** TRequestHeaders */ HttpEndpointRequestHeaders_AuthOptional,
  /** TPathParameters */ FileMatcherPathParameters,
  /** TQuery */ ReadFileEndpointHttpQuery,
  /** TRequestBody */ {},
  /** TResponseHeaders */ ReadFileEndpointHTTPHeaders,
  /** TResponseBody */ undefined,
  /** TSdkparams */ ReadFileEndpointParams
>;
export type DeleteFileHttpEndpoint =
  ExportedHttpEndpointWithMfdocDefinition<DeleteFileEndpoint>;
export type GetFileDetailsHttpEndpoint =
  ExportedHttpEndpointWithMfdocDefinition<GetFileDetailsEndpoint>;
export type ListPartsHttpEndpoint =
  ExportedHttpEndpointWithMfdocDefinition<ListPartsEndpoint>;
export type UpdateFileDetailsHttpEndpoint =
  ExportedHttpEndpointWithMfdocDefinition<UpdateFileDetailsEndpoint>;
export type UploadFileEndpointSdkParams = UploadFileEndpointParams;
export type UploadFileHttpEndpoint = ExportedHttpEndpointWithMfdocDefinition<
  /** TEndpoint */ UploadFileEndpoint,
  /** TRequestHeaders */ UploadFileEndpointHTTPHeaders,
  /** TPathParameters */ FileMatcherPathParameters,
  /** TQuery */ EmptyObject,
  /** TRequestBody */ Pick<UploadFileEndpointParams, 'data'>,
  /** TResponseHeaders */ HttpEndpointResponseHeaders_ContentType_ContentLength,
  /** TResponseBody */ UploadFileEndpointResult,
  /** TSdkparams */ UploadFileEndpointSdkParams
>;
export type StartMultipartUploadHttpEndpoint =
  ExportedHttpEndpointWithMfdocDefinition<StartMultipartUploadEndpoint>;
export type CompleteMultipartUploadHttpEndpoint =
  ExportedHttpEndpointWithMfdocDefinition<CompleteMultipartUploadEndpoint>;

export type FilesExportedEndpoints = {
  readFile: [
    ReadFilePOSTHttpEndpoint,
    ReadFileGETHttpEndpoint,
    ReadFileHEADHttpEndpoint
  ];
  deleteFile: DeleteFileHttpEndpoint;
  getFileDetails: GetFileDetailsHttpEndpoint;
  updateFileDetails: UpdateFileDetailsHttpEndpoint;
  uploadFile: UploadFileHttpEndpoint;
  listParts: ListPartsHttpEndpoint;
  startMultipartUpload: StartMultipartUploadHttpEndpoint;
  completeMultipartUpload: CompleteMultipartUploadHttpEndpoint;
};

export type FileMatcherPathParameters = {
  filepathOrId?: string;
};
