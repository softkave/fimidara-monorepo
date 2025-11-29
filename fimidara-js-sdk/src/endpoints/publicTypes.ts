// This file is auto-generated, do not modify directly.
// Reach out to a code owner to suggest changes.

import type {Readable} from 'stream';

/**
 * Parameters for creating a new agent token
 */
export type AddAgentTokenEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Resource name
   * @example
   * ```
   * My resource name
   * ```
   */
  name?: string;
  /**
   * Resource description
   * @example
   * ```
   * This is a resource description.
   * ```
   */
  description?: string;
  /**
   * Expiration date as UTC timestamp in milliseconds
   * @example
   * ```
   * 1704067200000
   * ```
   */
  expiresAt?: number;
  /**
   * Resource ID provided by you, allowing you to use your own identifier instead of system-generated ones
   * @example
   * ```
   * my-custom-resource-id
   * ```
   */
  providedResourceId?: string;
  /**
   * Whether the token returned should include the token encoded in JWT format.
   */
  shouldEncode?: boolean;
  /**
   * Whether the token should be refreshed.
   * @example
   * ```
   * true
   * ```
   */
  shouldRefresh?: boolean;
  /**
   * The duration in milliseconds for which a generated JWT token, not the actual agent token, is valid.
   * @example
   * ```
   * 2592000000
   * ```
   */
  refreshDuration?: number;
};
/**
 * Agent type
 * @example
 * ```
 * agentToken
 * ```
 */
export type AgentType = 'user' | 'agentToken';
/**
 * Represents a user or system entity that performed an action (e.g., created or updated a resource)
 */
export type Agent = {
  /**
   * Agent ID. Possible agents are users and agent tokens
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  agentId: string;
  /**
   * Agent type
   * @example
   * ```
   * agentToken
   * ```
   */
  agentType: AgentType;
};
/**
 * Agent token with authentication details and metadata
 */
export type AgentToken = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  createdBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  createdAt: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  isDeleted: boolean;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  deletedAt?: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  deletedBy?: Agent;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId: string;
  /**
   * Resource name
   * @example
   * ```
   * My resource name
   * ```
   */
  name?: string;
  /**
   * Resource description
   * @example
   * ```
   * This is a resource description.
   * ```
   */
  description?: string;
  /**
   * JWT token string used for authentication
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  jwtToken?: string;
  /**
   * JWT refresh token string used to obtain new access tokens
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  refreshToken?: string;
  /**
   * Expiration date as UTC timestamp in milliseconds
   * @example
   * ```
   * 1704067200000
   * ```
   */
  expiresAt?: number;
  /**
   * Custom resource ID provided by you, or null if using system-generated ID
   * @example
   * ```
   * my-custom-resource-id
   * ```
   */
  providedResourceId?: string | null;
  /**
   * JWT token expiration date. Not the expiration date of the token itself.
   */
  jwtTokenExpiresAt?: number;
  /**
   * Whether the token should be refreshed.
   * @example
   * ```
   * true
   * ```
   */
  shouldRefresh?: boolean;
  /**
   * The duration in milliseconds for which a generated JWT token, not the actual agent token, is valid.
   * @example
   * ```
   * 2592000000
   * ```
   */
  refreshDuration?: number;
};
/**
 * Response containing the newly created agent token
 */
export type AddAgentTokenEndpointResult = {
  /**
   * Agent token with authentication details and metadata
   */
  token: AgentToken;
};
/**
 * Parameters for creating a new folder
 */
export type AddFolderEndpointParams = {
  /**
   * Resource description
   * @example
   * ```
   * This is a resource description.
   * ```
   */
  description?: string;
  /**
   * Folder path, with each folder name separated by a forward slash. The first item must be the workspace rootname. e.g /workspace-rootname/my-folder/my-sub-folder.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath: string;
};
/**
 * Represents a folder in the workspace with its metadata and hierarchy information
 */
export type Folder = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  createdBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  createdAt: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  isDeleted: boolean;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  deletedAt?: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  deletedBy?: Agent;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId: string;
  /**
   * Resource name
   * @example
   * ```
   * My resource name
   * ```
   */
  name: string;
  /**
   * Resource description
   * @example
   * ```
   * This is a resource description.
   * ```
   */
  description?: string;
  /**
   * List of parent folder IDs
   * @example
   * ```json
   * [
   *   "folder0_000000000000000000000"
   * ]
   * ```
   */
  idPath: Array<string>;
  /**
   * Folder path as a list of folder names. It should not include the workspace rootname. e.g ["my-folder", "my-sub-folder"].
   * @example
   * ```json
   * [
   *   "my-folder",
   *   "my-sub-folder"
   * ]
   * ```
   */
  namepath: Array<string>;
  /**
   * Folder ID or null if resource is not in a folder (e.g., at workspace root)
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  parentId: string | null;
};
/**
 * Endpoint result or error note code
 * @example
 * ```
 * unsupportedOperationInMountBackend
 * ```
 */
export type EndpointResultNoteCode =
  | 'unsupportedOperationInMountBackend'
  | 'mountsNotCompletelyIngested';
export type EndpointResultNote = {
  /**
   * Endpoint result or error note code
   * @example
   * ```
   * unsupportedOperationInMountBackend
   * ```
   */
  code: EndpointResultNoteCode;
  /**
   * Endpoint result or error note message
   * @example
   * ```
   * Some mounts in the requested folder's mount chain do not support operation abc
   * ```
   */
  message: string;
};
/**
 * Response containing the newly created folder information
 */
export type AddFolderEndpointResult = {
  /**
   * Represents a folder in the workspace with its metadata and hierarchy information
   */
  folder: Folder;
  notes?: Array<EndpointResultNote>;
};
/**
 * Parameters for creating a new permission group in a workspace
 */
export type AddPermissionGroupEndpointParams = {
  /**
   * Workspace ID where the permission group will be created. If not provided, uses the workspace from the agent token
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Name for the new permission group. Must be unique within the workspace
   * @example
   * ```
   * Content Editors
   * ```
   */
  name: string;
  /**
   * Optional description explaining the purpose of this permission group
   * @example
   * ```
   * Users who can create, edit, and delete content files
   * ```
   */
  description?: string;
};
/**
 * A permission group that can be assigned to entities to grant access to workspace resources
 */
export type PermissionGroup = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  createdBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  createdAt: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  isDeleted: boolean;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  deletedAt?: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  deletedBy?: Agent;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId: string;
  /**
   * The name of the permission group
   * @example
   * ```
   * Editors
   * ```
   */
  name: string;
  /**
   * Optional description explaining the purpose of this permission group
   * @example
   * ```
   * Users who can edit files and folders in the workspace
   * ```
   */
  description?: string;
};
/**
 * Response containing the newly created permission group
 */
export type AddPermissionGroupEndpointResult = {
  /**
   * A permission group that can be assigned to entities to grant access to workspace resources
   */
  permissionGroup: PermissionGroup;
};
/**
 * Permission action
 * @example
 * ```
 * uploadFile
 * ```
 */
export type FimidaraPermissionAction =
  | '*'
  | 'updateWorkspace'
  | 'deleteWorkspace'
  | 'readWorkspace'
  | 'addFolder'
  | 'readFolder'
  | 'updateFolder'
  | 'transferFolder'
  | 'deleteFolder'
  | 'uploadFile'
  | 'readFile'
  | 'transferFile'
  | 'deleteFile'
  | 'addCollaborator'
  | 'readCollaborator'
  | 'removeCollaborator'
  | 'readCollaborationRequest'
  | 'revokeCollaborationRequest'
  | 'updateCollaborationRequest'
  | 'deleteCollaborationRequest'
  | 'updatePermission'
  | 'readPermission'
  | 'addAgentToken'
  | 'readAgentToken'
  | 'updateAgentToken'
  | 'deleteAgentToken'
  | 'addTag'
  | 'readTag'
  | 'updateTag'
  | 'deleteTag'
  | 'assignTag'
  | 'readUsageRecord'
  | 'addFileBackendConfig'
  | 'deleteFileBackendConfig'
  | 'readFileBackendConfig'
  | 'updateFileBackendConfig'
  | 'addFileBackendMount'
  | 'deleteFileBackendMount'
  | 'ingestFileBackendMount'
  | 'readFileBackendMount'
  | 'updateFileBackendMount';
/**
 * Input for creating a new permission item. Must specify target (targetId, filepath, folderpath, or workspaceRootname), entity, action, and access level.
 */
export type PermissionItemInput = {
  /**
   * Specific resource ID(s) to grant/deny permission to
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  targetId?: string | Array<string>;
  /**
   * File path(s) to grant/deny permission to
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string | Array<string>;
  /**
   * Folder path(s) to grant/deny permission to
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string | Array<string>;
  /**
   * Workspace root name to grant/deny permission to
   * @example
   * ```
   * fimidara-rootname
   * ```
   */
  workspaceRootname?: string;
  /**
   * Whether to grant (true) or deny (false) access
   * @example
   * ```
   * true
   * ```
   */
  access: boolean;
  /**
   * Entity ID(s) to grant/deny permission to (user, permission group, or agent token)
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  entityId: string | Array<string>;
  /**
   * Permission action(s) to grant/deny (e.g., readFile, uploadFile, deleteFolder)
   * @example
   * ```
   * uploadFile
   * ```
   */
  action: FimidaraPermissionAction | Array<FimidaraPermissionAction>;
};
/**
 * Parameters for adding permission items to a workspace.
 */
export type AddPermissionItemsEndpointParams = {
  /**
   * Workspace ID. If not provided, will be inferred from authentication context.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * List of permission items to add to the workspace.
   */
  items: Array<PermissionItemInput>;
};
/**
 * Parameters for assigning permission groups to entities
 */
export type AssignPermissionGroupsEndpointParams = {
  /**
   * Workspace ID where the assignment will take place. If not provided, uses the workspace from the agent token
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Entity ID or array of entity IDs (users, collaborators, or agent tokens) to assign permission groups to
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  entityId: string | Array<string>;
  /**
   * Permission group ID or array of permission group IDs to assign
   * @example
   * ```
   * pmgroup_000000000000000000000
   * ```
   */
  permissionGroupId: string | Array<string>;
};
/**
 * Part information for completing multipart upload
 */
export type CompleteMultipartUploadInputPart = {
  /**
   * Part number of the uploaded part
   * @example
   * ```
   * 1
   * ```
   */
  part: number;
};
/**
 * Parameters for completing a multipart upload by specifying all uploaded parts
 */
export type CompleteMultipartUploadEndpointParams = {
  /**
   * File path, with each folder name separated by a forward slash. The first item must be the workspace rootname, and must include the file extension. e.g /workspace-rootname/my-folder/my-file.txt.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string;
  /**
   * File ID
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
  /**
   * Client generated unique identifier for the multipart upload
   * @example
   * ```
   * upload-123e4567-e89b-12d3-a456-426614174000
   * ```
   */
  clientMultipartId: string;
  /**
   * List of all uploaded parts in order
   */
  parts: Array<CompleteMultipartUploadInputPart>;
};
/**
 * File resource with metadata and location information
 */
export type File = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  createdBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  createdAt: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  isDeleted: boolean;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  deletedAt?: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  deletedBy?: Agent;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId: string;
  /**
   * File size in bytes
   * @example
   * ```
   * 1024000
   * ```
   */
  size: number;
  /**
   * File ext, case insensitive
   * @example
   * ```
   * jpg
   * ```
   */
  ext?: string;
  /**
   * Folder ID or null if resource is not in a folder (e.g., at workspace root)
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  parentId: string | null;
  /**
   * List of parent folder IDs
   * @example
   * ```json
   * [
   *   "folder0_000000000000000000000"
   * ]
   * ```
   */
  idPath: Array<string>;
  /**
   * Folder path as a list of folder names. It should not include the workspace rootname. e.g ["my-folder", "my-sub-folder"].
   * @example
   * ```json
   * [
   *   "my-folder",
   *   "my-sub-folder"
   * ]
   * ```
   */
  namepath: Array<string>;
  /**
   * File MIME type
   * @example
   * ```
   * image/jpeg
   * ```
   */
  mimetype?: string;
  /**
   * File encoding
   * @example
   * ```
   * utf8
   * ```
   */
  encoding?: string;
  /**
   * File name, case insensitive
   * @example
   * ```
   * my-file
   * ```
   */
  name: string;
  /**
   * Resource description
   * @example
   * ```
   * This is a resource description.
   * ```
   */
  description?: string;
  /**
   * File version, representing how many times a file has been uploaded
   * @example
   * ```
   * 1
   * ```
   */
  version: number;
};
/**
 * Response containing the completed file and optional job information
 */
export type CompleteMultipartUploadEndpointResult = {
  /**
   * File resource with metadata and location information
   */
  file: File;
  /**
   * Job ID for tracking the file assembly process if it runs asynchronously
   * @example
   * ```
   * job0000_000000000000000000000
   * ```
   */
  jobId?: string;
};
/**
 * Parameters for counting the number of items in a folder
 */
export type CountFolderContentEndpointParams = {
  /**
   * Folder path, with each folder name separated by a forward slash. The first item must be the workspace rootname. e.g /workspace-rootname/my-folder/my-sub-folder.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string;
  /**
   * Folder ID
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  folderId?: string;
  /**
   * Filter by content type - specify "file" to count only files, "folder" to count only folders, or omit to count both
   * @example
   * ```
   * file
   * ```
   */
  contentType?: 'file' | 'folder';
};
/**
 * Response containing counts of folders and files in the specified directory
 */
export type CountFolderContentEndpointResult = {
  /**
   * Number of folders in the directory
   * @example
   * ```
   * 5
   * ```
   */
  foldersCount: number;
  /**
   * Number of files in the directory
   * @example
   * ```
   * 12
   * ```
   */
  filesCount: number;
  notes?: Array<EndpointResultNote>;
};
/**
 * Parameters for counting agent tokens in a workspace
 */
export type CountWorkspaceAgentTokensEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * Response containing the count of resources matching the query criteria
 */
export type CountItemsResult = {
  /**
   * Total number of resources matching the query
   * @example
   * ```
   * 42
   * ```
   */
  count: number;
};
/**
 * Parameters for counting the total number of collaboration requests sent from your workspace.
 */
export type CountWorkspaceCollaborationRequestsEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * Parameters for counting workspace collaborators.
 */
export type CountWorkspaceCollaboratorsEndpointParams = {
  /**
   * ID of the workspace to count collaborators in. If not provided, the user's default workspace is used.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * Parameters for counting permission groups in a workspace
 */
export type CountWorkspacePermissionGroupsEndpointParams = {
  /**
   * Workspace ID to count permission groups in. If not provided, uses the workspace from the agent token
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * Usage record category
 * @example
 * ```
 * storage
 * ```
 */
export type UsageRecordCategory =
  | 'total'
  | 'storage'
  | 'storageEver'
  | 'bin'
  | 'bout';
/**
 * Usage record fulfillment status
 * @example
 * ```
 * fulfilled
 * ```
 */
export type UsageRecordFulfillmentStatus =
  | 'undecided'
  | 'fulfilled'
  | 'dropped';
/**
 * Query parameters for filtering usage records
 */
export type SummedUsageQuery = {
  /**
   * Filter by usage category (storage, bandwidth, etc.)
   * @example
   * ```
   * storage
   * ```
   */
  category?: UsageRecordCategory | Array<UsageRecordCategory>;
  /**
   * Filter usage records from this date onwards
   * @example
   * ```
   * 1672531200000
   * ```
   */
  fromDate?: number;
  /**
   * Filter usage records up to this date
   * @example
   * ```
   * 1672531200000
   * ```
   */
  toDate?: number;
  /**
   * Filter by fulfillment status (fulfilled, pending, etc.)
   * @example
   * ```
   * fulfilled
   * ```
   */
  fulfillmentStatus?:
    | UsageRecordFulfillmentStatus
    | Array<UsageRecordFulfillmentStatus>;
};
/**
 * Parameters for counting workspace usage records
 */
export type CountWorkspaceSummedUsageEndpointParams = {
  /**
   * ID of the workspace to count usage for
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Query filters to apply when counting usage records
   */
  query?: SummedUsageQuery;
};
/**
 * Parameters for deleting an agent token
 */
export type DeleteAgentTokenEndpointParams = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  tokenId?: string;
  /**
   * Whether to perform action on the token used to authorize the API call when performing actions on tokens and a token ID or provided resource ID is not provided. Defaults to true if a call is made and a token ID is not provided
   */
  onReferenced?: boolean;
  /**
   * Resource ID provided by you, allowing you to use your own identifier instead of system-generated ones
   * @example
   * ```
   * my-custom-resource-id
   * ```
   */
  providedResourceId?: string;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * Response for operations that run asynchronously in the background
 */
export type LongRunningJobResult = {
  /**
   * Long-running job ID
   * @example
   * ```
   * job0000_000000000000000000000
   * ```
   */
  jobId?: string;
};
/**
 * Parameters for permanently deleting a collaboration request. This removes all record of the invitation.
 */
export type DeleteCollaborationRequestEndpointParams = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  requestId: string;
};
/**
 * Parameters for deleting a file or specific multipart upload parts
 */
export type DeleteFileEndpointParams = {
  /**
   * File path, with each folder name separated by a forward slash. The first item must be the workspace rootname, and must include the file extension. e.g /workspace-rootname/my-folder/my-file.txt.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string;
  /**
   * File ID
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
  /**
   * Client generated unique identifier for multipart uploads. It is used to identify the same multipart upload across multiple requests
   * @example
   * ```
   * upload-123e4567-e89b-12d3-a456-426614174000
   * ```
   */
  clientMultipartId?: string;
  /**
   * Part number of the multipart upload
   * @example
   * ```
   * 1
   * ```
   */
  part?: number;
};
/**
 * Parameters for deleting a folder and optionally its contents
 */
export type DeleteFolderEndpointParams = {
  /**
   * Folder path, with each folder name separated by a forward slash. The first item must be the workspace rootname. e.g /workspace-rootname/my-folder/my-sub-folder.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string;
  /**
   * Folder ID
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  folderId?: string;
};
/**
 * Response for folder deletion, may include job ID for tracking deletion progress
 */
export type DeleteFolderEndpointResult = {
  /**
   * Long-running job ID
   * @example
   * ```
   * job0000_000000000000000000000
   * ```
   */
  jobId?: string;
  notes?: Array<EndpointResultNote>;
};
/**
 * Parameters for deleting a permission group
 */
export type DeletePermissionGroupEndpointParams = {
  /**
   * Permission group ID. Either provide the permission group ID, or provide the workspace ID and permission group name
   * @example
   * ```
   * pmgroup_000000000000000000000
   * ```
   */
  permissionGroupId?: string;
  /**
   * Permission group name. Either provide the permission group ID, or provide the workspace ID and permission group name
   * @example
   * ```
   * Editors
   * ```
   */
  name?: string;
  /**
   * Workspace ID. When not provided, will default to using workspace ID from agent token. Either provide the permission group ID, or provide the workspace ID and permission group name
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * Input for deleting a permission item. At least one target (targetId, filepath, folderpath, or workspaceRootname) must be specified.
 */
export type DeletePermissionItemInput = {
  /**
   * Specific resource ID(s) to remove permissions from
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  targetId?: string | Array<string>;
  /**
   * File path(s) to remove permissions from
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string | Array<string>;
  /**
   * Folder path(s) to remove permissions from
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string | Array<string>;
  /**
   * Workspace root name to remove permissions from
   * @example
   * ```
   * fimidara-rootname
   * ```
   */
  workspaceRootname?: string;
  /**
   * Permission action(s) to remove. If not specified, removes all actions.
   * @example
   * ```
   * uploadFile
   * ```
   */
  action?: FimidaraPermissionAction | Array<FimidaraPermissionAction>;
  /**
   * Access level to remove. If not specified, removes both grant and deny permissions.
   * @example
   * ```
   * true
   * ```
   */
  access?: boolean;
  /**
   * Entity ID(s) to remove permissions from. If not specified, removes permissions for all entities.
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  entityId?: string | Array<string>;
};
/**
 * Parameters for deleting permission items from a workspace.
 */
export type DeletePermissionItemsEndpointParams = {
  /**
   * Workspace ID. If not provided, will be inferred from authentication context.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * List of permission items to delete from the workspace.
   */
  items: Array<DeletePermissionItemInput>;
};
/**
 * Response for operations that spawn multiple background jobs
 */
export type MultipleLongRunningJobResult = {
  /**
   * Multiple long running job IDs
   * @example
   * ```json
   * [
   *   "job0000_000000000000000000000"
   * ]
   * ```
   */
  jobIds: Array<string>;
};
/**
 * Parameters for encoding an agent token into JWT format
 */
export type EncodeAgentTokenEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Resource ID provided by you, allowing you to use your own identifier instead of system-generated ones
   * @example
   * ```
   * my-custom-resource-id
   * ```
   */
  providedResourceId?: string;
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  tokenId?: string;
  /**
   * Whether to perform action on the token used to authorize the API call when performing actions on tokens and a token ID or provided resource ID is not provided. Defaults to true if a call is made and a token ID is not provided
   */
  onReferenced?: boolean;
};
/**
 * Response containing the encoded JWT token
 */
export type EncodeAgentTokenEndpointResult = {
  /**
   * JWT token string used for authentication
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  jwtToken: string;
  /**
   * JWT refresh token string used to obtain new access tokens
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  refreshToken?: string;
  /**
   * JWT token expiration date. Not the expiration date of the token itself.
   */
  jwtTokenExpiresAt?: number;
};
/**
 * Parameters for retrieving a specific agent token
 */
export type GetAgentTokenEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Resource ID provided by you, allowing you to use your own identifier instead of system-generated ones
   * @example
   * ```
   * my-custom-resource-id
   * ```
   */
  providedResourceId?: string;
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  tokenId?: string;
  /**
   * Whether to perform action on the token used to authorize the API call when performing actions on tokens and a token ID or provided resource ID is not provided. Defaults to true if a call is made and a token ID is not provided
   */
  onReferenced?: boolean;
  /**
   * Whether the token returned should include the token encoded in JWT format.
   */
  shouldEncode?: boolean;
};
/**
 * Response containing the requested agent token
 */
export type GetAgentTokenEndpointResult = {
  /**
   * Agent token with authentication details and metadata
   */
  token: AgentToken;
};
/**
 * Parameters for getting a specific collaborator by ID.
 */
export type GetCollaboratorEndpointParams = {
  /**
   * ID of the workspace containing the collaborator. If not provided, the user's default workspace is used.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Unique ID of the collaborator to retrieve.
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  collaboratorId: string;
};
/**
 * Publicly visible information about a collaborator.
 */
export type Collaborator = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  createdBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  createdAt: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  isDeleted: boolean;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  deletedAt?: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  deletedBy?: Agent;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId: string;
  /**
   * Collaborator's first name as provided during registration or invitation.
   * @example
   * ```
   * John
   * ```
   */
  firstName: string;
  /**
   * Collaborator's last name as provided during registration or invitation.
   * @example
   * ```
   * Doe
   * ```
   */
  lastName: string;
  /**
   * Collaborator's email address used for authentication and notifications.
   * @example
   * ```
   * johndoe@email.com
   * ```
   */
  email: string;
};
/**
 * Result containing the requested collaborator information.
 */
export type GetCollaboratorEndpointResult = {
  /**
   * The collaborator information including personal details and workspace association.
   */
  collaborator: Collaborator;
};
/**
 * Parameters for retrieving permission groups assigned to a specific entity
 */
export type GetEntityAssignedPermissionGroupsParams = {
  /**
   * Workspace ID to search within. If not provided, uses the workspace from the agent token
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * ID of the entity (user, collaborator, or agent token) to get assigned permission groups for
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  entityId: string;
  /**
   * Whether to include permission groups not directly assigned but inherited through permission groups assigned to entity
   * @example
   * ```
   * true
   * ```
   */
  includeInheritedPermissionGroups?: boolean;
};
/**
 * Metadata about a permission group assignment to an entity
 */
export type PublicAssignedPermissionGroupMeta = {
  /**
   * The ID of the assigned permission group
   * @example
   * ```
   * pmgroup_000000000000000000000
   * ```
   */
  permissionGroupId: string;
  /**
   * Information about who assigned this permission group
   */
  assignedBy: Agent;
  /**
   * UTC timestamp in milliseconds when the permission group was assigned
   * @example
   * ```
   * 1697376600000
   * ```
   */
  assignedAt: number;
  /**
   * The ID of the entity (user, collaborator, or agent token) that was assigned the permission group
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  assigneeEntityId: string;
};
/**
 * Response containing permission groups assigned to an entity
 */
export type GetEntityAssignedPermissionGroupsEndpointResult = {
  /**
   * Array of permission groups assigned to the entity (including inherited ones if requested)
   */
  permissionGroups: Array<PermissionGroup>;
  /**
   * Metadata about the direct assignment of permission groups (excludes inherited ones)
   */
  immediateAssignedPermissionGroupsMeta: Array<PublicAssignedPermissionGroupMeta>;
};
/**
 * Parameters for retrieving file details
 */
export type GetFileDetailsEndpointParams = {
  /**
   * File path, with each folder name separated by a forward slash. The first item must be the workspace rootname, and must include the file extension. e.g /workspace-rootname/my-folder/my-file.txt.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string;
  /**
   * File ID
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
};
/**
 * Response containing the requested file details
 */
export type GetFileDetailsEndpointResult = {
  /**
   * File resource with metadata and location information
   */
  file: File;
};
/**
 * Parameters for retrieving a specific folder by path or ID
 */
export type GetFolderEndpointParams = {
  /**
   * Folder path, with each folder name separated by a forward slash. The first item must be the workspace rootname. e.g /workspace-rootname/my-folder/my-sub-folder.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string;
  /**
   * Folder ID
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  folderId?: string;
};
/**
 * Response containing the requested folder information
 */
export type GetFolderEndpointResult = {
  /**
   * Represents a folder in the workspace with its metadata and hierarchy information
   */
  folder: Folder;
};
/**
 * Parameters required to retrieve the status of a specific job
 */
export type GetJobStatusEndpointParams = {
  /**
   * Unique identifier of the job whose status is being requested
   * @example
   * ```
   * job0000_000000000000000000000
   * ```
   */
  jobId: string;
};
/**
 * Job status indicating the current state of execution
 * @example
 * ```
 * completed
 * ```
 */
export type JobStatus =
  | 'pending'
  | 'inProgress'
  | 'waitingForChildren'
  | 'completed'
  | 'failed';
/**
 * Response containing the current status and optional error information for the requested job
 */
export type GetJobStatusEndpointResult = {
  /**
   * Current execution status of the job
   * @example
   * ```
   * completed
   * ```
   */
  status: JobStatus;
  /**
   * Optional error message providing details when job execution fails
   * @example
   * ```
   * File processing failed due to invalid format
   * ```
   */
  errorMessage?: string;
};
/**
 * Parameters for retrieving a single permission group by ID or name
 */
export type GetPermissionGroupEndpointParams = {
  /**
   * Permission group ID. Either provide the permission group ID, or provide the workspace ID and permission group name
   * @example
   * ```
   * pmgroup_000000000000000000000
   * ```
   */
  permissionGroupId?: string;
  /**
   * Permission group name. Either provide the permission group ID, or provide the workspace ID and permission group name
   * @example
   * ```
   * Editors
   * ```
   */
  name?: string;
  /**
   * Workspace ID. When not provided, will default to using workspace ID from agent token. Either provide the permission group ID, or provide the workspace ID and permission group name
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * Response containing the requested permission group
 */
export type GetPermissionGroupEndpointResult = {
  /**
   * A permission group that can be assigned to entities to grant access to workspace resources
   */
  permissionGroup: PermissionGroup;
};
export type FileMatcher = {
  /**
   * Full path to the file within the workspace, including filename and extension
   * @example
   * ```
   * /documents/reports/quarterly-report.pdf
   * ```
   */
  filepath?: string;
  /**
   * Unique identifier for the file. Use either fileId or filepath, not both
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
};
export type GetPresignedPathsForFilesEndpointParams = {
  /**
   * List of files to generate presigned paths for. Each file can be identified by either filepath or fileId
   */
  files?: Array<FileMatcher>;
  /**
   * ID of the workspace containing the files. If not provided, uses the default workspace
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
export type GetPresignedPathsForFilesItem = {
  /**
   * The generated presigned path for accessing this specific file
   * @example
   * ```
   * /v1/files/presigned/abc123def456/quarterly-report.pdf?token=xyz789
   * ```
   */
  path: string;
  /**
   * The original filepath of the file that this presigned path corresponds to
   * @example
   * ```
   * /documents/reports/quarterly-report.pdf
   * ```
   */
  filepath: string;
};
export type GetPresignedPathsForFilesEndpointResult = {
  /**
   * Array of presigned path objects, one for each requested file
   */
  paths: Array<GetPresignedPathsForFilesItem>;
};
/**
 * Specifies how to fetch a specific resource. You can identify resources by ID, filepath, or folderpath, combined with the action you want to perform.
 * @example
 * ```json
 * {
 *   "action": "read",
 *   "filepath": "/documents/report.pdf"
 * }
 * ```
 */
export type FetchResourceItem = {
  /**
   * The unique identifier(s) of the resource(s) to fetch. Can be a single ID or an array of IDs.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId?: string | Array<string>;
  /**
   * The action to perform on the resource. Common actions include "read", "write", "delete", etc.
   * @example
   * ```
   * uploadFile
   * ```
   */
  action: FimidaraPermissionAction;
  /**
   * The file path(s) to fetch. Use forward slashes as path separators. Can be a single path or an array of paths.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string | Array<string>;
  /**
   * The folder path(s) to fetch. Use forward slashes as path separators. Can be a single path or an array of paths.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string | Array<string>;
  /**
   * The root name of the workspace. If not provided, uses the default workspace.
   * @example
   * ```
   * fimidara-rootname
   * ```
   */
  workspaceRootname?: string;
};
/**
 * Parameters for fetching multiple resources in a single request. This allows batch operations for better performance.
 * @example
 * ```json
 * {
 *   "workspaceId": "wrkspce_000000000000000000000",
 *   "resources": [
 *     {
 *       "action": "read",
 *       "filepath": "/documents/report.pdf"
 *     },
 *     {
 *       "action": "read",
 *       "folderpath": "/images"
 *     },
 *     {
 *       "action": "write",
 *       "resourceId": "file000_000000000000000000000"
 *     }
 *   ]
 * }
 * ```
 */
export type GetResourcesEndpointParams = {
  /**
   * The ID of the workspace to fetch resources from. If not provided, uses the user's default workspace.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Array of resource fetch specifications. Each item describes how to identify and what action to perform on a resource.
   * @example
   * ```json
   * [
   *   {
   *     "action": "read",
   *     "filepath": "/documents/report.pdf"
   *   }
   * ]
   * ```
   */
  resources: Array<FetchResourceItem>;
};
/**
 * Resource type
 * @example
 * ```
 * file
 * ```
 */
export type FimidaraResourceType =
  | '*'
  | 'system'
  | 'public'
  | 'workspace'
  | 'collaborationRequest'
  | 'agentToken'
  | 'permissionGroup'
  | 'permissionItem'
  | 'folder'
  | 'file'
  | 'user'
  | 'tag'
  | 'usageRecord'
  | 'presignedPath'
  | 'fileBackendConfig'
  | 'fileBackendMount'
  | 'job';
/**
 * The actual resource data. The structure varies depending on the resource type (file, folder, workspace, etc.).
 * @example
 * ```json
 * {
 *   "resourceId": "file000_000000000000000000000",
 *   "name": "report.pdf",
 *   "workspaceId": {
 *     "__id": "FieldString",
 *     "description": "Workspace ID",
 *     "example": "wrkspce_000000000000000000000"
 *   },
 *   "createdAt": 1672531200000,
 *   "lastUpdatedAt": 1672531200000
 * }
 * ```
 */
export type Resource = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  createdBy?: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  createdAt: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy?: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  isDeleted: boolean;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  deletedAt?: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  deletedBy?: Agent;
};
/**
 * Wraps a resource with metadata about its type and ID. This provides context about what kind of resource is being returned.
 * @example
 * ```json
 * {
 *   "resourceId": "file000_000000000000000000000",
 *   "resourceType": "file",
 *   "resource": {
 *     "resourceId": "file000_000000000000000000000",
 *     "createdAt": 1672531200000,
 *     "lastUpdatedAt": 1672531200000,
 *     "lastUpdatedBy": {
 *       "agentId": "agtoken_000000000000000000000",
 *       "agentType": "agentToken"
 *     },
 *     "createdBy": {
 *       "agentId": "agtoken_000000000000000000000",
 *       "agentType": "agentToken"
 *     }
 *   }
 * }
 * ```
 */
export type ResourceWrapper = {
  /**
   * The unique identifier of the resource.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * The type of resource (e.g., "file", "folder", "workspace", "collaborationRequest").
   * @example
   * ```
   * file
   * ```
   */
  resourceType: FimidaraResourceType;
  /**
   * The resource data. Structure depends on the resource type specified in resourceType field.
   * @example
   * ```json
   * {
   *   "resourceId": "file000_000000000000000000000",
   *   "name": "report.pdf",
   *   "workspaceId": {
   *     "__id": "FieldString",
   *     "description": "Workspace ID",
   *     "example": "wrkspce_000000000000000000000"
   *   },
   *   "createdAt": 1672531200000,
   *   "lastUpdatedAt": 1672531200000
   * }
   * ```
   */
  resource: Resource;
};
/**
 * Response containing the requested resources. Each resource is wrapped with metadata for easy identification.
 * @example
 * ```json
 * {
 *   "resources": [
 *     {
 *       "resourceId": "file000_000000000000000000000",
 *       "resourceType": "file",
 *       "resource": {
 *         "__id": "FieldObject",
 *         "name": "File",
 *         "description": "File resource with metadata and location information",
 *         "fields": {
 *           "resourceId": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "Resource ID",
 *               "example": "wrkspce_000000000000000000000"
 *             }
 *           },
 *           "createdBy": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldObject",
 *               "name": "Agent",
 *               "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
 *               "fields": {
 *                 "agentId": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent ID. Possible agents are users and agent tokens",
 *                     "example": "user000_000000000000000000000"
 *                   }
 *                 },
 *                 "agentType": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent type",
 *                     "example": "agentToken",
 *                     "valid": [
 *                       "user",
 *                       "agentToken"
 *                     ],
 *                     "enumName": "AgentType"
 *                   }
 *                 }
 *               }
 *             }
 *           },
 *           "createdAt": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldNumber",
 *               "description": "UTC timestamp in milliseconds",
 *               "example": 1672531200000
 *             }
 *           },
 *           "lastUpdatedBy": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldObject",
 *               "name": "Agent",
 *               "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
 *               "fields": {
 *                 "agentId": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent ID. Possible agents are users and agent tokens",
 *                     "example": "user000_000000000000000000000"
 *                   }
 *                 },
 *                 "agentType": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent type",
 *                     "example": "agentToken",
 *                     "valid": [
 *                       "user",
 *                       "agentToken"
 *                     ],
 *                     "enumName": "AgentType"
 *                   }
 *                 }
 *               }
 *             }
 *           },
 *           "lastUpdatedAt": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldNumber",
 *               "description": "UTC timestamp in milliseconds",
 *               "example": 1672531200000
 *             }
 *           },
 *           "isDeleted": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldBoolean"
 *             }
 *           },
 *           "deletedAt": {
 *             "__id": "FieldObjectField",
 *             "required": false,
 *             "data": {
 *               "__id": "FieldNumber",
 *               "description": "UTC timestamp in milliseconds",
 *               "example": 1672531200000
 *             }
 *           },
 *           "deletedBy": {
 *             "__id": "FieldObjectField",
 *             "required": false,
 *             "data": {
 *               "__id": "FieldObject",
 *               "name": "Agent",
 *               "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
 *               "fields": {
 *                 "agentId": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent ID. Possible agents are users and agent tokens",
 *                     "example": "user000_000000000000000000000"
 *                   }
 *                 },
 *                 "agentType": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent type",
 *                     "example": "agentToken",
 *                     "valid": [
 *                       "user",
 *                       "agentToken"
 *                     ],
 *                     "enumName": "AgentType"
 *                   }
 *                 }
 *               }
 *             }
 *           },
 *           "workspaceId": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "Workspace ID",
 *               "example": "wrkspce_000000000000000000000"
 *             }
 *           },
 *           "size": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldNumber",
 *               "description": "File size in bytes",
 *               "max": 1073741824,
 *               "example": 1024000
 *             }
 *           },
 *           "ext": {
 *             "__id": "FieldObjectField",
 *             "required": false,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "File ext, case insensitive",
 *               "example": "jpg"
 *             }
 *           },
 *           "parentId": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldOrCombination",
 *               "description": "Folder ID or null if resource is not in a folder (e.g., at workspace root)",
 *               "types": [
 *                 {
 *                   "__id": "FieldString",
 *                   "description": "Folder ID",
 *                   "example": "folder0_000000000000000000000"
 *                 },
 *                 {
 *                   "__id": "FieldNull"
 *                 }
 *               ]
 *             }
 *           },
 *           "idPath": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldArray",
 *               "type": {
 *                 "__id": "FieldString",
 *                 "description": "Folder ID",
 *                 "example": "folder0_000000000000000000000"
 *               },
 *               "description": "List of parent folder IDs"
 *             }
 *           },
 *           "namepath": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldArray",
 *               "description": "Folder path as a list of folder names. It should not include the workspace rootname. e.g [\"my-folder\", \"my-sub-folder\"].",
 *               "type": {
 *                 "__id": "FieldString"
 *               },
 *               "example": [
 *                 "my-folder",
 *                 "my-sub-folder"
 *               ]
 *             }
 *           },
 *           "mimetype": {
 *             "__id": "FieldObjectField",
 *             "required": false,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "File MIME type",
 *               "example": "image/jpeg"
 *             }
 *           },
 *           "encoding": {
 *             "__id": "FieldObjectField",
 *             "required": false,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "File encoding",
 *               "example": "utf8"
 *             }
 *           },
 *           "name": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "File name, case insensitive",
 *               "example": "my-file"
 *             }
 *           },
 *           "description": {
 *             "__id": "FieldObjectField",
 *             "required": false,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "Resource description",
 *               "example": "This is a resource description."
 *             }
 *           },
 *           "version": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldNumber",
 *               "description": "File version, representing how many times a file has been uploaded",
 *               "example": 1
 *             }
 *           }
 *         }
 *       }
 *     },
 *     {
 *       "resourceId": "folder0_000000000000000000000",
 *       "resourceType": "folder",
 *       "resource": {
 *         "__id": "FieldObject",
 *         "name": "Folder",
 *         "description": "Represents a folder in the workspace with its metadata and hierarchy information",
 *         "fields": {
 *           "resourceId": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "Resource ID",
 *               "example": "wrkspce_000000000000000000000"
 *             }
 *           },
 *           "createdBy": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldObject",
 *               "name": "Agent",
 *               "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
 *               "fields": {
 *                 "agentId": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent ID. Possible agents are users and agent tokens",
 *                     "example": "user000_000000000000000000000"
 *                   }
 *                 },
 *                 "agentType": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent type",
 *                     "example": "agentToken",
 *                     "valid": [
 *                       "user",
 *                       "agentToken"
 *                     ],
 *                     "enumName": "AgentType"
 *                   }
 *                 }
 *               }
 *             }
 *           },
 *           "createdAt": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldNumber",
 *               "description": "UTC timestamp in milliseconds",
 *               "example": 1672531200000
 *             }
 *           },
 *           "lastUpdatedBy": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldObject",
 *               "name": "Agent",
 *               "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
 *               "fields": {
 *                 "agentId": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent ID. Possible agents are users and agent tokens",
 *                     "example": "user000_000000000000000000000"
 *                   }
 *                 },
 *                 "agentType": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent type",
 *                     "example": "agentToken",
 *                     "valid": [
 *                       "user",
 *                       "agentToken"
 *                     ],
 *                     "enumName": "AgentType"
 *                   }
 *                 }
 *               }
 *             }
 *           },
 *           "lastUpdatedAt": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldNumber",
 *               "description": "UTC timestamp in milliseconds",
 *               "example": 1672531200000
 *             }
 *           },
 *           "isDeleted": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldBoolean"
 *             }
 *           },
 *           "deletedAt": {
 *             "__id": "FieldObjectField",
 *             "required": false,
 *             "data": {
 *               "__id": "FieldNumber",
 *               "description": "UTC timestamp in milliseconds",
 *               "example": 1672531200000
 *             }
 *           },
 *           "deletedBy": {
 *             "__id": "FieldObjectField",
 *             "required": false,
 *             "data": {
 *               "__id": "FieldObject",
 *               "name": "Agent",
 *               "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
 *               "fields": {
 *                 "agentId": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent ID. Possible agents are users and agent tokens",
 *                     "example": "user000_000000000000000000000"
 *                   }
 *                 },
 *                 "agentType": {
 *                   "__id": "FieldObjectField",
 *                   "required": true,
 *                   "data": {
 *                     "__id": "FieldString",
 *                     "description": "Agent type",
 *                     "example": "agentToken",
 *                     "valid": [
 *                       "user",
 *                       "agentToken"
 *                     ],
 *                     "enumName": "AgentType"
 *                   }
 *                 }
 *               }
 *             }
 *           },
 *           "workspaceId": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "Workspace ID",
 *               "example": "wrkspce_000000000000000000000"
 *             }
 *           },
 *           "name": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "Resource name",
 *               "example": "My resource name"
 *             }
 *           },
 *           "description": {
 *             "__id": "FieldObjectField",
 *             "required": false,
 *             "data": {
 *               "__id": "FieldString",
 *               "description": "Resource description",
 *               "example": "This is a resource description."
 *             }
 *           },
 *           "idPath": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldArray",
 *               "type": {
 *                 "__id": "FieldString",
 *                 "description": "Folder ID",
 *                 "example": "folder0_000000000000000000000"
 *               },
 *               "description": "List of parent folder IDs"
 *             }
 *           },
 *           "namepath": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldArray",
 *               "description": "Folder path as a list of folder names. It should not include the workspace rootname. e.g [\"my-folder\", \"my-sub-folder\"].",
 *               "type": {
 *                 "__id": "FieldString"
 *               },
 *               "example": [
 *                 "my-folder",
 *                 "my-sub-folder"
 *               ]
 *             }
 *           },
 *           "parentId": {
 *             "__id": "FieldObjectField",
 *             "required": true,
 *             "data": {
 *               "__id": "FieldOrCombination",
 *               "description": "Folder ID or null if resource is not in a folder (e.g., at workspace root)",
 *               "types": [
 *                 {
 *                   "__id": "FieldString",
 *                   "description": "Folder ID",
 *                   "example": "folder0_000000000000000000000"
 *                 },
 *                 {
 *                   "__id": "FieldNull"
 *                 }
 *               ]
 *             }
 *           }
 *         }
 *       }
 *     }
 *   ]
 * }
 * ```
 */
export type GetResourcesEndpointResult = {
  /**
   * Array of resource wrappers containing the requested resources and their metadata.
   * @example
   * ```json
   * [
   *   {
   *     "resourceId": "file000_000000000000000000000",
   *     "resourceType": "file",
   *     "resource": {
   *       "resourceId": "file000_000000000000000000000",
   *       "createdAt": 1672531200000,
   *       "lastUpdatedAt": 1672531200000,
   *       "lastUpdatedBy": {
   *         "agentId": "agtoken_000000000000000000000",
   *         "agentType": "agentToken"
   *       },
   *       "createdBy": {
   *         "agentId": "agtoken_000000000000000000000",
   *         "agentType": "agentToken"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  resources: Array<ResourceWrapper>;
};
/**
 * Breakdown of usage costs by category
 */
export type UsageCosts = {
  /**
   * Cost for storage usage
   * @example
   * ```
   * 0.05
   * ```
   */
  storage: number;
  /**
   * Cost for maximum storage ever consumed
   * @example
   * ```
   * 0.05
   * ```
   */
  storageEver: number;
  /**
   * Cost for inbound bandwidth usage
   * @example
   * ```
   * 0.05
   * ```
   */
  bin: number;
  /**
   * Cost for outbound bandwidth usage
   * @example
   * ```
   * 0.05
   * ```
   */
  bout: number;
  /**
   * Total cost across all usage categories
   * @example
   * ```
   * 0.05
   * ```
   */
  total: number;
};
/**
 * Response containing usage cost breakdown by category
 */
export type GetUsageCostsEndpointResult = {
  /**
   * Detailed breakdown of costs by usage category
   */
  costs: UsageCosts;
};
/**
 * Parameters for retrieving agent tokens in a workspace
 */
export type GetWorkspaceAgentTokensEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Page number, starting from 0
   */
  page?: number;
  /**
   * Page size, with a default of 50 and a max of 100
   * @example
   * ```
   * 50
   * ```
   */
  pageSize?: number;
  /**
   * Whether the token returned should include the token encoded in JWT format.
   */
  shouldEncode?: boolean;
};
/**
 * Paginated list of agent tokens in the workspace
 */
export type GetWorkspaceAgentTokensEndpointResult = {
  /**
   * List of agent tokens
   */
  tokens: Array<AgentToken>;
  /**
   * Page number, starting from 0
   */
  page: number;
};
/**
 * Parameters for retrieving details of a specific collaboration request sent from your workspace.
 */
export type GetWorkspaceCollaborationRequestEndpointParams = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  requestId: string;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * Current status of the collaboration request. Shows whether the request is pending, accepted, declined, or revoked.
 * @example
 * ```
 * accepted
 * ```
 */
export type CollaborationRequestStatusType =
  | 'accepted'
  | 'declined'
  | 'revoked'
  | 'pending';
/**
 * A collaboration request as seen by the workspace owner. Contains details about who was invited and the current status of the invitation.
 */
export type CollaborationRequestForWorkspace = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  createdBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  createdAt: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  isDeleted: boolean;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  deletedAt?: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  deletedBy?: Agent;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId: string;
  /**
   * Email address of the user you want to collaborate with. This user will receive the collaboration request and can accept or decline it.
   * @example
   * ```
   * babar@fimidara.com
   * ```
   */
  recipientEmail: string;
  /**
   * Personal message to include with the collaboration request. Use this to explain why you want to collaborate or provide context about the workspace.
   * @example
   * ```
   * Hi! I would love to collaborate with you on this project. Your expertise in data analysis would be very valuable.
   * ```
   */
  message: string;
  /**
   * Expiration date as UTC timestamp in milliseconds
   * @example
   * ```
   * 1704067200000
   * ```
   */
  expiresAt?: number;
  /**
   * Workspace name, case insensitive
   * @example
   * ```
   * fimidara
   * ```
   */
  workspaceName: string;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  readAt?: number;
  /**
   * Current status of the collaboration request. Shows whether the request is pending, accepted, declined, or revoked.
   * @example
   * ```
   * accepted
   * ```
   */
  status: CollaborationRequestStatusType;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  statusDate: number;
};
/**
 * Details of a specific collaboration request sent from your workspace, showing its current status and recipient information.
 */
export type GetWorkspaceCollaborationRequestEndpointResult = {
  /**
   * A collaboration request as seen by the workspace owner. Contains details about who was invited and the current status of the invitation.
   */
  request: CollaborationRequestForWorkspace;
};
/**
 * Parameters for retrieving collaboration requests sent from your workspace. Use pagination to handle large numbers of requests.
 */
export type GetWorkspaceCollaborationRequestsEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Page number, starting from 0
   */
  page?: number;
  /**
   * Page size, with a default of 50 and a max of 100
   * @example
   * ```
   * 50
   * ```
   */
  pageSize?: number;
};
/**
 * Paginated list of collaboration requests sent from your workspace, showing the status of each invitation.
 */
export type GetWorkspaceCollaborationRequestsEndpointResult = {
  /**
   * [Array] A collaboration request as seen by the workspace owner. Contains details about who was invited and the current status of the invitation.
   */
  requests: Array<CollaborationRequestForWorkspace>;
  /**
   * Page number, starting from 0
   */
  page: number;
};
/**
 * Parameters for getting a list of workspace collaborators.
 */
export type GetWorkspaceCollaboratorsEndpointParams = {
  /**
   * ID of the workspace to get collaborators from. If not provided, the user's default workspace is used.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Page number to fetch. Starts from 1 for the first page.
   * @example
   * ```
   * 1
   * ```
   */
  page?: number;
  /**
   * Number of collaborators to fetch per page. Defaults to 20, maximum 100.
   * @example
   * ```
   * 20
   * ```
   */
  pageSize?: number;
};
/**
 * Result of getting a list of workspace collaborators.
 */
export type GetWorkspaceCollaboratorsEndpointResult = {
  /**
   * List of collaborators in the workspace.
   * @example
   * ```json
   * [
   *   {
   *     "resourceId": "user000_000000000000000000000",
   *     "workspaceId": {
   *       "__id": "FieldString",
   *       "description": "Workspace ID",
   *       "example": "wrkspce_000000000000000000000"
   *     },
   *     "firstName": "John",
   *     "lastName": "Doe",
   *     "email": "john.doe@example.com",
   *     "createdAt": "2024-01-15T10:30:00.000Z",
   *     "lastUpdatedAt": "2024-01-15T10:30:00.000Z"
   *   }
   * ]
   * ```
   */
  collaborators: Array<Collaborator>;
  /**
   * The current page number of results returned.
   * @example
   * ```
   * 1
   * ```
   */
  page: number;
};
/**
 * Parameters for retrieving workspace information. If workspaceId is not provided, returns the current user's default workspace
 */
export type GetWorkspaceEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * Workspace bill status
 * @example
 * ```
 * ok
 * ```
 */
export type WorkspaceBillStatus = 'ok' | 'gracePeriod' | 'billOverdue';
/**
 * Usage threshold configuration for workspace billing and limits
 */
export type UsageThreshold = {
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  /**
   * Usage record category
   * @example
   * ```
   * storage
   * ```
   */
  category: UsageRecordCategory;
  /**
   * Price in USD
   * @example
   * ```
   * 5
   * ```
   */
  budget: number;
  /**
   * Usage amount. Bytes for storage, bin, and bout. Always 0 for total, use `usageCost` instead
   * @example
   * ```
   * 1024000
   * ```
   */
  usage: number;
};
/**
 * Usage thresholds for different resource categories in the workspace
 */
export type WorkspaceUsageThresholds = {
  /**
   * Usage threshold configuration for workspace billing and limits
   */
  storage?: UsageThreshold;
  /**
   * Usage threshold configuration for workspace billing and limits
   */
  storageEver?: UsageThreshold;
  /**
   * Usage threshold configuration for workspace billing and limits
   */
  bin?: UsageThreshold;
  /**
   * Usage threshold configuration for workspace billing and limits
   */
  bout?: UsageThreshold;
  /**
   * Usage threshold configuration for workspace billing and limits
   */
  total?: UsageThreshold;
};
/**
 * A workspace containing files, folders, and access control settings
 */
export type Workspace = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  createdBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  createdAt: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  isDeleted: boolean;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  deletedAt?: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  deletedBy?: Agent;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId: string;
  /**
   * Workspace name, case insensitive
   * @example
   * ```
   * fimidara
   * ```
   */
  name: string;
  /**
   * Workspace root name, must be a URL compatible name, case insensitive
   * @example
   * ```
   * fimidara-rootname
   * ```
   */
  rootname: string;
  /**
   * Workspace description
   * @example
   * ```
   * fimidara, a super awesome company that offers file management with access control for devs
   * ```
   */
  description?: string;
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  publicPermissionGroupId: string;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  billStatusAssignedAt: number;
  /**
   * Workspace bill status
   * @example
   * ```
   * ok
   * ```
   */
  billStatus: WorkspaceBillStatus;
  /**
   * Usage thresholds for different resource categories in the workspace
   */
  usageThresholds: WorkspaceUsageThresholds;
};
/**
 * Response containing the requested workspace information
 */
export type GetWorkspaceEndpointResult = {
  /**
   * A workspace containing files, folders, and access control settings
   */
  workspace: Workspace;
};
/**
 * Parameters for retrieving permission groups in a workspace with pagination
 */
export type GetWorkspacePermissionGroupsEndpointParams = {
  /**
   * Workspace ID to retrieve permission groups from. If not provided, uses the workspace from the agent token
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Page number for pagination (0-based)
   */
  page?: number;
  /**
   * Number of permission groups to return per page
   * @example
   * ```
   * 20
   * ```
   */
  pageSize?: number;
};
/**
 * Response containing a paginated list of permission groups
 */
export type GetWorkspacePermissionGroupsEndpointResult = {
  /**
   * Array of permission groups in the workspace
   */
  permissionGroups: Array<PermissionGroup>;
  /**
   * Current page number (0-based)
   */
  page: number;
};
/**
 * Parameters for retrieving workspace usage records
 */
export type GetWorkspaceSummedUsageEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Page number for pagination (starts from 0)
   */
  page?: number;
  /**
   * Number of records to return per page
   * @example
   * ```
   * 50
   * ```
   */
  pageSize?: number;
  /**
   * Query filters to apply to the usage records
   */
  query?: SummedUsageQuery;
};
/**
 * A workspace usage record containing usage metrics and costs
 */
export type UsageRecord = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  resourceId: string;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  createdBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  createdAt: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  lastUpdatedBy: Agent;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  lastUpdatedAt: number;
  isDeleted: boolean;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  deletedAt?: number;
  /**
   * Represents a user or system entity that performed an action (e.g., created or updated a resource)
   */
  deletedBy?: Agent;
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId: string;
  /**
   * The type of usage being recorded (storage, bandwidth, etc.)
   * @example
   * ```
   * storage
   * ```
   */
  category: UsageRecordCategory;
  /**
   * The amount of usage recorded (in bytes for storage, etc.)
   * @example
   * ```
   * 1024000
   * ```
   */
  usage: number;
  /**
   * The cost associated with this usage record
   * @example
   * ```
   * 0.05
   * ```
   */
  usageCost: number;
  /**
   * The fulfillment status of this usage record
   * @example
   * ```
   * fulfilled
   * ```
   */
  status: UsageRecordFulfillmentStatus;
  /**
   * The month this usage was recorded for
   */
  month: number;
  /**
   * The year this usage was recorded for
   * @example
   * ```
   * 2024
   * ```
   */
  year: number;
};
/**
 * Response containing workspace usage records and pagination info
 */
export type GetWorkspaceSummedUsageEndpointResult = {
  /**
   * Array of usage records matching the query
   */
  records: Array<UsageRecord>;
  /**
   * Current page number returned
   */
  page: number;
};
export type IssuePresignedPathEndpointParams = {
  /**
   * Full path to the file within the workspace. Required if fileId is not provided
   * @example
   * ```
   * /documents/reports/quarterly-report.pdf
   * ```
   */
  filepath?: string;
  /**
   * Unique identifier for the file. Required if filepath is not provided
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
  /**
   * The action the presigned path will be valid for. Defaults to "readFile" if not specified
   * @example
   * ```
   * readFile
   * ```
   */
  action?: FimidaraPermissionAction | Array<FimidaraPermissionAction>;
  /**
   * How long the presigned path should remain valid, in seconds. Defaults to 3600 seconds (1 hour)
   * @example
   * ```
   * 3600
   * ```
   */
  duration?: number;
  /**
   * Specific expiration timestamp for the presigned path. Alternative to duration
   * @example
   * ```
   * 1640995200000
   * ```
   */
  expires?: number;
  /**
   * Maximum number of times the presigned path can be used before it becomes invalid. Defaults to unlimited if not specified
   * @example
   * ```
   * 5
   * ```
   */
  usageCount?: number;
};
export type IssuePresignedPathEndpointResult = {
  /**
   * The generated presigned path that can be used to access the file without authentication
   * @example
   * ```
   * /v1/files/presigned/abc123def456/quarterly-report.pdf?token=xyz789
   * ```
   */
  path: string;
};
/**
 * Parameters for listing the contents of a folder with optional filtering and pagination
 */
export type ListFolderContentEndpointParams = {
  /**
   * Folder path, with each folder name separated by a forward slash. The first item must be the workspace rootname. e.g /workspace-rootname/my-folder/my-sub-folder.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string;
  /**
   * Folder ID
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  folderId?: string;
  /**
   * Filter by content type - specify "file" to get only files, "folder" to get only folders, or omit to get both
   * @example
   * ```
   * file
   * ```
   */
  contentType?: 'file' | 'folder';
  /**
   * Page number, starting from 0
   */
  page?: number;
  /**
   * Page size, with a default of 50 and a max of 100
   * @example
   * ```
   * 50
   * ```
   */
  pageSize?: number;
};
/**
 * Response containing the folder contents with folders and files arrays
 */
export type ListFolderContentEndpointResult = {
  /**
   * Array of folders in the requested directory
   */
  folders: Array<Folder>;
  /**
   * Array of files in the requested directory
   */
  files: Array<File>;
  /**
   * Page number, starting from 0
   */
  page: number;
  notes?: Array<EndpointResultNote>;
};
/**
 * Parameters for listing uploaded parts of a multipart upload
 */
export type ListPartsEndpointParams = {
  /**
   * File path, with each folder name separated by a forward slash. The first item must be the workspace rootname, and must include the file extension. e.g /workspace-rootname/my-folder/my-file.txt.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string;
  /**
   * File ID
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
  /**
   * Page number, starting from 0
   */
  page?: number;
  /**
   * Page size, with a default of 50 and a max of 100
   * @example
   * ```
   * 50
   * ```
   */
  pageSize?: number;
};
/**
 * Information about an uploaded file part
 */
export type PartDetails = {
  /**
   * Part number of the multipart upload
   * @example
   * ```
   * 1
   * ```
   */
  part: number;
  /**
   * Part size in bytes
   * @example
   * ```
   * 5242880
   * ```
   */
  size: number;
};
/**
 * Response containing the list of uploaded parts and pagination info
 */
export type ListPartsEndpointResult = {
  /**
   * Client generated unique identifier for multipart uploads. It is used to identify the same multipart upload across multiple requests
   * @example
   * ```
   * upload-123e4567-e89b-12d3-a456-426614174000
   * ```
   */
  clientMultipartId?: string;
  /**
   * List of uploaded file parts
   */
  parts: Array<PartDetails>;
  /**
   * Page number, starting from 0
   */
  page: number;
};
/**
 * How the image should be resized to fit provided dimensions
 * @example
 * ```
 * cover
 * ```
 */
export type ImageResizeFitEnum =
  | 'contain'
  | 'cover'
  | 'fill'
  | 'inside'
  | 'outside';
/**
 * Gravity or strategy to use when fit is cover or contain
 * @example
 * ```
 * center
 * ```
 */
export type ImageResizePositionEnum =
  | 'top'
  | 'right top'
  | 'right'
  | 'right bottom'
  | 'bottom'
  | 'left bottom'
  | 'left'
  | 'left top'
  | 'north'
  | 'northeast'
  | 'east'
  | 'southeast'
  | 'south'
  | 'southwest'
  | 'west'
  | 'northwest'
  | 'centre'
  | 'entropy'
  | 'attention';
/**
 * Parameters for resizing images on-the-fly during file retrieval
 */
export type ImageResizeParams = {
  /**
   * Resize to width if file is an image
   * @example
   * ```
   * 600
   * ```
   */
  width?: number;
  /**
   * Resize to height if file is an image
   * @example
   * ```
   * 400
   * ```
   */
  height?: number;
  /**
   * How the image should be resized to fit provided dimensions
   * @example
   * ```
   * cover
   * ```
   */
  fit?: ImageResizeFitEnum;
  /**
   * Position or gravity to use when fit is cover or contain
   * @example
   * ```
   * center
   * ```
   */
  position?: ImageResizePositionEnum | number;
  /**
   * Hex background color to use when fit is contain
   * @example
   * ```
   * #FFFFFF
   * ```
   */
  background?: string;
  /**
   * Do not enlarge if the width or height are already less than provided dimensions
   * @example
   * ```
   * true
   * ```
   */
  withoutEnlargement?: boolean;
};
/**
 * Format to transform image to if file is an image
 * @example
 * ```
 * webp
 * ```
 */
export type ImageFormatEnum = 'jpeg' | 'png' | 'webp' | 'tiff' | 'raw';
/**
 * Byte range with start and end positions
 */
export type Range = {
  /**
   * Start byte position of a range
   */
  start: number;
  /**
   * End byte position of a range
   * @example
   * ```
   * 499
   * ```
   */
  end: number;
};
/**
 * Parameters for reading/downloading a file with optional image processing
 */
export type ReadFileEndpointParams = {
  /**
   * File path, with each folder name separated by a forward slash. The first item must be the workspace rootname, and must include the file extension. e.g /workspace-rootname/my-folder/my-file.txt.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string;
  /**
   * File ID
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
  /**
   * Parameters for resizing images on-the-fly during file retrieval
   */
  imageResize?: ImageResizeParams;
  /**
   * Format to transform image to if file is an image
   * @example
   * ```
   * webp
   * ```
   */
  imageFormat?: ImageFormatEnum;
  /**
   * Whether the server should add "Content-Disposition: attachment" header which forces browsers to download files like HTML, JPEG, etc. which it'll otherwise open in the browser
   */
  download?: boolean;
  /**
   * Array of byte ranges to request. For single range, array has one element. For multipart ranges, array has multiple elements.
   */
  ranges?: Array<Range>;
  /**
   * Raw Range header value extracted from HTTP request (for parsing after file size is known)
   * @example
   * ```
   * bytes=0-499
   * ```
   */
  rangeHeader?: string;
  /**
   * Raw If-Range header value extracted from HTTP request
   * @example
   * ```
   * "etag-value"
   * ```
   */
  ifRangeHeader?: string;
};
/**
 * Parameters for refreshing an agent token to get a new JWT
 */
export type RefreshAgentTokenEndpointParams = {
  /**
   * JWT refresh token string used to obtain new access tokens
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  refreshToken: string;
};
/**
 * Response containing refreshed JWT token details
 */
export type RefreshAgentTokenEndpointResult = {
  /**
   * JWT token string used for authentication
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  jwtToken: string;
  /**
   * JWT refresh token string used to obtain new access tokens
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  refreshToken?: string;
  /**
   * JWT token expiration date. Not the expiration date of the token itself.
   */
  jwtTokenExpiresAt?: number;
};
/**
 * Parameters for removing a collaborator from a workspace.
 */
export type RevokeCollaboratorEndpointParams = {
  /**
   * ID of the workspace to remove the collaborator from. If not provided, the user's default workspace is used.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * ID of the collaborator to remove from the workspace.
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  collaboratorId: string;
};
/**
 * Input for resolving entity permissions. Used to check what permissions an entity has on specific resources.
 */
export type ResolveEntityPermissionItemInput = {
  /**
   * Specific resource ID(s) to check permissions for
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  targetId?: string | Array<string>;
  /**
   * File path(s) to check permissions for
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string | Array<string>;
  /**
   * Folder path(s) to check permissions for
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string | Array<string>;
  /**
   * Workspace root name to check permissions for
   * @example
   * ```
   * fimidara-rootname
   * ```
   */
  workspaceRootname?: string;
  /**
   * Entity ID(s) to check permissions for (user, permission group, or agent token)
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  entityId: string | Array<string>;
  /**
   * Permission action(s) to check (e.g., readFile, uploadFile, deleteFolder)
   * @example
   * ```
   * uploadFile
   * ```
   */
  action: FimidaraPermissionAction | Array<FimidaraPermissionAction>;
};
/**
 * Parameters for resolving entity permissions within a workspace.
 */
export type ResolveEntityPermissionsEndpointParams = {
  /**
   * Workspace ID. If not provided, will be inferred from authentication context.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * List of permission resolution requests to process.
   */
  items: Array<ResolveEntityPermissionItemInput>;
};
/**
 * Represents the resolved target of a permission item, indicating what resource the permission applies to.
 */
export type ResolvedEntityPermissionItemTarget = {
  /**
   * The specific resource ID if the permission applies to a particular resource
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  targetId?: string;
  /**
   * The file path if the permission applies to a specific file
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string;
  /**
   * The folder path if the permission applies to a specific folder
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string;
  /**
   * The workspace root name if the permission applies to the entire workspace
   * @example
   * ```
   * fimidara-rootname
   * ```
   */
  workspaceRootname?: string;
};
/**
 * A resolved permission item showing whether an entity has access to perform a specific action on a target resource.
 */
export type ResolvedEntityPermissionItem = {
  /**
   * The target resource this permission applies to
   */
  target: ResolvedEntityPermissionItemTarget;
  /**
   * The entity ID this permission resolution is for
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  entityId: string;
  /**
   * The specific action being checked
   * @example
   * ```
   * uploadFile
   * ```
   */
  action: FimidaraPermissionAction;
  /**
   * The resolved access level for this entity, action, and target combination
   * @example
   * ```
   * true
   * ```
   */
  access: boolean;
  /**
   * The entity that directly granted this permission (may be different from entityId if inherited from a group)
   * @example
   * ```
   * pmgroup_000000000000000000000
   * ```
   */
  permittingEntityId?: string;
  /**
   * The target that directly holds this permission (may be different from target if inherited from a parent)
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  permittingTargetId?: string;
};
/**
 * Response containing resolved permission items.
 */
export type ResolveEntityPermissionsEndpointResult = {
  /**
   * List of resolved permission items with access decisions.
   */
  items: Array<ResolvedEntityPermissionItem>;
};
/**
 * Parameters for revoking a collaboration request you have sent. This cancels the invitation before it can be accepted.
 */
export type RevokeCollaborationRequestEndpointParams = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  requestId: string;
};
/**
 * Response returned after successfully revoking a collaboration request, showing the updated request status.
 */
export type RevokeCollaborationRequestEndpointResult = {
  /**
   * A collaboration request as seen by the workspace owner. Contains details about who was invited and the current status of the invitation.
   */
  request: CollaborationRequestForWorkspace;
};
/**
 * Parameters needed to send a collaboration request to invite someone to your workspace.
 */
export type SendCollaborationRequestEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Email address of the user you want to collaborate with. This user will receive the collaboration request and can accept or decline it.
   * @example
   * ```
   * babar@fimidara.com
   * ```
   */
  recipientEmail: string;
  /**
   * Personal message to include with the collaboration request. Use this to explain why you want to collaborate or provide context about the workspace.
   * @example
   * ```
   * Hi! I would love to collaborate with you on this project. Your expertise in data analysis would be very valuable.
   * ```
   */
  message: string;
  /**
   * Expiration date as UTC timestamp in milliseconds
   * @example
   * ```
   * 1704067200000
   * ```
   */
  expires?: number;
};
/**
 * Response returned after successfully sending a collaboration request. Contains the created request details.
 */
export type SendCollaborationRequestEndpointResult = {
  /**
   * A collaboration request as seen by the workspace owner. Contains details about who was invited and the current status of the invitation.
   */
  request: CollaborationRequestForWorkspace;
};
/**
 * Parameters for starting a multipart upload session
 */
export type StartMultipartUploadEndpointParams = {
  /**
   * File path, with each folder name separated by a forward slash. The first item must be the workspace rootname, and must include the file extension. e.g /workspace-rootname/my-folder/my-file.txt.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string;
  /**
   * File ID
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
  /**
   * Client generated unique identifier for the multipart upload
   * @example
   * ```
   * upload-123e4567-e89b-12d3-a456-426614174000
   * ```
   */
  clientMultipartId: string;
};
/**
 * Response containing the file resource created for the multipart upload
 */
export type StartMultipartUploadEndpointResult = {
  /**
   * File resource with metadata and location information
   */
  file: File;
};
/**
 * Parameters for removing permission group assignments from entities
 */
export type UnassignPermissionGroupsEndpointParams = {
  /**
   * Workspace ID where the unassignment will take place. If not provided, uses the workspace from the agent token
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Entity ID or array of entity IDs (users, collaborators, or agent tokens) to remove permission groups from
   * @example
   * ```
   * user000_000000000000000000000
   * ```
   */
  entityId: string | Array<string>;
  /**
   * Permission group ID or array of permission group IDs to unassign
   * @example
   * ```
   * pmgroup_000000000000000000000
   * ```
   */
  permissionGroupId: string | Array<string>;
};
/**
 * Input data for creating a new agent token
 */
export type NewAgentTokenInput = {
  /**
   * Resource name
   * @example
   * ```
   * My resource name
   * ```
   */
  name?: string;
  /**
   * Resource description
   * @example
   * ```
   * This is a resource description.
   * ```
   */
  description?: string;
  /**
   * Expiration date as UTC timestamp in milliseconds
   * @example
   * ```
   * 1704067200000
   * ```
   */
  expiresAt?: number;
  /**
   * Resource ID provided by you, allowing you to use your own identifier instead of system-generated ones
   * @example
   * ```
   * my-custom-resource-id
   * ```
   */
  providedResourceId?: string;
  /**
   * Whether the token should be refreshed.
   * @example
   * ```
   * true
   * ```
   */
  shouldRefresh?: boolean;
  /**
   * The duration in milliseconds for which a generated JWT token, not the actual agent token, is valid.
   * @example
   * ```
   * 2592000000
   * ```
   */
  refreshDuration?: number;
};
/**
 * Parameters for updating an existing agent token
 */
export type UpdateAgentTokenEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  tokenId?: string;
  /**
   * Whether to perform action on the token used to authorize the API call when performing actions on tokens and a token ID or provided resource ID is not provided. Defaults to true if a call is made and a token ID is not provided
   */
  onReferenced?: boolean;
  /**
   * Input data for creating a new agent token
   */
  token: NewAgentTokenInput;
  /**
   * Resource ID provided by you, allowing you to use your own identifier instead of system-generated ones
   * @example
   * ```
   * my-custom-resource-id
   * ```
   */
  providedResourceId?: string;
  /**
   * Whether the token returned should include the token encoded in JWT format.
   */
  shouldEncode?: boolean;
};
/**
 * Response containing the updated agent token
 */
export type UpdateAgentTokenEndpointResult = {
  /**
   * Agent token with authentication details and metadata
   */
  token: AgentToken;
};
/**
 * Fields you can update in a collaboration request. You can modify the message or extend the expiration date.
 */
export type UpdateCollaborationRequestInput = {
  /**
   * Personal message to include with the collaboration request. Use this to explain why you want to collaborate or provide context about the workspace.
   * @example
   * ```
   * Hi! I would love to collaborate with you on this project. Your expertise in data analysis would be very valuable.
   * ```
   */
  message?: string;
  /**
   * Expiration date as UTC timestamp in milliseconds
   * @example
   * ```
   * 1704067200000
   * ```
   */
  expires?: number;
};
/**
 * Parameters for updating an existing collaboration request. You can modify the message or extend the expiration date.
 */
export type UpdateCollaborationRequestEndpointParams = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  requestId: string;
  /**
   * Fields you can update in a collaboration request. You can modify the message or extend the expiration date.
   */
  request: UpdateCollaborationRequestInput;
};
/**
 * Response returned after successfully updating a collaboration request with the updated details.
 */
export type UpdateCollaborationRequestEndpointResult = {
  /**
   * A collaboration request as seen by the workspace owner. Contains details about who was invited and the current status of the invitation.
   */
  request: CollaborationRequestForWorkspace;
};
/**
 * Input data for updating file details like description and MIME type
 */
export type UpdateFileDetailsInput = {
  /**
   * Resource description
   * @example
   * ```
   * This is a resource description.
   * ```
   */
  description?: string;
  /**
   * File MIME type
   * @example
   * ```
   * image/jpeg
   * ```
   */
  mimetype?: string;
};
/**
 * Parameters for updating file details
 */
export type UpdateFileDetailsEndpointParams = {
  /**
   * Input data for updating file details like description and MIME type
   */
  file: UpdateFileDetailsInput;
  /**
   * File path, with each folder name separated by a forward slash. The first item must be the workspace rootname, and must include the file extension. e.g /workspace-rootname/my-folder/my-file.txt.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string;
  /**
   * File ID
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
};
/**
 * Response containing the updated file details
 */
export type UpdateFileDetailsEndpointResult = {
  /**
   * File resource with metadata and location information
   */
  file: File;
};
/**
 * Input data for updating folder properties
 */
export type UpdateFolderInput = {
  /**
   * Resource description
   * @example
   * ```
   * This is a resource description.
   * ```
   */
  description?: string;
};
/**
 * Parameters for updating an existing folder
 */
export type UpdateFolderEndpointParams = {
  /**
   * Folder path, with each folder name separated by a forward slash. The first item must be the workspace rootname. e.g /workspace-rootname/my-folder/my-sub-folder.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-sub-folder
   * ```
   */
  folderpath?: string;
  /**
   * Folder ID
   * @example
   * ```
   * folder0_000000000000000000000
   * ```
   */
  folderId?: string;
  /**
   * Input data for updating folder properties
   */
  folder: UpdateFolderInput;
};
/**
 * Response containing the updated folder information
 */
export type UpdateFolderEndpointResult = {
  /**
   * Represents a folder in the workspace with its metadata and hierarchy information
   */
  folder: Folder;
};
/**
 * Fields to update on the permission group
 */
export type UpdatePermissionGroupInput = {
  /**
   * New name for the permission group
   * @example
   * ```
   * Senior Editors
   * ```
   */
  name?: string;
  /**
   * New description for the permission group
   * @example
   * ```
   * Senior users who can edit and manage content
   * ```
   */
  description?: string;
};
/**
 * Parameters for updating an existing permission group
 */
export type UpdatePermissionGroupEndpointParams = {
  /**
   * Permission group ID. Either provide the permission group ID, or provide the workspace ID and permission group name
   * @example
   * ```
   * pmgroup_000000000000000000000
   * ```
   */
  permissionGroupId?: string;
  /**
   * Permission group name. Either provide the permission group ID, or provide the workspace ID and permission group name
   * @example
   * ```
   * Editors
   * ```
   */
  name?: string;
  /**
   * Workspace ID. When not provided, will default to using workspace ID from agent token. Either provide the permission group ID, or provide the workspace ID and permission group name
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Fields to update on the permission group
   */
  data: UpdatePermissionGroupInput;
};
/**
 * Response containing the updated permission group
 */
export type UpdatePermissionGroupEndpointResult = {
  /**
   * A permission group that can be assigned to entities to grant access to workspace resources
   */
  permissionGroup: PermissionGroup;
};
/**
 * Workspace fields to update
 */
export type UpdateWorkspaceInput = {
  /**
   * Workspace name, case insensitive
   * @example
   * ```
   * fimidara
   * ```
   */
  name?: string;
  /**
   * Workspace description
   * @example
   * ```
   * fimidara, a super awesome company that offers file management with access control for devs
   * ```
   */
  description?: string;
};
/**
 * Parameters for updating workspace information
 */
export type UpdateWorkspaceEndpointParams = {
  /**
   * Workspace ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
  /**
   * Workspace fields to update
   */
  workspace: UpdateWorkspaceInput;
};
/**
 * Response containing the updated workspace
 */
export type UpdateWorkspaceEndpointResult = {
  /**
   * A workspace containing files, folders, and access control settings
   */
  workspace: Workspace;
};
/**
 * Complete parameters for file upload including metadata and binary data
 */
export type UploadFileEndpointParams = {
  /**
   * File path, with each folder name separated by a forward slash. The first item must be the workspace rootname, and must include the file extension. e.g /workspace-rootname/my-folder/my-file.txt.
   * @example
   * ```
   * /workspace-rootname/my-folder/my-file.txt
   * ```
   */
  filepath?: string;
  /**
   * File ID
   * @example
   * ```
   * file000_000000000000000000000
   * ```
   */
  fileId?: string;
  /**
   * File binary
   */
  data: string | Readable | Blob | Buffer;
  /**
   * Resource description
   * @example
   * ```
   * This is a resource description.
   * ```
   */
  description?: string;
  /**
   * File size in bytes
   * @example
   * ```
   * 1024000
   * ```
   */
  size: number;
  /**
   * File encoding
   * @example
   * ```
   * utf8
   * ```
   */
  encoding?: string;
  /**
   * File MIME type
   * @example
   * ```
   * image/jpeg
   * ```
   */
  mimetype?: string;
  /**
   * Client generated unique identifier for multipart uploads. It is used to identify the same multipart upload across multiple requests
   * @example
   * ```
   * upload-123e4567-e89b-12d3-a456-426614174000
   * ```
   */
  clientMultipartId?: string;
  /**
   * Part number of the multipart upload. -1 can be used to signify the end of a multipart upload.
   * @example
   * ```
   * 1
   * ```
   */
  part?: number;
};
/**
 * Response containing the uploaded file information
 */
export type UploadFileEndpointResult = {
  /**
   * File resource with metadata and location information
   */
  file: File;
};
