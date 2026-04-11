import {
  MfdocHttpEndpointMethod as HttpEndpointMethod,
  InferMfdocFieldObjectOrMultipartType as InferFieldObjectOrMultipartType,
  InferMfdocFieldObjectType as InferFieldObjectType,
  mfdocConstruct,
} from 'mfdoc';
import {kFimidaraPermissionActions} from '../../definitions/permissionItem.js';
import {
  kFimidaraResourceType,
  PublicResource,
  PublicResourceWrapper,
} from '../../definitions/system.js';
import {fileEndpointsParts, folderEndpointsParts} from '../endpoints.mfdoc.js';
import {fReusables, mfdocEndpointHttpHeaderItems} from '../helpers.mfdoc.js';
import {kEndpointTag} from '../types.js';
import resourcesConstants from './constants.js';
import {
  GetResourcesEndpointParams,
  GetResourcesEndpointResult,
} from './getResources/types.js';
import {FetchResourceItem, GetResourcesHttpEndpoint} from './types.js';

const fetchResourceItemInput =
  mfdocConstruct.constructObject<FetchResourceItem>({
    name: 'FetchResourceItem',
    description:
      'Specifies how to fetch a specific resource. You can identify resources by ID, filepath, or folderpath, combined with the action you want to perform.',
    example: {
      action: kFimidaraPermissionActions.readFile,
      filepath: 'rootname/documents/report.pdf',
    },
    fields: {
      resourceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.idOrList,
        description:
          'The unique identifier(s) of the resource(s) to fetch. Can be a single ID or an array of IDs.',
      }),
      action: mfdocConstruct.constructObjectField({
        required: true,
        data: fReusables.action,
        description:
          'The action to perform on the resource. Common actions include "readFile", "uploadFile", "deleteFile", etc.',
        example: kFimidaraPermissionActions.readFile,
      }),
      filepath: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.filepathOrList,
        description:
          'The file path(s) to fetch. Use forward slashes as path separators. Can be a single path or an array of paths.',
      }),
      folderpath: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.folderpathOrList,
        description:
          'The folder path(s) to fetch. Use forward slashes as path separators. Can be a single path or an array of paths.',
      }),
      workspaceRootname: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.workspaceRootname,
        description:
          'The root name of the workspace. If not provided, uses the default workspace.',
      }),
    },
  });

const getResourcesParams =
  mfdocConstruct.constructObject<GetResourcesEndpointParams>({
    name: 'GetResourcesEndpointParams',
    description:
      'Parameters for fetching multiple resources in a single request. This allows batch operations for better performance.',
    example: {
      workspaceId: fReusables.makeResourceId(kFimidaraResourceType.Workspace),
      resources: [
        {
          action: kFimidaraPermissionActions.readFile,
          filepath: 'rootname/documents/report.pdf',
        },
        {
          action: kFimidaraPermissionActions.readFolder,
          folderpath: 'rootname/images',
        },
        {
          action: kFimidaraPermissionActions.uploadFile,
          resourceId: fReusables.makeResourceId(kFimidaraResourceType.File),
        },
      ],
    },
    fields: {
      workspaceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.workspaceIdInput,
        description:
          "The ID of the workspace to fetch resources from. If not provided, uses the user's default workspace.",
      }),
      resources: mfdocConstruct.constructObjectField({
        required: true,
        data: mfdocConstruct.constructArray<FetchResourceItem>({
          type: fetchResourceItemInput,
        }),
        description:
          'Array of resource fetch specifications. Each item describes how to identify and what action to perform on a resource.',
      }),
    },
  });

const resourceWrapper = mfdocConstruct.constructObject<PublicResourceWrapper>({
  name: 'ResourceWrapper',
  description:
    'Wraps a resource with metadata about its type and ID. This provides context about what kind of resource is being returned.',
  example: {
    resourceId: fReusables.makeResourceId(kFimidaraResourceType.File),
    resourceType: kFimidaraResourceType.File,
    resource: {
      resourceId: fReusables.makeResourceId(kFimidaraResourceType.File),
      createdAt: 1672531200000,
      lastUpdatedAt: 1672531200000,
      lastUpdatedBy: {
        agentId: fReusables.makeResourceId(kFimidaraResourceType.AgentToken),
        agentType: kFimidaraResourceType.AgentToken,
      },
      createdBy: {
        agentId: fReusables.makeResourceId(kFimidaraResourceType.AgentToken),
        agentType: kFimidaraResourceType.AgentToken,
      },
    },
  },
  fields: {
    resourceId: mfdocConstruct.constructObjectField({
      required: true,
      data: fReusables.id,
      description: 'The unique identifier of the resource.',
    }),
    resourceType: mfdocConstruct.constructObjectField({
      required: true,
      data: fReusables.resourceType,
      description:
        'The type of resource (e.g., "file", "folder", "workspace", "collaborationRequest").',
    }),
    resource: mfdocConstruct.constructObjectField({
      required: true,
      data: mfdocConstruct.constructObject<PublicResource>({
        name: 'Resource',
        description:
          'The actual resource data. The structure varies depending on the resource type (file, folder, workspace, etc.).',
        example: {
          resourceId: fReusables.makeResourceId(kFimidaraResourceType.File),
          name: 'report.pdf',
          workspaceId: fReusables.workspaceId,
          createdAt: 1672531200000,
          lastUpdatedAt: 1672531200000,
        },
        fields: {
          ...fReusables.resourceParts,
        },
      }),
      description:
        'The resource data. Structure depends on the resource type specified in resourceType field.',
    }),
  },
});

const getResourcesResponseBody =
  mfdocConstruct.constructObject<GetResourcesEndpointResult>({
    name: 'GetResourcesEndpointResult',
    description:
      'Response containing the requested resources. Each resource is wrapped with metadata for easy identification.',
    example: {
      resources: [
        {
          resourceId: fReusables.makeResourceId(kFimidaraResourceType.File),
          resourceType: kFimidaraResourceType.File,
          resource: fileEndpointsParts.file,
        },
        {
          resourceId: fReusables.makeResourceId(kFimidaraResourceType.Folder),
          resourceType: kFimidaraResourceType.Folder,
          resource: folderEndpointsParts.folder,
        },
      ],
    },
    fields: {
      resources: mfdocConstruct.constructObjectField({
        required: true,
        data: mfdocConstruct.constructArray<PublicResourceWrapper>({
          type: resourceWrapper,
        }),
        description:
          'Array of resource wrappers containing the requested resources and their metadata.',
      }),
    },
  });

export const getResourcesEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      GetResourcesHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      GetResourcesHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      GetResourcesHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      GetResourcesHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      GetResourcesHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      GetResourcesHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: resourcesConstants.routes.getResources,
    method: HttpEndpointMethod.Post,
    requestBody: getResourcesParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: getResourcesResponseBody,
    name: 'fimidara/resources/getResources',
    description:
      'Fetch multiple resources in a single request. This endpoint allows you to retrieve files, folders, and other resources by specifying different identification methods (ID, filepath, or folderpath) and the actions you want to perform on them. Perfect for batch operations and reducing API calls.',
    tags: [kEndpointTag.public],
  });
