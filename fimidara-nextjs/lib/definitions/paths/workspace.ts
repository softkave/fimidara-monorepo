export const kAppWorkspacePaths = {
  workspaces: "/workspaces",
  workspace: (workspaceId: string) => `/workspaces/${workspaceId}`,
  updateWorkspaceForm(workspaceId: string) {
    return `${this.workspace(workspaceId)}/update`;
  },

  // File
  fileList(workspaceId: string) {
    return `${this.workspace(workspaceId)}/files`;
  },
  file(workspaceId: string, fileId: string) {
    return `${this.fileList(workspaceId)}/${fileId}`;
  },
  fileImageTransform(workspaceId: string, fileId: string) {
    return `${this.file(workspaceId, fileId)}/image-transform`;
  },

  // Folder
  folderList(workspaceId: string) {
    return `${this.workspace(workspaceId)}/folders`;
  },
  folder(workspaceId: string, folderId?: string | null) {
    if (!folderId) {
      return `${this.workspace(workspaceId)}/folders`;
    }

    return `${this.folderList(workspaceId)}/${folderId}`;
  },

  // Collaborator
  collaboratorList(workspaceId: string) {
    return `${this.workspace(workspaceId)}/collaborators`;
  },
  collaborator(workspaceId: string, collaboratorId: string) {
    return `${this.collaboratorList(workspaceId)}/${collaboratorId}`;
  },

  // Request
  requestList(workspaceId: string) {
    return `${this.workspace(workspaceId)}/collaboration-requests`;
  },
  request(workspaceId: string, requestId: string) {
    return `${this.requestList(workspaceId)}/${requestId}`;
  },

  // Agent token
  agentTokenList(workspaceId: string) {
    return `${this.workspace(workspaceId)}/agent-tokens`;
  },
  agentToken(workspaceId: string, tokenId: string) {
    return `${this.agentTokenList(workspaceId)}/${tokenId}`;
  },

  // permission group
  permissionGroupList(workspaceId: string) {
    return `${this.workspace(workspaceId)}/permission-groups`;
  },
  permissionGroup(workspaceId: string, permissiongroupId: string) {
    return `${this.permissionGroupList(workspaceId)}/${permissiongroupId}`;
  },

  // usage records
  usage(workspaceId: string) {
    return `${this.workspace(workspaceId)}/usage`;
  },
};
