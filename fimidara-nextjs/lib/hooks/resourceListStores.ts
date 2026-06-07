"use client";

import {
  AgentToken,
  CollaborationRequestForWorkspace,
  Collaborator,
  File,
  Folder,
  PermissionGroup,
  stringifyFimidaraFilepath,
  UsageRecord,
  Workspace,
} from "fimidara";
import { CollaborationRequestForUser, User } from "fimidara-private-js-sdk";
import { makeKey } from "../utils/fns";
import { makeResourceListStore } from "./makeResourceListStore";

export const useUsersStore = makeResourceListStore<User>("users");
export const useUserCollaborationRequestsStore =
  makeResourceListStore<CollaborationRequestForUser>("userRequests");
export const useWorkspaceCollaboratorsStore =
  makeResourceListStore<Collaborator>("collaborators");
export const useWorkspaceCollaborationRequestsStore =
  makeResourceListStore<CollaborationRequestForWorkspace>("workspaceRequests");
export const useWorkspaceAgentTokensStore =
  makeResourceListStore<AgentToken>("agentTokens");
export const useWorkspaceFilesStore = makeResourceListStore<File>("files");
export const useWorkspaceFoldersStore =
  makeResourceListStore<Folder>("folders");
export const useWorkspacePermissionGroupsStore =
  makeResourceListStore<PermissionGroup>("permissionGroups");
export const useWorkspaceBackendConfigsStore =
  makeResourceListStore<PermissionGroup>("backendConfigs");
export const useWorkspaceUsageRecordsStore =
  makeResourceListStore<UsageRecord>("usageRecords");
export const useWorkspacesStore =
  makeResourceListStore<Workspace>("workspaces");

export function getFolderByPath(
  folderpath: string,
  includesWorkspaceRootname: boolean
) {
  const isFolderpathMatch = (f1: string[], f2: string[]) =>
    f1.length === f2.length &&
    f1.every((name, index) => name === f2[index]);

  folderpath = includesWorkspaceRootname
    ? folderpath.startsWith("/")
      ? folderpath.slice(1)
      : folderpath
    : folderpath.startsWith("/")
    ? folderpath
    : "/" + folderpath;
  const [workspaceRootnameOrEmpty, ...restFolderpathList] =
    folderpath.split("/");
  return Object.values(useWorkspaceFoldersStore.getState().items).find(
    (nextFolder) => isFolderpathMatch(nextFolder.namepath, restFolderpathList)
  );
}

export function getFileByPath(
  filepath: string,
  includesWorkspaceRootname: boolean
) {
  const stripPreSlash = (path: string) =>
    path.startsWith("/") ? path.slice(1) : path;
  const stripRootname = (path: string) => path.split("/").slice(1).join("/");

  filepath = stripPreSlash(filepath);
  filepath = includesWorkspaceRootname ? stripRootname(filepath) : filepath;
  return Object.values(useWorkspaceFilesStore.getState().items).find(
    (nextFile) => stringifyFimidaraFilepath(nextFile) === filepath
  );
}

const kCollaboratorKeySeparator = "/";
export function getCollaboratorStoreKey(
  collaborator: Pick<Collaborator, "resourceId" | "workspaceId">
) {
  return makeKey(
    [collaborator.workspaceId, collaborator.resourceId],
    kCollaboratorKeySeparator
  );
}
export function splitCollaboratorKey(key: string) {
  const [workspaceId, resourceId] = key.split(kCollaboratorKeySeparator);
  return { workspaceId, resourceId };
}

export function clearResourceListStores() {
  useUsersStore.getState().clear();
  useUserCollaborationRequestsStore.getState().clear();
  useWorkspaceCollaboratorsStore.getState().clear();
  useWorkspaceCollaborationRequestsStore.getState().clear();
  useWorkspaceAgentTokensStore.getState().clear();
  useWorkspaceFilesStore.getState().clear();
  useWorkspaceFoldersStore.getState().clear();
  useWorkspacePermissionGroupsStore.getState().clear();
  useWorkspaceUsageRecordsStore.getState().clear();
  useWorkspacesStore.getState().clear();
}
