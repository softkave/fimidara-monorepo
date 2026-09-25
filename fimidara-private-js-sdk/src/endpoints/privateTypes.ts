// This file is auto-generated, do not modify directly.
// Reach out to a code owner to suggest changes.

/**
 * Parameters for creating a new workspace
 */
export type AddWorkspaceEndpointParams = {
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
 * Workspace bill status
 * @example
 * ```
 * ok
 * ```
 */
export type WorkspaceBillStatus = 'ok' | 'gracePeriod' | 'billOverdue';
/**
 * Usage record category
 * @example
 * ```
 * storage
 * ```
 */
export type UsageRecordCategory =
  'total' | 'storage' | 'storageEver' | 'bin' | 'bout';
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
 * Response containing the newly created workspace
 */
export type AddWorkspaceEndpointResult = {
  /**
   * A workspace containing files, folders, and access control settings
   */
  workspace: Workspace;
};
/**
 * Parameters for changing password when current password is known
 */
export type ChangePasswordWithCurrentPasswordEndpointParams = {
  /**
   * Current password
   * @example
   * ```
   * myCurrentPassword123
   * ```
   */
  currentPassword: string;
  /**
   * New password
   * @example
   * ```
   * myNewSecurePassword456
   * ```
   */
  password: string;
};
export type PublicWorkspaceResource = {
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
};
/**
 * User account information with profile details and associated workspaces
 */
export type User = {
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
  /**
   * First name
   * @example
   * ```
   * Jesus
   * ```
   */
  firstName: string;
  /**
   * Last name
   * @example
   * ```
   * Christ
   * ```
   */
  lastName: string;
  /**
   * Email address, case insensitive
   * @example
   * ```
   * my-email-address@email-domain.com
   * ```
   */
  email: string;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  passwordLastChangedAt?: number;
  /**
   * Whether the user is required to change their password on next login
   */
  requiresPasswordChange?: boolean;
  /**
   * Whether the user has verified their email address
   * @example
   * ```
   * true
   * ```
   */
  isEmailVerified: boolean;
  /**
   * UTC timestamp in milliseconds, or null if not set
   * @example
   * ```
   * 1672531200000
   * ```
   */
  emailVerifiedAt?: number | null;
  /**
   * UTC timestamp in milliseconds, or null if not set
   * @example
   * ```
   * 1672531200000
   * ```
   */
  emailVerificationEmailSentAt?: number | null;
  /**
   * List of workspaces the user has access to
   */
  workspaces: Array<PublicWorkspaceResource>;
  /**
   * Whether the user is on the waitlist for the service
   */
  isOnWaitlist: boolean;
};
/**
 * Successful login response containing user data and authentication tokens
 */
export type LoginResult = {
  /**
   * User account information with profile details and associated workspaces
   */
  user: User;
  /**
   * JWT token string used for authentication
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  jwtToken: string;
  /**
   * JWT token string used for authentication
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  clientJwtToken: string;
  /**
   * JWT refresh token string used to obtain new access tokens
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  refreshToken: string;
  /**
   * JWT token expiration date. Not the expiration date of the token itself.
   */
  jwtTokenExpiresAt: number;
};
/**
 * Parameters for changing password using a reset token (from forgot password flow)
 */
export type ChangePasswordWithTokenEndpointParams = {
  /**
   * New password
   * @example
   * ```
   * myNewSecurePassword456
   * ```
   */
  password: string;
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
 * Parameters for deleting a workspace. If workspaceId is not provided, deletes the current user's default workspace
 */
export type DeleteWorkspaceEndpointParams = {
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
 * Email address to send password reset instructions to
 */
export type ForgotPasswordEndpointParams = {
  /**
   * Email address, case insensitive
   * @example
   * ```
   * my-email-address@email-domain.com
   * ```
   */
  email: string;
};
/**
 * Parameters for getting collaborators without a specific permission.
 */
export type GetCollaboratorsWithoutPermissionEndpointParams = {
  /**
   * ID of the workspace to check collaborators in. If not provided, the user's default workspace is used.
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  workspaceId?: string;
};
/**
 * A list of IDs of collaborators who do not have a specific permission.
 */
export type GetCollaboratorsWithoutPermissionEndpointResult = {
  /**
   * List of IDs of collaborators who do not have the permission.
   * @example
   * ```json
   * [
   *   "user000_000000000000000000000",
   *   "user000_000000000000000000000"
   * ]
   * ```
   */
  collaboratorIds: Array<string>;
};
/**
 * Parameters for retrieving details of a specific collaboration request you have received.
 */
export type GetUserCollaborationRequestEndpointParams = {
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
 * Current status of the collaboration request. Shows whether the request is pending, accepted, declined, or revoked.
 * @example
 * ```
 * accepted
 * ```
 */
export type CollaborationRequestStatusType =
  'accepted' | 'declined' | 'revoked' | 'pending';
/**
 * A collaboration request as seen by the recipient user. Contains all the information needed to understand and respond to the collaboration invitation.
 */
export type CollaborationRequestForUser = {
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
 * Details of a specific collaboration request you have received, including the message and workspace information.
 */
export type GetUserCollaborationRequestEndpointResult = {
  /**
   * A collaboration request as seen by the recipient user. Contains all the information needed to understand and respond to the collaboration invitation.
   */
  request: CollaborationRequestForUser;
};
/**
 * Parameters for retrieving collaboration requests you have received from other workspace owners.
 */
export type GetUserCollaborationRequestsEndpointParams = {
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
 * Paginated list of collaboration requests you have received, which you can accept or decline.
 */
export type GetUserCollaborationRequestsEndpointResult = {
  /**
   * [Array] A collaboration request as seen by the recipient user. Contains all the information needed to understand and respond to the collaboration invitation.
   */
  requests: Array<CollaborationRequestForUser>;
  /**
   * Page number, starting from 0
   */
  page: number;
};
/**
 * Parameters for retrieving user's workspaces with pagination
 */
export type GetUserWorkspacesEndpointParams = {
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
 * Paginated response containing user's workspaces
 */
export type GetUserWorkspacesEndpointResult = {
  /**
   * Page number, starting from 0
   */
  page: number;
  /**
   * List of workspaces accessible to the user
   */
  workspaces: Array<Workspace>;
};
/**
 * Parameters for retrieving all users. This endpoint requires no additional parameters.
 */
export type GetUsersEndpointParams = {};
/**
 * Response containing the list of all users in the system.
 */
export type GetUsersEndpointResult = {
  /**
   * Array of all users in the system, including both active and waitlisted users.
   */
  users: Array<User>;
};
/**
 * Parameters for retrieving waitlisted users. This endpoint requires no additional parameters.
 */
export type GetWaitlistedUsersEndpointParams = {};
/**
 * Response containing the list of users currently on the waitlist.
 */
export type GetWaitlistedUsersEndpointResult = {
  /**
   * Array of users who are currently waitlisted and pending approval.
   */
  users: Array<User>;
};
/**
 * Parameters for retrieving all workspaces. This endpoint requires no additional parameters.
 */
export type GetWorkspacesEndpointParams = {};
/**
 * Response containing the list of all workspaces in the system.
 */
export type GetWorkspacesEndpointResult = {
  /**
   * Array of all workspaces available in the system.
   */
  workspaceList: Array<Workspace>;
};
/**
 * Credentials required for user authentication
 */
export type LoginParams = {
  /**
   * Email address, case insensitive
   * @example
   * ```
   * my-email-address@email-domain.com
   * ```
   */
  email: string;
  /**
   * Current password
   * @example
   * ```
   * myCurrentPassword123
   * ```
   */
  password: string;
};
/**
 * SDK parameters for OAuth login including inter-server authentication
 */
export type LoginWithOAuthEndpointParams = {
  /**
   * Resource ID provided by you, allowing you to use your own identifier instead of system-generated ones
   * @example
   * ```
   * my-custom-resource-id
   * ```
   */
  oauthUserId: string;
  /**
   * JWT token string used for authentication
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  interServerAuthSecret: string;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  emailVerifiedAt?: number;
  /**
   * Resource name
   * @example
   * ```
   * My resource name
   * ```
   */
  name: string;
  /**
   * Email address, case insensitive
   * @example
   * ```
   * my-email-address@email-domain.com
   * ```
   */
  email: string;
};
/**
 * Refresh token to generate new access tokens
 */
export type RefreshUserTokenEndpointParams = {
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
 * Your response to a collaboration request. Use "accepted" to join the workspace or "declined" to reject the invitation.
 * @example
 * ```
 * accepted
 * ```
 */
export type CollaborationRequestResponseType = 'accepted' | 'declined';
/**
 * Parameters for responding to a collaboration request you have received. Choose to accept and join the workspace or decline the invitation.
 */
export type RespondToCollaborationRequestEndpointParams = {
  /**
   * Resource ID
   * @example
   * ```
   * wrkspce_000000000000000000000
   * ```
   */
  requestId: string;
  /**
   * Your response to a collaboration request. Use "accepted" to join the workspace or "declined" to reject the invitation.
   * @example
   * ```
   * accepted
   * ```
   */
  response: CollaborationRequestResponseType;
};
/**
 * Response returned after successfully responding to a collaboration request, showing the updated request status.
 */
export type RespondToCollaborationRequestEndpointResult = {
  /**
   * A collaboration request as seen by the recipient user. Contains all the information needed to understand and respond to the collaboration invitation.
   */
  request: CollaborationRequestForUser;
};
/**
 * Parameters required to create a new user account
 */
export type SignupEndpointParams = {
  /**
   * First name
   * @example
   * ```
   * Jesus
   * ```
   */
  firstName: string;
  /**
   * Last name
   * @example
   * ```
   * Christ
   * ```
   */
  lastName: string;
  /**
   * Email address, case insensitive
   * @example
   * ```
   * my-email-address@email-domain.com
   * ```
   */
  email: string;
  /**
   * Password for authentication
   * @example
   * ```
   * mySecurePassword123!
   * ```
   */
  password: string;
};
/**
 * SDK parameters for OAuth signup including inter-server authentication
 */
export type SignupWithOAuthEndpointParams = {
  /**
   * Resource name
   * @example
   * ```
   * My resource name
   * ```
   */
  name: string;
  /**
   * Email address, case insensitive
   * @example
   * ```
   * my-email-address@email-domain.com
   * ```
   */
  email: string;
  /**
   * UTC timestamp in milliseconds
   * @example
   * ```
   * 1672531200000
   * ```
   */
  emailVerifiedAt?: number;
  /**
   * Resource ID provided by you, allowing you to use your own identifier instead of system-generated ones
   * @example
   * ```
   * my-custom-resource-id
   * ```
   */
  oauthUserId: string;
  /**
   * JWT token string used for authentication
   * @example
   * ```
   * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  interServerAuthSecret: string;
};
/**
 * User profile fields that can be updated. All fields are optional.
 */
export type UpdateUserEndpointParams = {
  /**
   * First name
   * @example
   * ```
   * Jesus
   * ```
   */
  firstName?: string;
  /**
   * Last name
   * @example
   * ```
   * Christ
   * ```
   */
  lastName?: string;
  /**
   * Email address, case insensitive
   * @example
   * ```
   * my-email-address@email-domain.com
   * ```
   */
  email?: string;
};
/**
 * Response containing the updated user information
 */
export type UpdateUserEndpointResult = {
  /**
   * User account information with profile details and associated workspaces
   */
  user: User;
};
/**
 * Parameters for upgrading waitlisted users to active status.
 */
export type UpgradeWaitlistedUsersEndpointParams = {
  /**
   * Array of user IDs to upgrade from waitlisted to active status.
   * @example
   * ```json
   * [
   *   "wrkspce_000000000000000000000"
   * ]
   * ```
   */
  userIds: Array<string>;
};
/**
 * Empty success response for operations that complete without returning data
 */
export type EmptyEndpointResult = {};
/**
 * Email address to check for existing user account
 */
export type UserExistsEndpointParams = {
  /**
   * Email address, case insensitive
   * @example
   * ```
   * my-email-address@email-domain.com
   * ```
   */
  email: string;
};
/**
 * Response indicating whether a user account exists for the given email
 */
export type UserExistsEndpointResult = {
  /**
   * True if a user account exists with the provided email address
   * @example
   * ```
   * true
   * ```
   */
  exists: boolean;
};
