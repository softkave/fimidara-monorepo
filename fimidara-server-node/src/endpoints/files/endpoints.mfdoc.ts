import assert from 'assert';
import {
  MfdocFieldBinaryTypePrimitive as FieldBinaryType,
  MfdocFieldObjectFieldsMap as FieldObjectFieldsMap,
  MfdocHttpEndpointMethod as HttpEndpointMethod,
  InferMfdocFieldObjectOrMultipartType as InferFieldObjectOrMultipartType,
  InferMfdocFieldObjectType as InferFieldObjectType,
  InferMfdocSdkParamsType as InferSdkParamsType,
  mfdocConstruct,
} from 'mfdoc';
import {EmptyObject} from 'type-fest';
import {FileMatcher, PublicFile, PublicPart} from '../../definitions/file.js';
import {kFimidaraResourceType} from '../../definitions/system.js';
import {
  fReusables,
  mfdocEndpointHttpHeaderItems,
  mfdocEndpointHttpResponseItems,
} from '../helpers.mfdoc.js';
import {kEndpointTag} from '../types.js';
import {
  CompleteMultipartUploadEndpointParams,
  CompleteMultipartUploadEndpointResult,
  CompleteMultipartUploadInputPart,
} from './completeMultipartUpload/types.js';
import {kFileConstants} from './constants.js';
import {DeleteFileEndpointParams} from './deleteFile/types.js';
import {
  GetFileDetailsEndpointParams,
  GetFileDetailsEndpointResult,
} from './getFileDetails/types.js';
import {
  ListPartsEndpointParams,
  ListPartsEndpointResult,
} from './listParts/types.js';
import {
  ImageFormatEnumMap,
  ImageResizeFitEnumMap,
  ImageResizeParams,
  ImageResizePositionEnumMap,
  ReadFileEndpointHttpQuery,
  ReadFileEndpointParams,
} from './readFile/types.js';
import {
  StartMultipartUploadEndpointParams,
  StartMultipartUploadEndpointResult,
} from './startMultipartUpload/types.js';
import {
  CompleteMultipartUploadHttpEndpoint,
  DeleteFileHttpEndpoint,
  FileMatcherPathParameters,
  GetFileDetailsHttpEndpoint,
  ListPartsHttpEndpoint,
  ReadFileEndpointHTTPRequestHeaders_GET,
  ReadFileEndpointHTTPRequestHeaders_POST,
  ReadFileEndpointHTTPResponseHeaders,
  ReadFileGETHttpEndpoint,
  ReadFileHEADHttpEndpoint,
  ReadFilePOSTHttpEndpoint,
  StartMultipartUploadHttpEndpoint,
  UpdateFileDetailsHttpEndpoint,
  UploadFileEndpointHTTPHeaders,
  UploadFileEndpointSdkParams,
  UploadFileHttpEndpoint,
} from './types.js';
import {
  UpdateFileDetailsEndpointParams,
  UpdateFileDetailsEndpointResult,
  UpdateFileDetailsInput,
} from './updateFileDetails/types.js';
import {
  UploadFileEndpointParams,
  UploadFileEndpointResult,
} from './uploadFile/types.js';

const mimetype = mfdocConstruct.constructString({
  description: 'File MIME type',
  example: 'image/jpeg',
});
const encoding = mfdocConstruct.constructString({
  description: 'File encoding',
  example: 'utf8',
});
const size = mfdocConstruct.constructNumber({
  description: 'File size in bytes',
  max: kFileConstants.maxFileSizeInBytes,
  example: 1024000,
});
const ext = mfdocConstruct.constructString({
  description: 'File ext, case insensitive',
  example: 'jpg',
});
const height = mfdocConstruct.constructNumber({
  description: 'Resize to height if file is an image',
  example: 400,
});
const width = mfdocConstruct.constructNumber({
  description: 'Resize to width if file is an image',
  example: 600,
});
const fit = mfdocConstruct.constructString({
  description: 'How the image should be resized to fit provided dimensions',
  enumName: 'ImageResizeFitEnum',
  valid: Object.values(ImageResizeFitEnumMap),
  example: 'cover',
});
const positionEnum = mfdocConstruct.constructString({
  description: 'Gravity or strategy to use when fit is cover or contain',
  enumName: 'ImageResizePositionEnum',
  valid: Object.values(ImageResizePositionEnumMap),
  example: 'center',
});
const positionNum = mfdocConstruct.constructNumber({
  description: 'Position to use when fit is cover or contain',
  example: 5,
});
const position = mfdocConstruct.constructOrCombination<
  [typeof positionEnum, typeof positionNum]
>({
  types: [positionEnum, positionNum],
  description: 'Position or gravity to use when fit is cover or contain',
});
const background = mfdocConstruct.constructString({
  description: 'Hex background color to use when fit is contain',
  example: '#FFFFFF',
});
const withoutEnlargement = mfdocConstruct.constructBoolean({
  description:
    'Do not enlarge if the width or height are already less than provided dimensions',
  example: true,
});
const format = mfdocConstruct.constructString({
  description: 'Format to transform image to if file is an image',
  enumName: 'ImageFormatEnum',
  valid: Object.values(ImageFormatEnumMap),
  example: 'webp',
});
const version = mfdocConstruct.constructNumber({
  description:
    'File version, representing how many times a file has been uploaded',
  example: 1,
});
const downloadQueryParam = mfdocConstruct.constructBoolean({
  description:
    'Whether the server should add "Content-Disposition: attachment" header ' +
    'which forces browsers to download files like HTML, JPEG, etc. which ' +
    "it'll otherwise open in the browser",
  example: false,
});
const rangeStart = mfdocConstruct.constructNumber({
  description: 'Start byte position of a range',
  example: 0,
});
const rangeEnd = mfdocConstruct.constructNumber({
  description: 'End byte position of a range',
  example: 499,
});
const range = mfdocConstruct.constructObject<{start: number; end: number}>({
  name: 'Range',
  description: 'Byte range with start and end positions',
  fields: {
    start: mfdocConstruct.constructObjectField({
      required: true,
      data: rangeStart,
    }),
    end: mfdocConstruct.constructObjectField({
      required: true,
      data: rangeEnd,
    }),
  },
});
const ranges = mfdocConstruct.constructArray<{start: number; end: number}>({
  description:
    'Array of byte ranges to request. For single range, array has one element. ' +
    'For multipart ranges, array has multiple elements.',
  type: range,
});
const rangeHeader = mfdocConstruct.constructString({
  description: 'HTTP Range header specifying byte range(s) to request',
  example: 'bytes=0-499',
});
const ifRangeHeader = mfdocConstruct.constructString({
  description:
    'HTTP If-Range header value (ETag or Last-Modified date) for conditional range requests',
  example: '"etag-value"',
});

const file = mfdocConstruct.constructObject<PublicFile>({
  name: 'File',
  description: 'File resource with metadata and location information',
  fields: {
    ...fReusables.workspaceResourceParts,
    size: mfdocConstruct.constructObjectField({required: true, data: size}),
    ext: mfdocConstruct.constructObjectField({required: false, data: ext}),
    parentId: mfdocConstruct.constructObjectField({
      required: true,
      data: fReusables.folderIdOrNull,
    }),
    idPath: mfdocConstruct.constructObjectField({
      required: true,
      data: fReusables.idPath,
    }),
    namepath: mfdocConstruct.constructObjectField({
      required: true,
      data: fReusables.namepathList,
    }),
    mimetype: mfdocConstruct.constructObjectField({
      required: false,
      data: mimetype,
    }),
    encoding: mfdocConstruct.constructObjectField({
      required: false,
      data: encoding,
    }),
    name: mfdocConstruct.constructObjectField({
      required: true,
      data: fReusables.filename,
    }),
    description: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.description,
    }),
    version: mfdocConstruct.constructObjectField({
      required: true,
      data: version,
    }),
  },
});

const updateFileDetailsInput =
  mfdocConstruct.constructObject<UpdateFileDetailsInput>({
    name: 'UpdateFileDetailsInput',
    description:
      'Input data for updating file details like description and MIME type',
    fields: {
      description: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.description,
      }),
      mimetype: mfdocConstruct.constructObjectField({
        required: false,
        data: mimetype,
      }),
    },
  });

const fileMatcherParts: FieldObjectFieldsMap<FileMatcher> = {
  filepath: mfdocConstruct.constructObjectField({
    required: false,
    data: fReusables.filepath,
  }),
  fileId: mfdocConstruct.constructObjectField({
    required: false,
    data: fReusables.fileId,
  }),
};

const fileMatcherPathParameters =
  mfdocConstruct.constructObject<FileMatcherPathParameters>({
    name: 'FileMatcherPathParameters',
    description:
      'Path parameters for identifying a file by either filepath or file ID',
    fields: {
      filepathOrId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.filepathOrId,
      }),
    },
  });

const updateFileDetailsParams =
  mfdocConstruct.constructObject<UpdateFileDetailsEndpointParams>({
    name: 'UpdateFileDetailsEndpointParams',
    description: 'Parameters for updating file details',
    fields: {
      file: mfdocConstruct.constructObjectField({
        required: true,
        data: updateFileDetailsInput,
      }),
      ...fileMatcherParts,
    },
  });
const updateFileDetailsResponseBody =
  mfdocConstruct.constructObject<UpdateFileDetailsEndpointResult>({
    name: 'UpdateFileDetailsEndpointResult',
    description: 'Response containing the updated file details',
    fields: {
      file: mfdocConstruct.constructObjectField({required: true, data: file}),
    },
  });

const getFileDetailsParams =
  mfdocConstruct.constructObject<GetFileDetailsEndpointParams>({
    name: 'GetFileDetailsEndpointParams',
    description: 'Parameters for retrieving file details',
    fields: {...fileMatcherParts},
  });
const getFileDetailsResponseBody =
  mfdocConstruct.constructObject<GetFileDetailsEndpointResult>({
    name: 'GetFileDetailsEndpointResult',
    description: 'Response containing the requested file details',
    fields: {
      file: mfdocConstruct.constructObjectField({required: true, data: file}),
    },
  });

const deleteFileParams =
  mfdocConstruct.constructObject<DeleteFileEndpointParams>({
    name: 'DeleteFileEndpointParams',
    description:
      'Parameters for deleting a file or specific multipart upload parts',
    fields: {
      ...fileMatcherParts,
      clientMultipartId: mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocConstruct.constructString({
          description:
            'Client generated unique identifier for multipart uploads. ' +
            'It is used to identify the same multipart upload across multiple requests',
          example: 'upload-123e4567-e89b-12d3-a456-426614174000',
        }),
      }),
      part: mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocConstruct.constructNumber({
          description: 'Part number of the multipart upload',
          example: 1,
        }),
      }),
    },
  });

const readFileParams = mfdocConstruct.constructObject<ReadFileEndpointParams>({
  name: 'ReadFileEndpointParams',
  description:
    'Parameters for reading/downloading a file with optional image processing',
  fields: {
    ...fileMatcherParts,
    imageResize: mfdocConstruct.constructObjectField({
      required: false,
      data: mfdocConstruct.constructObject<ImageResizeParams>({
        name: 'ImageResizeParams',
        description:
          'Parameters for resizing images on-the-fly during file retrieval',
        fields: {
          width: mfdocConstruct.constructObjectField({
            required: false,
            data: width,
          }),
          height: mfdocConstruct.constructObjectField({
            required: false,
            data: height,
          }),
          fit: mfdocConstruct.constructObjectField({
            required: false,
            data: fit,
          }),
          position: mfdocConstruct.constructObjectField({
            required: false,
            data: position,
          }),
          background: mfdocConstruct.constructObjectField({
            required: false,
            data: background,
          }),
          withoutEnlargement: mfdocConstruct.constructObjectField({
            required: false,
            data: withoutEnlargement,
          }),
        },
      }),
    }),
    imageFormat: mfdocConstruct.constructObjectField({
      required: false,
      data: format,
    }),
    download: mfdocConstruct.constructObjectField({
      required: false,
      data: downloadQueryParam,
    }),
    ranges: mfdocConstruct.constructObjectField({
      required: false,
      data: ranges,
    }),
    rangeHeader: mfdocConstruct.constructObjectField({
      required: false,
      data: rangeHeader,
    }),
    ifRangeHeader: mfdocConstruct.constructObjectField({
      required: false,
      data: ifRangeHeader,
    }),
  },
});
const readFileQuery = mfdocConstruct.constructObject<ReadFileEndpointHttpQuery>(
  {
    name: 'ReadFileEndpointHttpQuery',
    description: 'Query parameters for the read file HTTP endpoint',
    fields: {
      w: mfdocConstruct.constructObjectField({required: false, data: width}),
      h: mfdocConstruct.constructObjectField({required: false, data: height}),
      pos: mfdocConstruct.constructObjectField({
        required: false,
        data: position,
      }),
      fit: mfdocConstruct.constructObjectField({required: false, data: fit}),
      bg: mfdocConstruct.constructObjectField({
        required: false,
        data: background,
      }),
      withoutEnlargement: mfdocConstruct.constructObjectField({
        required: false,
        data: withoutEnlargement,
      }),
      format: mfdocConstruct.constructObjectField({
        required: false,
        data: format,
      }),
      download: mfdocConstruct.constructObjectField({
        required: false,
        data: downloadQueryParam,
      }),
    },
  }
);
const readFileResponseHeaders =
  mfdocConstruct.constructObject<ReadFileEndpointHTTPResponseHeaders>({
    name: 'ReadFileEndpointHTTPResponseHeaders',
    description: 'HTTP response headers for file read operations',
    fields: {
      'Content-Type': mfdocConstruct.constructObjectField({
        required: true,
        data: mfdocConstruct.constructString({
          description:
            'Get file endpoint result content type. ' +
            "If request is successful, it will be the file's content type " +
            'if it is known or application/octet-stream otherwise, ' +
            'and application/json containing errors if request fails',
          example: 'image/jpeg',
        }),
      }),
      'Content-Length': mfdocConstruct.constructObjectField({
        required: true,
        data: mfdocEndpointHttpHeaderItems.responseHeaderItem_ContentLength,
      }),
      'Content-Disposition': mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocEndpointHttpHeaderItems.responseHeaderItem_ContentDisposition,
      }),
      'Accept-Ranges': mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocConstruct.constructString({
          description: 'Indicates that the server supports range requests',
          example: 'bytes',
        }),
      }),
      'Last-Modified': mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocConstruct.constructString({
          description: 'Date and time when the file was last modified',
          example: 'Wed, 21 Oct 2015 07:28:00 GMT',
        }),
      }),
      ETag: mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocConstruct.constructString({
          description: 'Entity tag for cache validation',
          example: '"a1b2c3d4e5f6789012345678901234ab"',
        }),
      }),
      'Content-Range': mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocConstruct.constructString({
          description:
            'Indicates where in the full body message a partial message belongs',
          example: 'bytes 0-499/1024',
        }),
      }),
    },
  });
const readFileResponseBody = mfdocConstruct.constructBinary({
  description: 'Binary file content or processed image data',
});

const readFileRequestHeadersPOST =
  mfdocConstruct.constructObject<ReadFileEndpointHTTPRequestHeaders_POST>({
    name: 'ReadFileEndpointHTTPRequestHeaders_POST',
    description: 'HTTP request headers for POST file read operations',
    fields: {
      Range: mfdocConstruct.constructObjectField({
        required: false,
        data: rangeHeader,
      }),
      'If-Range': mfdocConstruct.constructObjectField({
        required: false,
        data: ifRangeHeader,
      }),
      'Content-Type': mfdocConstruct.constructObjectField({
        required: true,
        data: mfdocEndpointHttpHeaderItems.requestHeaderItem_JsonContentType,
      }),
      Authorization: mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocEndpointHttpHeaderItems.requestHeaderItem_Authorization,
      }),
    },
  });

const readFileRequestHeadersGET =
  mfdocConstruct.constructObject<ReadFileEndpointHTTPRequestHeaders_GET>({
    name: 'ReadFileEndpointHTTPRequestHeaders_GET',
    description: 'HTTP request headers for GET file read operations',
    fields: {
      Range: mfdocConstruct.constructObjectField({
        required: false,
        data: rangeHeader,
      }),
      'If-Range': mfdocConstruct.constructObjectField({
        required: false,
        data: ifRangeHeader,
      }),
      Authorization: mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocEndpointHttpHeaderItems.requestHeaderItem_Authorization,
      }),
    },
  });

const uploadFileParams = mfdocConstruct.constructHttpEndpointMultipartFormdata<
  Pick<UploadFileEndpointParams, 'data'>
>({
  description: 'Multipart form data for file upload',
  items: mfdocConstruct.constructObject<Pick<UploadFileEndpointParams, 'data'>>(
    {
      name: 'UploadFileEndpointParams',
      description: 'File upload parameters including binary data',
      fields: {
        data: mfdocConstruct.constructObjectField({
          required: true,
          data: mfdocConstruct.constructBinary({
            description: 'File binary',
            max: kFileConstants.maxFileSizeInBytes,
          }),
        }),
      },
    }
  ),
});

const clientMultipartId = mfdocConstruct.constructString({
  description:
    'Client generated unique identifier for multipart uploads. ' +
    'It is used to identify the same multipart upload across multiple requests. ' +
    'Cannot be used with append mode.',
  example: 'upload-123e4567-e89b-12d3-a456-426614174000',
});
const isLastPart = mfdocConstruct.constructBoolean({
  description: 'Whether this is the last part of the multipart upload',
  example: false,
});
const part = mfdocConstruct.constructNumber({
  description:
    'Part number of the multipart upload. -1 can be used to signify the end of a multipart upload.',
  example: 1,
});
const append = mfdocConstruct.constructBoolean({
  description:
    'Whether to append data to the existing file instead of replacing it. ' +
    'If true, the new data will be appended to the end of the file. ' +
    'Cannot be used with multipart uploads (clientMultipartId must not be provided when append is true).',
  example: false,
});
const onAppendCreateIfNotExists = mfdocConstruct.constructBoolean({
  description:
    'Whether to create the file if it does not exist when append is true. ' +
    'Defaults to true. If false and the file does not exist, the operation will fail.',
  example: true,
});

const uploadFileSdkParamsDef =
  mfdocConstruct.constructObject<UploadFileEndpointSdkParams>({
    name: 'UploadFileEndpointParams',
    description:
      'Complete parameters for file upload including metadata and binary data',
    fields: {
      ...fileMatcherParts,
      data: mfdocConstruct.constructObjectField({
        required: true,
        data: mfdocConstruct.constructBinary({
          description: 'File binary',
          max: kFileConstants.maxFileSizeInBytes,
        }),
      }),
      description: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.description,
      }),
      size: mfdocConstruct.constructObjectField({required: true, data: size}),
      encoding: mfdocConstruct.constructObjectField({
        required: false,
        data: encoding,
      }),
      mimetype: mfdocConstruct.constructObjectField({
        required: false,
        data: mimetype,
      }),
      clientMultipartId: mfdocConstruct.constructObjectField({
        required: false,
        data: clientMultipartId,
      }),
      part: mfdocConstruct.constructObjectField({required: false, data: part}),
      append: mfdocConstruct.constructObjectField({
        required: false,
        data: append,
      }),
      onAppendCreateIfNotExists: mfdocConstruct.constructObjectField({
        required: false,
        data: onAppendCreateIfNotExists,
      }),
    },
  });

const updloadFileSdkParams = mfdocConstruct.constructSdkParamsBody<
  UploadFileEndpointParams,
  UploadFileEndpointHTTPHeaders,
  FileMatcherPathParameters,
  EmptyObject,
  Pick<UploadFileEndpointParams, 'data'>
>({
  mappings: key => {
    switch (key) {
      case 'data':
        return ['body', 'data'];
      case 'description':
        return [
          'header',
          kFileConstants.headers['x-fimidara-file-description'],
        ];
      case 'encoding':
        return ['header', kFileConstants.headers['x-fimidara-file-encoding']];
      case 'size':
        return ['header', kFileConstants.headers['x-fimidara-file-size']];
      case 'filepath':
        return ['path', 'filepathOrId'];
      case 'fileId':
        return ['path', 'filepathOrId'];
      case 'mimetype':
        return ['header', kFileConstants.headers['x-fimidara-file-mimetype']];
      case 'clientMultipartId':
        return ['header', kFileConstants.headers['x-fimidara-multipart-id']];
      case 'part':
        return ['header', kFileConstants.headers['x-fimidara-multipart-part']];
      case 'append':
        return ['header', kFileConstants.headers['x-fimidara-append']];
      case 'onAppendCreateIfNotExists':
        return [
          'header',
          kFileConstants.headers['x-fimidara-on-append-create-if-not-exists'],
        ];
      default:
        throw new Error(`unknown key ${String(key)}`);
    }
  },
  def: uploadFileSdkParamsDef,
  serializeAs: 'formdata',
});

const readFileSdkParams = mfdocConstruct.constructSdkParamsBody<
  ReadFileEndpointParams,
  | ReadFileEndpointHTTPRequestHeaders_GET
  | ReadFileEndpointHTTPRequestHeaders_POST,
  FileMatcherPathParameters
>({
  mappings: key => {
    switch (key) {
      case 'filepath':
        return ['path', 'filepathOrId'];
      case 'fileId':
        return ['path', 'filepathOrId'];
      case 'rangeHeader':
        return ['header', 'Range'];
      case 'ifRangeHeader':
        return ['header', 'If-Range'];
      default:
        return undefined;
    }
  },
  def: readFileParams,
  serializeAs: 'json',
});

const uploadMultipartWithAuthOptionalHeaderFields =
  mfdocEndpointHttpHeaderItems.requestHeaders_AuthOptional_MultipartContentType
    .fields;
assert.ok(uploadMultipartWithAuthOptionalHeaderFields);
const uploadFileEndpointHTTPHeaders =
  mfdocConstruct.constructObject<UploadFileEndpointHTTPHeaders>({
    name: 'UploadFileEndpointHTTPHeaders',
    description: 'HTTP headers for file upload requests',
    fields: {
      ...uploadMultipartWithAuthOptionalHeaderFields,
      'content-length': mfdocConstruct.constructObjectField({
        required: true,
        data: size,
      }),
      'x-fimidara-file-description': mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.description,
      }),
      'x-fimidara-file-mimetype': mfdocConstruct.constructObjectField({
        required: false,
        data: mimetype,
      }),
      'x-fimidara-file-encoding': mfdocConstruct.constructObjectField({
        required: false,
        data: encoding,
      }),
      'x-fimidara-file-size': mfdocConstruct.constructObjectField({
        required: false,
        data: size,
      }),
      'x-fimidara-multipart-id': mfdocConstruct.constructObjectField({
        required: false,
        data: clientMultipartId,
      }),
      'x-fimidara-multipart-part': mfdocConstruct.constructObjectField({
        required: false,
        data: part,
      }),
      'x-fimidara-append': mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocConstruct.constructString({
          description: append.description,
          example: 'false',
        }),
      }),
      'x-fimidara-on-append-create-if-not-exists':
        mfdocConstruct.constructObjectField({
          required: false,
          data: mfdocConstruct.constructString({
            description: onAppendCreateIfNotExists.description,
            example: 'true',
          }),
        }),
    },
  });
const uploadFileResponseBody =
  mfdocConstruct.constructObject<UploadFileEndpointResult>({
    name: 'UploadFileEndpointResult',
    description: 'Response containing the uploaded file information',
    fields: {
      file: mfdocConstruct.constructObjectField({required: true, data: file}),
    },
  });

export const readFilePOSTEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      ReadFilePOSTHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      ReadFilePOSTHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      ReadFilePOSTHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      ReadFilePOSTHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      ReadFilePOSTHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      ReadFilePOSTHttpEndpoint['mfdocHttpDefinition']['responseBody'],
      FieldBinaryType
    >,
    InferSdkParamsType<
      ReadFilePOSTHttpEndpoint['mfdocHttpDefinition']['sdkParamsBody']
    >
  >({
    path: kFileConstants.routes.readFile_get,
    pathParamaters: fileMatcherPathParameters,
    method: HttpEndpointMethod.Post,
    query: readFileQuery,
    requestHeaders: readFileRequestHeadersPOST,
    requestBody: readFileParams,
    responseHeaders: readFileResponseHeaders,
    responseBody: readFileResponseBody,
    sdkParamsBody: readFileSdkParams,
    name: 'fimidara/files/readFile',
    description:
      'Read/download a file with optional image processing capabilities using POST method',
    tags: [kEndpointTag.public],
  });

export const readFileGETEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      ReadFileGETHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      ReadFileGETHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      ReadFileGETHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      ReadFileGETHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      ReadFileGETHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      ReadFileGETHttpEndpoint['mfdocHttpDefinition']['responseBody'],
      FieldBinaryType
    >,
    InferSdkParamsType<
      ReadFileGETHttpEndpoint['mfdocHttpDefinition']['sdkParamsBody']
    >
  >({
    path: kFileConstants.routes.readFile_get,
    pathParamaters: fileMatcherPathParameters,
    method: HttpEndpointMethod.Get,
    query: readFileQuery,
    requestHeaders: readFileRequestHeadersGET,
    responseHeaders: readFileResponseHeaders,
    responseBody: readFileResponseBody,
    sdkParamsBody: readFileSdkParams,
    name: 'fimidara/files/readFile',
    description:
      'Read/download a file with optional image processing capabilities using GET method',
    tags: [kEndpointTag.public, kEndpointTag.ignoreForJsSdk],
  });

export const readFileHEADEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      ReadFileHEADHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      ReadFileHEADHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      ReadFileHEADHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      ReadFileHEADHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      ReadFileHEADHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      ReadFileHEADHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >,
    InferSdkParamsType<
      ReadFileHEADHttpEndpoint['mfdocHttpDefinition']['sdkParamsBody']
    >
  >({
    path: kFileConstants.routes.readFile_get,
    pathParamaters: fileMatcherPathParameters,
    method: HttpEndpointMethod.Head,
    query: readFileQuery,
    requestHeaders: mfdocEndpointHttpHeaderItems.requestHeaders_AuthOptional,
    responseHeaders: readFileResponseHeaders,
    responseBody: undefined,
    sdkParamsBody: readFileSdkParams,
    name: 'fimidara/files/readFile',
    description:
      'Get file metadata and check range support using HEAD method. Returns headers only, no body.',
    tags: [kEndpointTag.public, kEndpointTag.ignoreForJsSdk],
  });

export const uploadFileEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      UploadFileHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      UploadFileHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      UploadFileHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      UploadFileHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      UploadFileHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      UploadFileHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >,
    InferSdkParamsType<
      UploadFileHttpEndpoint['mfdocHttpDefinition']['sdkParamsBody']
    >
  >({
    path: kFileConstants.routes.uploadFile_post,
    pathParamaters: fileMatcherPathParameters,
    method: HttpEndpointMethod.Post,
    requestBody: uploadFileParams,
    requestHeaders: uploadFileEndpointHTTPHeaders,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: uploadFileResponseBody,
    sdkParamsBody: updloadFileSdkParams,
    name: 'fimidara/files/uploadFile',
    description:
      'Upload a file or file part for multipart uploads. ' +
      'Supports appending data to existing files when append parameter is true.',
    tags: [kEndpointTag.public],
  });

export const getFileDetailsEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      GetFileDetailsHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      GetFileDetailsHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      GetFileDetailsHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      GetFileDetailsHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      GetFileDetailsHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      GetFileDetailsHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kFileConstants.routes.getFileDetails,
    method: HttpEndpointMethod.Post,
    requestBody: getFileDetailsParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: getFileDetailsResponseBody,
    name: 'fimidara/files/getFileDetails',
    description: 'Get detailed information about a file including metadata',
    tags: [kEndpointTag.public],
  });

export const updateFileDetailsEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      UpdateFileDetailsHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      UpdateFileDetailsHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      UpdateFileDetailsHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      UpdateFileDetailsHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      UpdateFileDetailsHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      UpdateFileDetailsHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kFileConstants.routes.updateFileDetails,
    method: HttpEndpointMethod.Post,
    requestBody: updateFileDetailsParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: updateFileDetailsResponseBody,
    name: 'fimidara/files/updateFileDetails',
    description: 'Update file metadata such as description and MIME type',
    tags: [kEndpointTag.public],
  });

export const deleteFileEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      DeleteFileHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      DeleteFileHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      DeleteFileHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      DeleteFileHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      DeleteFileHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      DeleteFileHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kFileConstants.routes.deleteFile,
    method: HttpEndpointMethod.Delete,
    requestBody: deleteFileParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: mfdocEndpointHttpResponseItems.longRunningJobResponseBody,
    name: 'fimidara/files/deleteFile',
    description:
      'Delete a file or cancel/delete specific parts of a multipart upload',
    tags: [kEndpointTag.public],
  });

export const listPartsEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      ListPartsHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      ListPartsHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<ListPartsHttpEndpoint['mfdocHttpDefinition']['query']>,
    InferFieldObjectOrMultipartType<
      ListPartsHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      ListPartsHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      ListPartsHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kFileConstants.routes.listParts,
    method: HttpEndpointMethod.Post,
    requestBody: mfdocConstruct.constructObject<ListPartsEndpointParams>({
      name: 'ListPartsEndpointParams',
      description:
        'Parameters for listing uploaded parts of a multipart upload',
      fields: {
        ...fileMatcherParts,
        page: mfdocConstruct.constructObjectField({
          required: false,
          data: fReusables.page,
        }),
        pageSize: mfdocConstruct.constructObjectField({
          required: false,
          data: fReusables.pageSize,
        }),
      },
    }),
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: mfdocConstruct.constructObject<ListPartsEndpointResult>({
      name: 'ListPartsEndpointResult',
      description:
        'Response containing the list of uploaded parts and pagination info',
      fields: {
        clientMultipartId: mfdocConstruct.constructObjectField({
          required: false,
          data: mfdocConstruct.constructString({
            description:
              'Client generated unique identifier for multipart uploads. ' +
              'It is used to identify the same multipart upload across multiple requests',
            example: 'upload-123e4567-e89b-12d3-a456-426614174000',
          }),
        }),
        parts: mfdocConstruct.constructObjectField({
          required: true,
          data: mfdocConstruct.constructArray<PublicPart>({
            description: 'List of uploaded file parts',
            type: mfdocConstruct.constructObject<PublicPart>({
              name: 'PartDetails',
              description: 'Information about an uploaded file part',
              fields: {
                part: mfdocConstruct.constructObjectField({
                  required: true,
                  data: mfdocConstruct.constructNumber({
                    description: 'Part number of the multipart upload',
                    example: 1,
                  }),
                }),
                size: mfdocConstruct.constructObjectField({
                  required: true,
                  data: mfdocConstruct.constructNumber({
                    description: 'Part size in bytes',
                    example: 5242880,
                  }),
                }),
              },
            }),
          }),
        }),
        page: mfdocConstruct.constructObjectField({
          required: true,
          data: fReusables.page,
        }),
      },
    }),
    name: 'fimidara/files/listParts',
    description:
      'List the parts that have been uploaded for a multipart upload',
    tags: [kEndpointTag.public],
  });

export const startMultipartUploadEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      StartMultipartUploadHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      StartMultipartUploadHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      StartMultipartUploadHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      StartMultipartUploadHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      StartMultipartUploadHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      StartMultipartUploadHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kFileConstants.routes.startMultipartUpload,
    method: HttpEndpointMethod.Post,
    requestBody:
      mfdocConstruct.constructObject<StartMultipartUploadEndpointParams>({
        name: 'StartMultipartUploadEndpointParams',
        description: 'Parameters for starting a multipart upload session',
        fields: {
          ...fileMatcherParts,
          clientMultipartId: mfdocConstruct.constructObjectField({
            required: true,
            data: mfdocConstruct.constructString({
              description:
                'Client generated unique identifier for the multipart upload',
              example: 'upload-123e4567-e89b-12d3-a456-426614174000',
            }),
          }),
        },
      }),
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody:
      mfdocConstruct.constructObject<StartMultipartUploadEndpointResult>({
        name: 'StartMultipartUploadEndpointResult',
        description:
          'Response containing the file resource created for the multipart upload',
        fields: {
          file: mfdocConstruct.constructObjectField({
            required: true,
            data: file,
          }),
        },
      }),
    name: 'fimidara/files/startMultipartUpload',
    description: 'Initialize a new multipart upload session for large files',
    tags: [kEndpointTag.public],
  });

export const completeMultipartUploadEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      CompleteMultipartUploadHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      CompleteMultipartUploadHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      CompleteMultipartUploadHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      CompleteMultipartUploadHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      CompleteMultipartUploadHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      CompleteMultipartUploadHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kFileConstants.routes.completeMultipartUpload,
    method: HttpEndpointMethod.Post,
    requestBody:
      mfdocConstruct.constructObject<CompleteMultipartUploadEndpointParams>({
        name: 'CompleteMultipartUploadEndpointParams',
        description:
          'Parameters for completing a multipart upload by specifying all uploaded parts',
        fields: {
          ...fileMatcherParts,
          clientMultipartId: mfdocConstruct.constructObjectField({
            required: true,
            data: mfdocConstruct.constructString({
              description:
                'Client generated unique identifier for the multipart upload',
              example: 'upload-123e4567-e89b-12d3-a456-426614174000',
            }),
          }),
          parts: mfdocConstruct.constructObjectField({
            required: true,
            data: mfdocConstruct.constructArray<CompleteMultipartUploadInputPart>(
              {
                description: 'List of all uploaded parts in order',
                type: mfdocConstruct.constructObject<CompleteMultipartUploadInputPart>(
                  {
                    name: 'CompleteMultipartUploadInputPart',
                    description:
                      'Part information for completing multipart upload',
                    fields: {
                      part: mfdocConstruct.constructObjectField({
                        required: true,
                        data: mfdocConstruct.constructNumber({
                          description: 'Part number of the uploaded part',
                          example: 1,
                        }),
                      }),
                    },
                  }
                ),
              }
            ),
          }),
        },
      }),
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody:
      mfdocConstruct.constructObject<CompleteMultipartUploadEndpointResult>({
        name: 'CompleteMultipartUploadEndpointResult',
        description:
          'Response containing the completed file and optional job information',
        fields: {
          file: mfdocConstruct.constructObjectField({
            required: true,
            data: file,
          }),
          jobId: mfdocConstruct.constructObjectField({
            required: false,
            data: mfdocConstruct.constructString({
              description:
                'Job ID for tracking the file assembly process if it runs asynchronously',
              example: fReusables.makeResourceId(kFimidaraResourceType.Job),
            }),
          }),
        },
      }),
    name: 'fimidara/files/completeMultipartUpload',
    description:
      'Complete a multipart upload by assembling all uploaded parts into a single file',
    tags: [kEndpointTag.public],
  });

export const fileEndpointsParts = {file};
