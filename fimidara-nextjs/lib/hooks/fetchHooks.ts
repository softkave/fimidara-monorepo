"use client";

import {
  AgentToken,
  CollaborationRequestForWorkspace,
  Collaborator,
  File,
  Folder,
  GetEntityAssignedPermissionGroupsParams,
  GetUsageCostsEndpointResult,
  GetWorkspaceAgentTokensEndpointParams,
  GetWorkspaceCollaborationRequestsEndpointParams,
  GetWorkspaceCollaboratorsEndpointParams,
  GetWorkspacePermissionGroupsEndpointParams,
  GetWorkspaceSummedUsageEndpointParams,
  ListFolderContentEndpointParams,
  PermissionGroup,
  ResolveEntityPermissionsEndpointParams,
  ResolveEntityPermissionsEndpointResult,
  UsageRecord,
  Workspace,
} from "fimidara";
import {
  CollaborationRequestForUser,
  GetUserCollaborationRequestsEndpointParams,
  GetUserWorkspacesEndpointParams,
  GetUsersEndpointResult,
  GetWaitlistedUsersEndpointResult,
  GetWorkspacesEndpointResult,
} from "fimidara-private-js-sdk";
import { isEqual, omit } from "lodash-es";
import {
  getPrivateFimidaraEndpointsUsingUserToken,
  getPublicFimidaraEndpointsUsingUserToken,
} from "../api/fimidaraEndpoints";
import { IPaginationQuery } from "../api/types";
import { AnyFn, Omit1 } from "../utils/types";
import { makeFetchResourceStoreHook } from "./fetchHooks/makeFetchResourceStoreHook.ts";
import {
  FetchPaginatedResourceListData,
  FetchPaginatedResourceListReturnedData,
  FetchResourceListData,
  FetchResourceListReturnedData,
  GetFetchPaginatedResourceListFetchFnOther,
  GetFetchResourceListFetchFnOther,
  fetchHookDefaultSetFn,
  makeFetchPaginatedResourceListFetchFn,
  makeFetchPaginatedResourceListGetFn,
  makeFetchPaginatedResourceListSetFn,
  makeFetchResourceHook,
  makeFetchResourceListFetchFn,
  makeFetchResourceListGetFn,
  paginatedResourceListShouldFetchFn,
  subscribeAndRemoveIdOnDeleteResources,
} from "./fetchHookUtils";
import { ResourceZustandStore } from "./makeResourceListStore";
import {
  getCollaboratorStoreKey,
  useUserCollaborationRequestsStore,
  useWorkspaceAgentTokensStore,
  useWorkspaceCollaborationRequestsStore,
  useWorkspaceCollaboratorsStore,
  useWorkspaceFilesStore,
  useWorkspaceFoldersStore,
  useWorkspacePermissionGroupsStore,
  useWorkspaceUsageRecordsStore,
  useWorkspacesStore,
} from "./resourceListStores";

async function userWorkspacesInputFetchFn(
  params: GetUserWorkspacesEndpointParams
): Promise<FetchPaginatedResourceListReturnedData<Workspace>> {
  const endpoints = await getPrivateFimidaraEndpointsUsingUserToken();
  const data = await endpoints.workspaces.getUserWorkspaces(params);
  const count = await endpoints.workspaces.countUserWorkspaces();
  return { count: count.count, resourceList: data.workspaces };
}

async function userCollaborationRequestsInputFetchFn(
  params: GetUserCollaborationRequestsEndpointParams
): Promise<
  FetchPaginatedResourceListReturnedData<CollaborationRequestForUser>
> {
  const endpoints = await getPrivateFimidaraEndpointsUsingUserToken();
  const data = await endpoints.collaborationRequests.getUserRequests(params);
  const count = await endpoints.collaborationRequests.countUserRequests();
  return { count: count.count, resourceList: data.requests };
}

async function workspaceCollaborationRequestsInputFetchFn(
  params: GetWorkspaceCollaborationRequestsEndpointParams
): Promise<
  FetchPaginatedResourceListReturnedData<CollaborationRequestForWorkspace>
> {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data = await endpoints.collaborationRequests.getWorkspaceRequests(
    params
  );
  const count = await endpoints.collaborationRequests.countWorkspaceRequests(
    omitPagination(params)
  );
  return { count: count.count, resourceList: data.requests };
}

async function workspaceCollaboratorsInputFetchFn(
  params: GetWorkspaceCollaboratorsEndpointParams
): Promise<FetchPaginatedResourceListReturnedData<Collaborator>> {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data = await endpoints.collaborators.getWorkspaceCollaborators(params);
  const count = await endpoints.collaborators.countWorkspaceCollaborators(
    omitPagination(params)
  );
  return { count: count.count, resourceList: data.collaborators };
}

async function workspaceAgentTokensInputFetchFn(
  params: GetWorkspaceAgentTokensEndpointParams
): Promise<FetchPaginatedResourceListReturnedData<AgentToken>> {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data = await endpoints.agentTokens.getWorkspaceTokens(params);
  const count = await endpoints.agentTokens.countWorkspaceTokens(
    omitPagination(params)
  );
  return { count: count.count, resourceList: data.tokens };
}

async function workspaceFoldersInputFetchFn(
  params: Omit<ListFolderContentEndpointParams, "contentType">
): Promise<FetchPaginatedResourceListReturnedData<Folder>> {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data = await endpoints.folders.listFolderContent({
    ...params,
    contentType: "folder",
  });
  const count = await endpoints.folders.countFolderContent({
    contentType: "folder",
    folderpath: params.folderpath,
    folderId: params.folderId,
  });
  return { count: count.foldersCount, resourceList: data.folders };
}

async function workspaceFilesInputFetchFn(
  params: Omit<ListFolderContentEndpointParams, "contentType">
): Promise<FetchPaginatedResourceListReturnedData<File>> {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data = await endpoints.folders.listFolderContent({
    ...params,
    contentType: "file",
  });
  const count = await endpoints.folders.countFolderContent({
    contentType: "file",
    folderpath: params.folderpath,
    folderId: params.folderId,
  });
  return { count: count.filesCount, resourceList: data.files };
}

async function workspacePermissionGroupsInputFetchFn(
  params: GetWorkspacePermissionGroupsEndpointParams
): Promise<FetchPaginatedResourceListReturnedData<PermissionGroup>> {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data = await endpoints.permissionGroups.getWorkspacePermissionGroups(
    params
  );
  const count = await endpoints.permissionGroups.countWorkspacePermissionGroups(
    omitPagination(params)
  );
  return { count: count.count, resourceList: data.permissionGroups };
}

// async function workspaceBackendConfigsInputFetchFn(
//   params: GetFileBackendConfigsEndpointParams
// ): Promise<FetchPaginatedResourceListReturnedData<FileBackendConfig>> {
//   const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
//   const data = await endpoints.fileBackends.getConfigs(params);
//   const count = await endpoints.permissionGroups.countWorkspacePermissionGroups(
//     omitPagination(params)
//   );
//   return { count: count.count, resourceList: data.configs };
// }

async function workspaceUsageRecordsInputFetchFn(
  params: GetWorkspaceSummedUsageEndpointParams
): Promise<FetchPaginatedResourceListReturnedData<UsageRecord>> {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data = await endpoints.usageRecords.getWorkspaceSummedUsage(params);
  const count = await endpoints.usageRecords.countWorkspaceSummedUsage(
    omitPagination(params)
  );
  return { count: count.count, resourceList: data.records };
}

async function entityAssignedPermissionGroupsInputFetchFn(
  params: GetEntityAssignedPermissionGroupsParams
) {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data =
    await endpoints.permissionGroups.getEntityAssignedPermissionGroups(params);
  const { immediateAssignedPermissionGroupsMeta, permissionGroups } = data;
  return {
    resourceList: permissionGroups,
    other: { immediateAssignedPermissionGroupsMeta },
  };
}

async function usageCostsInputFetchFn() {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data = await endpoints.usageRecords.getUsageCosts();
  return data;
}

async function resolveEntityPermissionInputFetchFn(
  params: ResolveEntityPermissionsEndpointParams
) {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const data = await endpoints.permissionItems.resolveEntityPermissions(params);
  return data;
}

async function getWaitlistedUsersInputFetchFn() {
  const endpoints = await getPrivateFimidaraEndpointsUsingUserToken();
  const data = await endpoints.internal.getWaitlistedUsers();
  return data;
}

async function getUsersInputFetchFn() {
  const endpoints = await getPrivateFimidaraEndpointsUsingUserToken();
  const data = await endpoints.internal.getUsers();
  return data;
}

async function getWorkspacesInputFetchFn() {
  const endpoints = await getPrivateFimidaraEndpointsUsingUserToken();
  const data = await endpoints.internal.getWorkspaces();
  return data;
}

function makePaginatedFetchHookAndStore<
  TResource extends { resourceId: string },
  Fn extends AnyFn<
    any,
    Promise<FetchPaginatedResourceListReturnedData<TResource>>
  >
>(
  storeName: string,
  useResourceListStore: ResourceZustandStore<TResource>,
  inputFetchFn: Fn,
  comparisonFn: AnyFn<[Parameters<Fn>[0], Parameters<Fn>[0]], boolean>,
  getIdFromResource?: (item: TResource) => string
) {
  const getFn =
    makeFetchPaginatedResourceListGetFn<TResource>(useResourceListStore);
  const useFetchStore = makeFetchResourceStoreHook<
    FetchPaginatedResourceListData,
    FetchPaginatedResourceListReturnedData<
      TResource,
      GetFetchPaginatedResourceListFetchFnOther<Fn>
    >,
    Parameters<Fn>[0]
  >(storeName, getFn, comparisonFn);

  const fetchFn = makeFetchPaginatedResourceListFetchFn(
    inputFetchFn,
    useResourceListStore,
    getIdFromResource
  );
  subscribeAndRemoveIdOnDeleteResources(useResourceListStore, useFetchStore);
  const setFn = makeFetchPaginatedResourceListSetFn();
  const useFetchHook = makeFetchResourceHook(
    fetchFn,
    useFetchStore,
    setFn,
    paginatedResourceListShouldFetchFn
  );

  return { useFetchStore, useFetchHook };
}

function makeNonPaginatedFetchHookAndStore<
  TResource extends { resourceId: string },
  Fn extends AnyFn<any, Promise<FetchResourceListReturnedData<TResource>>>
>(
  storeName: string,
  useResourceListStore: ResourceZustandStore<TResource>,
  inputFetchFn: Fn,
  comparisonFn: AnyFn<[Parameters<Fn>[0], Parameters<Fn>[0]], boolean>
) {
  const getFn = makeFetchResourceListGetFn<TResource>(useResourceListStore);
  const useFetchStore = makeFetchResourceStoreHook<
    FetchResourceListData,
    FetchResourceListReturnedData<
      TResource,
      GetFetchResourceListFetchFnOther<Fn>
    >,
    Parameters<Fn>[0]
  >(storeName, getFn, comparisonFn);
  const fetchFn = makeFetchResourceListFetchFn(
    inputFetchFn,
    useResourceListStore
  );
  subscribeAndRemoveIdOnDeleteResources(useResourceListStore, useFetchStore);
  const useFetchHook = makeFetchResourceHook(fetchFn, useFetchStore);

  return { useFetchStore, useFetchHook };
}

export const {
  useFetchStore: useUserWorkspacesFetchStore,
  useFetchHook: useUserWorkspacesFetchHook,
} = makePaginatedFetchHookAndStore(
  "workspacesFetch",
  useWorkspacesStore,
  userWorkspacesInputFetchFn,
  checkIsEqualOmittingPageAndPageSize
);

export const {
  useFetchStore: useUserCollaborationRequestsFetchStore,
  useFetchHook: useUserCollaborationRequestsFetchHook,
} = makePaginatedFetchHookAndStore(
  "userRequestsFetch",
  useUserCollaborationRequestsStore,
  userCollaborationRequestsInputFetchFn,
  checkIsEqualOmittingPageAndPageSize
);

export const {
  useFetchStore: useWorkspaceCollaborationRequestsFetchStore,
  useFetchHook: useWorkspaceCollaborationRequestsFetchHook,
} = makePaginatedFetchHookAndStore(
  "workspaceRequestsFetch",
  useWorkspaceCollaborationRequestsStore,
  workspaceCollaborationRequestsInputFetchFn,
  checkIsEqualOmittingPageAndPageSize
);

export const {
  useFetchStore: useWorkspaceCollaboratorsFetchStore,
  useFetchHook: useWorkspaceCollaboratorsFetchHook,
} = makePaginatedFetchHookAndStore(
  "collaboratorsFetch",
  useWorkspaceCollaboratorsStore,
  workspaceCollaboratorsInputFetchFn,
  checkIsEqualOmittingPageAndPageSize,
  getCollaboratorStoreKey
);

export const {
  useFetchStore: useWorkspaceAgentTokensFetchStore,
  useFetchHook: useWorkspaceAgentTokensFetchHook,
} = makePaginatedFetchHookAndStore(
  "agentTokensFetch",
  useWorkspaceAgentTokensStore,
  workspaceAgentTokensInputFetchFn,
  checkIsEqualOmittingPageAndPageSize
);

export const {
  useFetchStore: useWorkspaceFoldersFetchStore,
  useFetchHook: useWorkspaceFoldersFetchHook,
} = makePaginatedFetchHookAndStore(
  "foldersFetch",
  useWorkspaceFoldersStore,
  workspaceFoldersInputFetchFn,
  checkIsEqualOmittingPageAndPageSize
);

export const {
  useFetchStore: useWorkspaceFilesFetchStore,
  useFetchHook: useWorkspaceFilesFetchHook,
} = makePaginatedFetchHookAndStore(
  "filesFetch",
  useWorkspaceFilesStore,
  workspaceFilesInputFetchFn,
  checkIsEqualOmittingPageAndPageSize
);

export const {
  useFetchStore: useWorkspacePermissionGroupsFetchStore,
  useFetchHook: useWorkspacePermissionGroupsFetchHook,
} = makePaginatedFetchHookAndStore(
  "permissionGroupsFetch",
  useWorkspacePermissionGroupsStore,
  workspacePermissionGroupsInputFetchFn,
  checkIsEqualOmittingPageAndPageSize
);

// export const {
//   useFetchStore: useWorkspaceBackendConfigsFetchStore,
//   useFetchHook: useWorkspaceBackendConfigsFetchHook,
// } = makePaginatedFetchHookAndStore(
//   "backendConfigsFetch",
//   useWorkspaceBackendConfigsStore,
//   workspaceBackendConfigsInputFetchFn,
//   checkIsEqualOmittingPageAndPageSize
// );

export const {
  useFetchStore: useWorkspaceUsageRecordsFetchStore,
  useFetchHook: useWorkspaceUsageRecordsFetchHook,
} = makePaginatedFetchHookAndStore(
  "usageRecordsFetch",
  useWorkspaceUsageRecordsStore,
  workspaceUsageRecordsInputFetchFn,
  checkIsEqualOmittingPageAndPageSize
);

export const {
  useFetchStore: useEntityAssignedPermissionGroupsFetchStore,
  useFetchHook: useEntityAssignedPermissionGroupsFetchHook,
} = makeNonPaginatedFetchHookAndStore(
  "entityAssignedPermissionGroupsFetch",
  useWorkspacePermissionGroupsStore,
  entityAssignedPermissionGroupsInputFetchFn,
  isEqual
);

export const useUsageCostsFetchStore = makeFetchResourceStoreHook<
  GetUsageCostsEndpointResult,
  GetUsageCostsEndpointResult | undefined,
  undefined
>("usageCostsFetch", (params, state) => state.data);

export const useUsageCostsFetchHook = makeFetchResourceHook(
  usageCostsInputFetchFn,
  useUsageCostsFetchStore,
  fetchHookDefaultSetFn
);

export const useResolveEntityPermissionsFetchStore = makeFetchResourceStoreHook<
  ResolveEntityPermissionsEndpointResult,
  ResolveEntityPermissionsEndpointResult | undefined,
  ResolveEntityPermissionsEndpointParams
>("resolveEntityPermissionsFetch", (params, state) => state.data, isEqual);

export const useResolveEntityPermissionsFetchHook = makeFetchResourceHook(
  resolveEntityPermissionInputFetchFn,
  useResolveEntityPermissionsFetchStore,
  fetchHookDefaultSetFn
);

export const useWaitlistedUsersFetchStore = makeFetchResourceStoreHook<
  GetWaitlistedUsersEndpointResult,
  GetWaitlistedUsersEndpointResult | undefined,
  undefined
>("waitlistedUsers", (params, state) => state.data, isEqual);

export const useWaitlistedUsersFetchHook = makeFetchResourceHook(
  getWaitlistedUsersInputFetchFn,
  useWaitlistedUsersFetchStore,
  fetchHookDefaultSetFn
);

export const useInternalUsersFetchStore = makeFetchResourceStoreHook<
  GetUsersEndpointResult,
  GetUsersEndpointResult | undefined,
  undefined
>("internalUsers", (params, state) => state.data, isEqual);

export const useInternalUsersFetchHook = makeFetchResourceHook(
  getUsersInputFetchFn,
  useInternalUsersFetchStore,
  fetchHookDefaultSetFn
);

export const useInternalWorkspacesFetchStore = makeFetchResourceStoreHook<
  GetWorkspacesEndpointResult,
  GetWorkspacesEndpointResult | undefined,
  undefined
>("internalWorkspaces", (params, state) => state.data, isEqual);

export const useInternalWorkspacesFetchHook = makeFetchResourceHook(
  getWorkspacesInputFetchFn,
  useInternalWorkspacesFetchStore,
  fetchHookDefaultSetFn
);

function checkIsEqualOmittingPageAndPageSize(
  p0: IPaginationQuery,
  p1: IPaginationQuery
) {
  const omitKeys: Array<keyof IPaginationQuery> = ["page", "pageSize"];
  return isEqual(omit(p0, omitKeys), omit(p1, omitKeys));
}

function omitPagination<T extends IPaginationQuery>(
  p0: T
): Omit1<T, "page" | "pageSize"> {
  const omitKeys: Array<keyof IPaginationQuery> = ["page", "pageSize"];
  return omit(p0, omitKeys);
}

export function clearFetchResourceListStores() {
  useUserWorkspacesFetchStore.getState().clear();
  useUserCollaborationRequestsFetchStore.getState().clear();
  useWorkspaceCollaborationRequestsFetchStore.getState().clear();
  useWorkspaceCollaboratorsStore.getState().clear();
  useWorkspaceAgentTokensFetchStore.getState().clear();
  useWorkspaceFoldersFetchStore.getState().clear();
  useWorkspaceFilesFetchStore.getState().clear();
  useWorkspacePermissionGroupsFetchStore.getState().clear();
  useWorkspaceUsageRecordsFetchStore.getState().clear();
  useUsageCostsFetchStore.getState().clear();
}
