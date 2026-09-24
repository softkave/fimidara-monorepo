import assert from 'assert';
import {
  MfdocHttpEndpointMethod as HttpEndpointMethod,
  InferMfdocFieldObjectOrMultipartType as InferFieldObjectOrMultipartType,
  InferMfdocFieldObjectType as InferFieldObjectType,
  mfdocConstruct,
} from 'mfdoc';
import {FileMatcher} from '../../definitions/file.js';
import {kFimidaraResourceType} from '../../definitions/system.js';
import {multilineTextToParagraph} from '../../utils/fns.js';
import {kEndpointConstants} from '../constants.js';
import {fReusables, mfdocEndpointHttpHeaderItems} from '../helpers.mfdoc.js';
import {kEndpointTag} from '../types.js';
import {kPresignedPathsConstants} from './constants.js';
import {
  GetPresignedPathsForFilesEndpointParams,
  GetPresignedPathsForFilesEndpointResult,
  GetPresignedPathsForFilesItem,
} from './getPresignedPaths/types.js';
import {
  IssuePresignedPathEndpointParams,
  IssuePresignedPathEndpointResult,
} from './issuePresignedPath/types.js';
import {
  GetPresignedPathsForFilesHttpEndpoint,
  IssuePresignedPathHttpEndpoint,
} from './types.js';

const fileMatcher = mfdocConstruct.constructObject<FileMatcher>({
  name: 'FileMatcher',
  fields: {
    filepath: mfdocConstruct.constructObjectField({
      required: false,
      data: {
        ...fReusables.filepath,
        description:
          'Full path to the file within the workspace, including filename and extension',
        example: '/documents/reports/quarterly-report.pdf',
      },
    }),
    fileId: mfdocConstruct.constructObjectField({
      required: false,
      data: {
        ...fReusables.fileId,
        description:
          'Unique identifier for the file. Use either fileId or filepath, not both',
        example: fReusables.makeResourceId(kFimidaraResourceType.File),
      },
    }),
  },
});

const presignedPath = mfdocConstruct.constructString({
  description:
    'Temporary URL path that can be used to access the file without authentication headers. Ideal for embedding in HTML img tags or downloading files via direct links',
  example: '/v1/files/presigned/abc123def456/quarterly-report.pdf?token=xyz789',
});

const issuePresignedPathParams =
  mfdocConstruct.constructObject<IssuePresignedPathEndpointParams>({
    name: 'IssuePresignedPathEndpointParams',
    fields: {
      filepath: mfdocConstruct.constructObjectField({
        required: false,
        data: {
          ...fReusables.filepath,
          description:
            'Full path to the file within the workspace. Required if fileId is not provided',
          example: '/documents/reports/quarterly-report.pdf',
        },
      }),
      fileId: mfdocConstruct.constructObjectField({
        required: false,
        data: {
          ...fReusables.fileId,
          description:
            'Unique identifier for the file. Required if filepath is not provided',
          example: fReusables.makeResourceId(kFimidaraResourceType.File),
        },
      }),
      action: mfdocConstruct.constructObjectField({
        required: false,
        data: {
          ...fReusables.actionOrList,
          description:
            'The action the presigned path will be valid for. Defaults to "readFile" if not specified',
          example: 'readFile',
        },
      }),
      duration: mfdocConstruct.constructObjectField({
        required: false,
        data: {
          ...fReusables.duration,
          description:
            'How long the presigned path should remain valid, in milliseconds. Defaults to unlimited if not specified',
          example: 3_600_000,
        },
      }),
      expires: mfdocConstruct.constructObjectField({
        required: false,
        data: {
          ...fReusables.expires,
          description:
            'Specific expiration timestamp for the presigned path. Alternative to duration',
          example: 1640995200000,
        },
      }),
      usageCount: mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocConstruct.constructNumber({
          description:
            'Maximum number of times the presigned path can be used before it becomes invalid. Defaults to unlimited if not specified',
          example: 5,
        }),
      }),
    },
  });

const issuePresignedPathResponseBody =
  mfdocConstruct.constructObject<IssuePresignedPathEndpointResult>({
    name: 'IssuePresignedPathEndpointResult',
    fields: {
      path: mfdocConstruct.constructObjectField({
        required: true,
        data: {
          ...presignedPath,
          description:
            'The generated presigned path that can be used to access the file without authentication',
        },
      }),
    },
  });

const getPresignedPathsForFilesParams =
  mfdocConstruct.constructObject<GetPresignedPathsForFilesEndpointParams>({
    name: 'GetPresignedPathsForFilesEndpointParams',
    fields: {
      files: mfdocConstruct.constructObjectField({
        required: false,
        data: mfdocConstruct.constructArray<FileMatcher>({
          type: fileMatcher,
          max: kEndpointConstants.inputListMax,
          description:
            'List of files to generate presigned paths for. Each file can be identified by either filepath or fileId',
        }),
      }),
      workspaceId: mfdocConstruct.constructObjectField({
        required: false,
        data: {
          ...fReusables.workspaceId,
          description:
            'ID of the workspace containing the files. If not provided, uses the default workspace',
          example: fReusables.makeResourceId(kFimidaraResourceType.Workspace),
        },
      }),
    },
  });

const getPresignedPathsForFilesResponseBody =
  mfdocConstruct.constructObject<GetPresignedPathsForFilesEndpointResult>({
    name: 'GetPresignedPathsForFilesEndpointResult',
    fields: {
      paths: mfdocConstruct.constructObjectField({
        required: true,
        data: mfdocConstruct.constructArray<GetPresignedPathsForFilesItem>({
          type: mfdocConstruct.constructObject<GetPresignedPathsForFilesItem>({
            name: 'GetPresignedPathsForFilesItem',
            fields: {
              path: mfdocConstruct.constructObjectField({
                required: true,
                data: {
                  ...presignedPath,
                  description:
                    'The generated presigned path for accessing this specific file',
                },
              }),
              filepath: mfdocConstruct.constructObjectField({
                required: true,
                data: {
                  ...fReusables.filepath,
                  description:
                    'The original filepath of the file that this presigned path corresponds to',
                  example: '/documents/reports/quarterly-report.pdf',
                },
              }),
            },
          }),
          description:
            'Array of presigned path objects, one for each requested file',
        }),
      }),
    },
  });

const uploadMultipartWithAuthOptionalHeaderFields =
  mfdocEndpointHttpHeaderItems.requestHeaders_AuthOptional_MultipartContentType
    .fields;
assert.ok(uploadMultipartWithAuthOptionalHeaderFields);

export const issuePresignedPathEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      IssuePresignedPathHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      IssuePresignedPathHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      IssuePresignedPathHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      IssuePresignedPathHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      IssuePresignedPathHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      IssuePresignedPathHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kPresignedPathsConstants.routes.issuePresignedPath,
    method: HttpEndpointMethod.Post,
    requestBody: issuePresignedPathParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: issuePresignedPathResponseBody,
    name: 'fimidara/presignedPaths/issuePresignedPath',
    description: multilineTextToParagraph(
      `Generates a temporary presigned path for accessing private files without authentication headers. 
      This is particularly useful for embedding files in HTML img tags, allowing direct downloads, 
      or sharing files with external services that cannot handle authentication headers.
      Currently supports reading files only - upload functionality will be added in future versions.`
    ),
    tags: [kEndpointTag.public],
  });

export const getPresignedPathsForFilesEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      GetPresignedPathsForFilesHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      GetPresignedPathsForFilesHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      GetPresignedPathsForFilesHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      GetPresignedPathsForFilesHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      GetPresignedPathsForFilesHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      GetPresignedPathsForFilesHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kPresignedPathsConstants.routes.getPresignedPaths,
    method: HttpEndpointMethod.Post,
    requestBody: getPresignedPathsForFilesParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: getPresignedPathsForFilesResponseBody,
    name: 'fimidara/presignedPaths/getPresignedPaths',
    description: multilineTextToParagraph(
      `Bulk generates presigned paths for multiple files at once. This endpoint is more efficient 
      than calling issuePresignedPath multiple times when you need presigned paths for several files.
      Each file can be identified by either its filepath or fileId. The response includes the 
      generated presigned path along with the original filepath for easy mapping.`
    ),
    tags: [kEndpointTag.public],
  });
