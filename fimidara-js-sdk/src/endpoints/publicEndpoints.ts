// This file is auto-generated, do not modify directly.
// Reach out to a code owner to suggest changes.

import {
  type MfdocEndpointResultWithBinaryResponse,
  type MfdocEndpointOpts,
  type MfdocEndpointDownloadBinaryOpts,
  type MfdocEndpointUploadBinaryOpts,
} from 'mfdoc-js-sdk-base';
import {AbstractSdkEndpoints} from './AbstractSdkEndpoints.js';
import {
  type AddAgentTokenEndpointParams,
  type AddAgentTokenEndpointResult,
  type CountWorkspaceAgentTokensEndpointParams,
  type CountItemsResult,
  type DeleteAgentTokenEndpointParams,
  type LongRunningJobResult,
  type EncodeAgentTokenEndpointParams,
  type EncodeAgentTokenEndpointResult,
  type GetAgentTokenEndpointParams,
  type GetAgentTokenEndpointResult,
  type GetWorkspaceAgentTokensEndpointParams,
  type GetWorkspaceAgentTokensEndpointResult,
  type RefreshAgentTokenEndpointParams,
  type RefreshAgentTokenEndpointResult,
  type UpdateAgentTokenEndpointParams,
  type UpdateAgentTokenEndpointResult,
  type AddFolderEndpointParams,
  type AddFolderEndpointResult,
  type CountFolderContentEndpointParams,
  type CountFolderContentEndpointResult,
  type DeleteFolderEndpointParams,
  type DeleteFolderEndpointResult,
  type GetFolderEndpointParams,
  type GetFolderEndpointResult,
  type ListFolderContentEndpointParams,
  type ListFolderContentEndpointResult,
  type UpdateFolderEndpointParams,
  type UpdateFolderEndpointResult,
  type AddPermissionGroupEndpointParams,
  type AddPermissionGroupEndpointResult,
  type AssignPermissionGroupsEndpointParams,
  type CountWorkspacePermissionGroupsEndpointParams,
  type DeletePermissionGroupEndpointParams,
  type GetEntityAssignedPermissionGroupsParams,
  type GetEntityAssignedPermissionGroupsEndpointResult,
  type GetPermissionGroupEndpointParams,
  type GetPermissionGroupEndpointResult,
  type GetWorkspacePermissionGroupsEndpointParams,
  type GetWorkspacePermissionGroupsEndpointResult,
  type UnassignPermissionGroupsEndpointParams,
  type UpdatePermissionGroupEndpointParams,
  type UpdatePermissionGroupEndpointResult,
  type AddPermissionItemsEndpointParams,
  type DeletePermissionItemsEndpointParams,
  type MultipleLongRunningJobResult,
  type ResolveEntityPermissionsEndpointParams,
  type ResolveEntityPermissionsEndpointResult,
  type CompleteMultipartUploadEndpointParams,
  type CompleteMultipartUploadEndpointResult,
  type DeleteFileEndpointParams,
  type GetFileDetailsEndpointParams,
  type GetFileDetailsEndpointResult,
  type ListPartsEndpointParams,
  type ListPartsEndpointResult,
  type ReadFileEndpointParams,
  type StartMultipartUploadEndpointParams,
  type StartMultipartUploadEndpointResult,
  type UpdateFileDetailsEndpointParams,
  type UpdateFileDetailsEndpointResult,
  type UploadFileEndpointParams,
  type UploadFileEndpointResult,
  type CountWorkspaceCollaborationRequestsEndpointParams,
  type DeleteCollaborationRequestEndpointParams,
  type GetWorkspaceCollaborationRequestEndpointParams,
  type GetWorkspaceCollaborationRequestEndpointResult,
  type GetWorkspaceCollaborationRequestsEndpointParams,
  type GetWorkspaceCollaborationRequestsEndpointResult,
  type RevokeCollaborationRequestEndpointParams,
  type RevokeCollaborationRequestEndpointResult,
  type SendCollaborationRequestEndpointParams,
  type SendCollaborationRequestEndpointResult,
  type UpdateCollaborationRequestEndpointParams,
  type UpdateCollaborationRequestEndpointResult,
  type CountWorkspaceCollaboratorsEndpointParams,
  type GetCollaboratorEndpointParams,
  type GetCollaboratorEndpointResult,
  type GetWorkspaceCollaboratorsEndpointParams,
  type GetWorkspaceCollaboratorsEndpointResult,
  type RevokeCollaboratorEndpointParams,
  type CountWorkspaceSummedUsageEndpointParams,
  type GetUsageCostsEndpointResult,
  type GetWorkspaceSummedUsageEndpointParams,
  type GetWorkspaceSummedUsageEndpointResult,
  type GetJobStatusEndpointParams,
  type GetJobStatusEndpointResult,
  type GetPresignedPathsForFilesEndpointParams,
  type GetPresignedPathsForFilesEndpointResult,
  type IssuePresignedPathEndpointParams,
  type IssuePresignedPathEndpointResult,
  type GetResourcesEndpointParams,
  type GetResourcesEndpointResult,
  type GetWorkspaceEndpointParams,
  type GetWorkspaceEndpointResult,
  type UpdateWorkspaceEndpointParams,
  type UpdateWorkspaceEndpointResult,
} from './publicTypes.js';

export class AgentTokensEndpoints extends AbstractSdkEndpoints {
  /**
   * Create a new agent token for API authentication. Agent tokens allow external applications and services to authenticate with the Fimidara API.
   */
  addToken = async (
    props?: AddAgentTokenEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<AddAgentTokenEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/agentTokens/addToken',
        method: 'POST',
      },
      opts
    );
  };
  countWorkspaceTokens = async (
    props?: CountWorkspaceAgentTokensEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<CountItemsResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/agentTokens/countWorkspaceTokens',
        method: 'POST',
      },
      opts
    );
  };
  deleteToken = async (
    props?: DeleteAgentTokenEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<LongRunningJobResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/agentTokens/deleteToken',
        method: 'DELETE',
      },
      opts
    );
  };
  encodeToken = async (
    props?: EncodeAgentTokenEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<EncodeAgentTokenEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/agentTokens/encodeToken',
        method: 'POST',
      },
      opts
    );
  };
  getToken = async (
    props?: GetAgentTokenEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetAgentTokenEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/agentTokens/getToken',
        method: 'POST',
      },
      opts
    );
  };
  getWorkspaceTokens = async (
    props?: GetWorkspaceAgentTokensEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetWorkspaceAgentTokensEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/agentTokens/getWorkspaceTokens',
        method: 'POST',
      },
      opts
    );
  };
  refreshToken = async (
    props: RefreshAgentTokenEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<RefreshAgentTokenEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/agentTokens/refreshToken',
        method: 'POST',
      },
      opts
    );
  };
  updateToken = async (
    props: UpdateAgentTokenEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<UpdateAgentTokenEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/agentTokens/updateToken',
        method: 'POST',
      },
      opts
    );
  };
}
export class FoldersEndpoints extends AbstractSdkEndpoints {
  /**
   * Creates a new folder at the specified path within the workspace
   */
  addFolder = async (
    props: AddFolderEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<AddFolderEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/folders/addFolder',
        method: 'POST',
      },
      opts
    );
  };
  countFolderContent = async (
    props?: CountFolderContentEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<CountFolderContentEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/folders/countFolderContent',
        method: 'POST',
      },
      opts
    );
  };
  deleteFolder = async (
    props?: DeleteFolderEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<DeleteFolderEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/folders/deleteFolder',
        method: 'DELETE',
      },
      opts
    );
  };
  getFolder = async (
    props?: GetFolderEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetFolderEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/folders/getFolder',
        method: 'POST',
      },
      opts
    );
  };
  listFolderContent = async (
    props?: ListFolderContentEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<ListFolderContentEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/folders/listFolderContent',
        method: 'POST',
      },
      opts
    );
  };
  updateFolder = async (
    props: UpdateFolderEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<UpdateFolderEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/folders/updateFolder',
        method: 'POST',
      },
      opts
    );
  };
}
export class PermissionGroupsEndpoints extends AbstractSdkEndpoints {
  /**
   * Create a new permission group in a workspace. Permission groups are used to organize permissions and can be assigned to users, collaborators, or agent tokens.
   */
  addPermissionGroup = async (
    props: AddPermissionGroupEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<AddPermissionGroupEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionGroups/addPermissionGroup',
        method: 'POST',
      },
      opts
    );
  };
  assignPermissionGroups = async (
    props: AssignPermissionGroupsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<void> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionGroups/assignPermissionGroups',
        method: 'POST',
      },
      opts
    );
  };
  countWorkspacePermissionGroups = async (
    props?: CountWorkspacePermissionGroupsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<CountItemsResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionGroups/countWorkspacePermissionGroups',
        method: 'POST',
      },
      opts
    );
  };
  deletePermissionGroup = async (
    props?: DeletePermissionGroupEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<LongRunningJobResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionGroups/deletePermissionGroup',
        method: 'DELETE',
      },
      opts
    );
  };
  getEntityAssignedPermissionGroups = async (
    props: GetEntityAssignedPermissionGroupsParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetEntityAssignedPermissionGroupsEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionGroups/getEntityAssignedPermissionGroups',
        method: 'POST',
      },
      opts
    );
  };
  getPermissionGroup = async (
    props?: GetPermissionGroupEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetPermissionGroupEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionGroups/getPermissionGroup',
        method: 'POST',
      },
      opts
    );
  };
  getWorkspacePermissionGroups = async (
    props?: GetWorkspacePermissionGroupsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetWorkspacePermissionGroupsEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionGroups/getWorkspacePermissionGroups',
        method: 'POST',
      },
      opts
    );
  };
  unassignPermissionGroups = async (
    props: UnassignPermissionGroupsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<void> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionGroups/unassignPermissionGroups',
        method: 'POST',
      },
      opts
    );
  };
  updatePermissionGroup = async (
    props: UpdatePermissionGroupEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<UpdatePermissionGroupEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionGroups/updatePermissionGroup',
        method: 'POST',
      },
      opts
    );
  };
}
export class PermissionItemsEndpoints extends AbstractSdkEndpoints {
  /**
   * Add permission items to a workspace. Permission items define what actions entities (users, permission groups, or agent tokens) can or cannot perform on specific targets (files, folders, or workspace resources). Each permission item specifies: - A target (what resource the permission applies to) - An entity (who the permission applies to) - An action (what operation is being permitted/denied) - Access level (grant or deny)
   */
  addItems = async (
    props: AddPermissionItemsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<void> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionItems/addItems',
        method: 'POST',
      },
      opts
    );
  };
  deleteItems = async (
    props: DeletePermissionItemsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<MultipleLongRunningJobResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionItems/deleteItems',
        method: 'DELETE',
      },
      opts
    );
  };
  resolveEntityPermissions = async (
    props: ResolveEntityPermissionsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<ResolveEntityPermissionsEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/permissionItems/resolveEntityPermissions',
        method: 'POST',
      },
      opts
    );
  };
}
export class FilesEndpoints extends AbstractSdkEndpoints {
  /**
   * Complete a multipart upload by assembling all uploaded parts into a single file
   */
  completeMultipartUpload = async (
    props: CompleteMultipartUploadEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<CompleteMultipartUploadEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/files/completeMultipartUpload',
        method: 'POST',
      },
      opts
    );
  };
  deleteFile = async (
    props?: DeleteFileEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<LongRunningJobResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/files/deleteFile',
        method: 'DELETE',
      },
      opts
    );
  };
  getFileDetails = async (
    props?: GetFileDetailsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetFileDetailsEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/files/getFileDetails',
        method: 'POST',
      },
      opts
    );
  };
  listParts = async (
    props?: ListPartsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<ListPartsEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/files/listParts',
        method: 'POST',
      },
      opts
    );
  };
  readFile = async <TResponseType extends 'blob' | 'stream'>(
    props?: ReadFileEndpointParams,
    opts: MfdocEndpointDownloadBinaryOpts<TResponseType> = {
      responseType: 'blob',
    } as MfdocEndpointDownloadBinaryOpts<TResponseType>
  ): Promise<MfdocEndpointResultWithBinaryResponse<TResponseType>> => {
    const mapping = {
      filepath: ['path', 'filepathOrId'],
      fileId: ['path', 'filepathOrId'],
    } as const;
    return this.executeRaw(
      {
        responseType: opts.responseType,
        data: props,
        path: '/v1/files/readFile/:filepathOrId',
        method: 'POST',
      },
      opts,
      mapping
    );
  };
  startMultipartUpload = async (
    props: StartMultipartUploadEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<StartMultipartUploadEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/files/startMultipartUpload',
        method: 'POST',
      },
      opts
    );
  };
  updateFileDetails = async (
    props: UpdateFileDetailsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<UpdateFileDetailsEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/files/updateFileDetails',
        method: 'POST',
      },
      opts
    );
  };
  uploadFile = async (
    props: UploadFileEndpointParams,
    opts?: MfdocEndpointUploadBinaryOpts
  ): Promise<UploadFileEndpointResult> => {
    const mapping = {
      filepath: ['path', 'filepathOrId'],
      fileId: ['path', 'filepathOrId'],
      data: ['body', 'data'],
      description: ['header', 'x-fimidara-file-description'],
      size: ['header', 'x-fimidara-file-size'],
      encoding: ['header', 'x-fimidara-file-encoding'],
      mimetype: ['header', 'x-fimidara-file-mimetype'],
      clientMultipartId: ['header', 'x-fimidara-multipart-id'],
      part: ['header', 'x-fimidara-multipart-part'],
    } as const;
    return this.executeJson(
      {
        formdata: props,
        path: '/v1/files/uploadFile/:filepathOrId',
        method: 'POST',
      },
      opts,
      mapping
    );
  };
}
export class CollaborationRequestsEndpoints extends AbstractSdkEndpoints {
  /**
   * Get the total count of collaboration requests sent from your workspace. Useful for analytics and pagination calculations.
   */
  countWorkspaceRequests = async (
    props?: CountWorkspaceCollaborationRequestsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<CountItemsResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborationRequests/countWorkspaceRequests',
        method: 'POST',
      },
      opts
    );
  };
  deleteRequest = async (
    props: DeleteCollaborationRequestEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<LongRunningJobResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborationRequests/deleteRequest',
        method: 'DELETE',
      },
      opts
    );
  };
  getWorkspaceRequest = async (
    props: GetWorkspaceCollaborationRequestEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetWorkspaceCollaborationRequestEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborationRequests/getWorkspaceRequest',
        method: 'POST',
      },
      opts
    );
  };
  getWorkspaceRequests = async (
    props?: GetWorkspaceCollaborationRequestsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetWorkspaceCollaborationRequestsEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborationRequests/getWorkspaceRequests',
        method: 'POST',
      },
      opts
    );
  };
  revokeRequest = async (
    props: RevokeCollaborationRequestEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<RevokeCollaborationRequestEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborationRequests/revokeRequest',
        method: 'POST',
      },
      opts
    );
  };
  sendRequest = async (
    props: SendCollaborationRequestEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<SendCollaborationRequestEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborationRequests/sendRequest',
        method: 'POST',
      },
      opts
    );
  };
  updateRequest = async (
    props: UpdateCollaborationRequestEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<UpdateCollaborationRequestEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborationRequests/updateRequest',
        method: 'POST',
      },
      opts
    );
  };
}
export class CollaboratorsEndpoints extends AbstractSdkEndpoints {
  /**
   * Get the total number of collaborators in a workspace. Useful for pagination calculations and workspace analytics without fetching the full list of collaborators.
   */
  countWorkspaceCollaborators = async (
    props?: CountWorkspaceCollaboratorsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<CountItemsResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborators/countWorkspaceCollaborators',
        method: 'POST',
      },
      opts
    );
  };
  getCollaborator = async (
    props: GetCollaboratorEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetCollaboratorEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborators/getCollaborator',
        method: 'POST',
      },
      opts
    );
  };
  getWorkspaceCollaborators = async (
    props?: GetWorkspaceCollaboratorsEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetWorkspaceCollaboratorsEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborators/getWorkspaceCollaborators',
        method: 'POST',
      },
      opts
    );
  };
  removeCollaborator = async (
    props: RevokeCollaboratorEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<LongRunningJobResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/collaborators/removeCollaborator',
        method: 'POST',
      },
      opts
    );
  };
}
export class UsageRecordsEndpoints extends AbstractSdkEndpoints {
  /**
   * Count the total number of workspace usage records matching the specified filters
   */
  countWorkspaceSummedUsage = async (
    props?: CountWorkspaceSummedUsageEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<CountItemsResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/usageRecords/countWorkspaceSummedUsage',
        method: 'POST',
      },
      opts
    );
  };
  getUsageCosts = async (
    opts?: MfdocEndpointOpts
  ): Promise<GetUsageCostsEndpointResult> => {
    return this.executeJson(
      {
        path: '/v1/usageRecords/getUsageCosts',
        method: 'POST',
      },
      opts
    );
  };
  getWorkspaceSummedUsage = async (
    props?: GetWorkspaceSummedUsageEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetWorkspaceSummedUsageEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/usageRecords/getWorkspaceSummedUsage',
        method: 'POST',
      },
      opts
    );
  };
}
export class JobsEndpoints extends AbstractSdkEndpoints {
  /**
   * Retrieve the current execution status of a job by its unique identifier. Returns the job status and any error messages if applicable.
   */
  getJobStatus = async (
    props: GetJobStatusEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetJobStatusEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/jobs/getJobStatus',
        method: 'POST',
      },
      opts
    );
  };
}
export class PresignedPathsEndpoints extends AbstractSdkEndpoints {
  /**
   * Bulk generates presigned paths for multiple files at once. This endpoint is more efficient than calling issuePresignedPath multiple times when you need presigned paths for several files. Each file can be identified by either its filepath or fileId. The response includes the generated presigned path along with the original filepath for easy mapping.
   */
  getPresignedPaths = async (
    props?: GetPresignedPathsForFilesEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetPresignedPathsForFilesEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/presignedPaths/getPresignedPaths',
        method: 'POST',
      },
      opts
    );
  };
  issuePresignedPath = async (
    props?: IssuePresignedPathEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<IssuePresignedPathEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/presignedPaths/issuePresignedPath',
        method: 'POST',
      },
      opts
    );
  };
}
export class ResourcesEndpoints extends AbstractSdkEndpoints {
  /**
   * Fetch multiple resources in a single request. This endpoint allows you to retrieve files, folders, and other resources by specifying different identification methods (ID, filepath, or folderpath) and the actions you want to perform on them. Perfect for batch operations and reducing API calls.
   */
  getResources = async (
    props: GetResourcesEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetResourcesEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/resources/getResources',
        method: 'POST',
      },
      opts
    );
  };
}
export class WorkspacesEndpoints extends AbstractSdkEndpoints {
  /**
   * Retrieve information about a specific workspace or the current user's default workspace
   */
  getWorkspace = async (
    props?: GetWorkspaceEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<GetWorkspaceEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/workspaces/getWorkspace',
        method: 'POST',
      },
      opts
    );
  };
  updateWorkspace = async (
    props: UpdateWorkspaceEndpointParams,
    opts?: MfdocEndpointOpts
  ): Promise<UpdateWorkspaceEndpointResult> => {
    return this.executeJson(
      {
        data: props,
        path: '/v1/workspaces/updateWorkspace',
        method: 'POST',
      },
      opts
    );
  };
}
export class FimidaraEndpoints extends AbstractSdkEndpoints {
  agentTokens = new AgentTokensEndpoints(this.config, this);
  folders = new FoldersEndpoints(this.config, this);
  permissionGroups = new PermissionGroupsEndpoints(this.config, this);
  permissionItems = new PermissionItemsEndpoints(this.config, this);
  files = new FilesEndpoints(this.config, this);
  collaborationRequests = new CollaborationRequestsEndpoints(this.config, this);
  collaborators = new CollaboratorsEndpoints(this.config, this);
  usageRecords = new UsageRecordsEndpoints(this.config, this);
  jobs = new JobsEndpoints(this.config, this);
  presignedPaths = new PresignedPathsEndpoints(this.config, this);
  resources = new ResourcesEndpoints(this.config, this);
  workspaces = new WorkspacesEndpoints(this.config, this);
}
