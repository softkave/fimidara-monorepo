"use client";

import type { Result } from "ahooks/lib/useRequest/src/types";
import {
  IMultipartUploadBrowserParams,
  multipartUploadBrowser,
} from "fimidara/multipart/multipartBrowser";
import { isEqual, uniq } from "lodash-es";
import React from "react";
import { OmitFrom } from "softkave-js-utils";
import {
  getPrivateFimidaraEndpoints,
  getPrivateFimidaraEndpointsUsingUserToken,
  getPublicFimidaraEndpointsUsingUserToken,
} from "../api/fimidaraEndpoints";
import { AnyFn } from "../utils/types";
import {
  useResolveEntityPermissionsFetchStore,
  useUserWorkspacesFetchStore,
  useWorkspaceAgentTokensFetchStore,
  useWorkspaceCollaborationRequestsFetchStore,
  useWorkspaceFilesFetchStore,
  useWorkspaceFoldersFetchStore,
  useWorkspacePermissionGroupsFetchStore,
} from "./fetchHooks";
import { FetchResourceZustandStore } from "./fetchHooks/makeFetchResourceStoreHook.ts";
import { ResourceZustandStore } from "./makeResourceListStore";
import { makeEndpointMutationHook } from "./mutationHooks/makeEndpointMutationHook.ts";
import { makeUpdateLocalLoginResultFn } from "./mutationHooks/updateLocalLoginResult.ts";
import {
  getCollaboratorStoreKey,
  getFileByPath,
  getFolderByPath,
  useUsersStore,
  useWorkspaceAgentTokensStore,
  useWorkspaceCollaborationRequestsStore,
  useWorkspaceCollaboratorsStore,
  useWorkspaceFilesStore,
  useWorkspaceFoldersStore,
  useWorkspacePermissionGroupsStore,
  useWorkspacesStore,
} from "./resourceListStores";

export const useUserSignupMutationHook = makeEndpointMutationHook(
  getPrivateFimidaraEndpoints,
  (endpoints) => endpoints.users.signup,
  makeUpdateLocalLoginResultFn({ persistJwtToken: true })
);

export const useUserForgotPasswordMutationHook = makeEndpointMutationHook(
  getPrivateFimidaraEndpoints,
  (endpoints) => endpoints.users.forgotPassword
);
export const useUserChangePasswordWithTokenMutationHook =
  makeEndpointMutationHook(
    getPrivateFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.users.changePasswordWithToken,
    makeUpdateLocalLoginResultFn({ persistJwtToken: true })
  );

export const useUserChangePasswordWithCurrentPasswordMutationHook =
  makeEndpointMutationHook(
    getPrivateFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.users.changePasswordWithCurrentPassword,
    makeUpdateLocalLoginResultFn({ persistJwtToken: true })
  );

export const useUserSendEmailVerificationCodeMutationHook =
  makeEndpointMutationHook(
    getPrivateFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.users.sendEmailVerificationCode
  );

export const useUserConfirmEmailMutationHook = makeEndpointMutationHook(
  getPrivateFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.users.confirmEmailAddress,
  makeUpdateLocalLoginResultFn({ persistJwtToken: true })
);

export const useUserUpdateMutationHook = makeEndpointMutationHook(
  getPrivateFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.users.updateUser,
  (data) => {
    useUsersStore.getState().set(data.user.resourceId, data.user);
  }
);

export const useUserCollaborationRequestResponseMutationHook =
  makeEndpointMutationHook(
    getPrivateFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.collaborationRequests.respondToRequest
  );

export const useWorkspaceAgentTokenAddMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.agentTokens.addToken,
  (result) =>
    insertInFetchStoreAddMutationFn(
      result.token,
      useWorkspaceAgentTokensStore,
      useWorkspaceAgentTokensFetchStore,
      workspaceIdMatch
    )
);

export const useWorkspaceAgentTokenUpdateMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.agentTokens.updateToken,
    (data) => {
      useWorkspaceAgentTokensStore
        .getState()
        .set(data.token.resourceId, data.token);
    }
  );

export const useWorkspaceAgentTokenEncodeTokenMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.agentTokens.encodeToken,
    (data, params) => {
      const body = params[0];
      let tokenId = body?.tokenId;

      if (tokenId) {
        const token = useWorkspaceAgentTokensStore.getState().get(tokenId);
        if (token) {
          useWorkspaceAgentTokensStore.getState().set(tokenId, {
            ...token,
            jwtToken: data.jwtToken,
            refreshToken: data.refreshToken,
            jwtTokenExpiresAt: data.jwtTokenExpiresAt,
          });
        }
      }
    }
  );

export const useWorkspaceAgentTokenDeleteMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.agentTokens.deleteToken,
    (data, params) => {
      const body = params[0];
      let tokenId = body?.tokenId;

      if (!tokenId && body && body.workspaceId && body.providedResourceId) {
        const token = Object.values(
          useWorkspaceAgentTokensStore.getState().items
        ).find(
          (nextToken) =>
            nextToken.workspaceId === body.workspaceId &&
            nextToken.providedResourceId === body.workspaceId
        );

        tokenId = token?.resourceId;
      }

      if (tokenId) {
        useWorkspaceAgentTokensStore.getState().remove(tokenId);
      }
    }
  );

export const useWorkspaceCollaboratorDeleteMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.collaborators.removeCollaborator,
    (data, params) => {
      const body = params[0];

      if (body?.collaboratorId && body.workspaceId) {
        const key = getCollaboratorStoreKey({
          workspaceId: body.workspaceId,
          resourceId: body.collaboratorId,
        });
        useWorkspaceCollaboratorsStore.getState().remove(key);
      }
    }
  );

export type WorkspaceFileUploadParams = OmitFrom<
  IMultipartUploadBrowserParams,
  "endpoints"
>;

/**
 * Upload a workspace file without going through ahooks `useRequest.runAsync`.
 * Parallel `runAsync` calls on one hook cancel earlier requests when they finish
 * (ahooks request count), which left uploads stuck in "uploading" after success.
 */
export async function uploadWorkspaceFile(params: WorkspaceFileUploadParams) {
  const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
  const result = await multipartUploadBrowser({
    endpoints,
    ...params,
  });
  applyWorkspaceFileUploadToStores(result, params);
  return result;
}

export const useWorkspaceFileUploadMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => {
    return async (params: WorkspaceFileUploadParams) => {
      return await multipartUploadBrowser({
        endpoints,
        ...params,
      });
    };
  },
  (result, params) => {
    applyWorkspaceFileUploadToStores(result, params[0]);
  }
);

export const useWorkspaceFileUpdateMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.files.updateFileDetails,
  (data) => {
    useWorkspaceFilesStore.getState().set(data.file.resourceId, data.file);
  }
);

export const useWorkspaceFileDeleteMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.files.deleteFile,
  (data, params) => {
    const body = params[0];
    let fileId = body?.fileId;

    if (!fileId && body?.filepath) {
      fileId = getFileByPath(
        body.filepath,
        /** includesWorkspaceRootname */ true
      )?.resourceId;
    }

    if (fileId) {
      useWorkspaceFilesStore.getState().remove(fileId);
    }
  }
);

export const useWorkspaceFolderAddMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.folders.addFolder,
  (result) =>
    insertInFetchStoreAddMutationFn(
      result.folder,
      useWorkspaceFoldersStore,
      useWorkspaceFoldersFetchStore,
      matchesFolderContentListParams
    )
);

export const useWorkspaceFolderUpdateMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.folders.updateFolder,
  (data) => {
    useWorkspaceFoldersStore
      .getState()
      .set(data.folder.resourceId, data.folder);
  }
);

export const useWorkspaceFolderDeleteMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.folders.deleteFolder,
  (data, params) => {
    const body = params[0];
    let folderId = body?.folderId;

    if (!folderId && body?.folderpath) {
      folderId = getFolderByPath(body.folderpath, true)?.resourceId;
    }

    if (folderId) {
      deleteFolderChildren(folderId);
      useWorkspaceFoldersStore.getState().remove(folderId);
    }
  }
);

export const useWorkspacePermissionGroupAddMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.permissionGroups.addPermissionGroup,
    (result) =>
      insertInFetchStoreAddMutationFn(
        result.permissionGroup,
        useWorkspacePermissionGroupsStore,
        useWorkspacePermissionGroupsFetchStore,
        workspaceIdMatch
      )
  );

export const useWorkspacePermissionGroupUpdateMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.permissionGroups.updatePermissionGroup,
    (data) => {
      useWorkspacePermissionGroupsStore
        .getState()
        .set(data.permissionGroup.resourceId, data.permissionGroup);
    }
  );

export const useWorkspacePermissionGroupDeleteMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.permissionGroups.deletePermissionGroup,
    (data, params) => {
      const body = params[0];
      let resourceId = body?.permissionGroupId;

      if (resourceId) {
        useWorkspacePermissionGroupsStore.getState().remove(resourceId);
      }
    }
  );

export const useWorkspacePermissionGroupAssignMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.permissionGroups.assignPermissionGroups
  );

export const useWorkspacePermissionGroupUnassignMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.permissionGroups.unassignPermissionGroups
  );

export const useWorkspaceCollaborationRequestUpdateMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.collaborationRequests.updateRequest,
    (data) => {
      useWorkspaceCollaborationRequestsStore
        .getState()
        .set(data.request.resourceId, data.request);
    }
  );

export const useWorkspaceCollaborationRequestRevokeMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.collaborationRequests.revokeRequest
  );

export const useWorkspaceCollaborationRequestDeleteMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.collaborationRequests.deleteRequest,
    (data, params) => {
      const body = params[0];
      let resourceId = body?.requestId;

      if (resourceId) {
        useWorkspaceCollaborationRequestsStore.getState().remove(resourceId);
      }
    }
  );

export const useWorkspaceCollaborationRequestAddMutationHook =
  makeEndpointMutationHook(
    getPublicFimidaraEndpointsUsingUserToken,
    (endpoints) => endpoints.collaborationRequests.sendRequest,
    (result) =>
      insertInFetchStoreAddMutationFn(
        result.request,
        useWorkspaceCollaborationRequestsStore,
        useWorkspaceCollaborationRequestsFetchStore,
        workspaceIdMatch
      )
  );

export const useWorkspaceAddMutationHook = makeEndpointMutationHook(
  getPrivateFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.workspaces.addWorkspace,
  (result) =>
    insertInFetchStoreAddMutationFn(
      result.workspace,
      useWorkspacesStore,
      useUserWorkspacesFetchStore,
      (resource, params) => {
        // There's only one workspace fetch store per user session
        return true;
      }
    )
);

export const useWorkspaceUpdateMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.workspaces.updateWorkspace,
  (data) => {
    useWorkspacesStore
      .getState()
      .set(data.workspace.resourceId, data.workspace);
  }
);

// export const useWorkspaceDeleteMutationHook = makeEndpointMutationHook(
//   getPublicFimidaraEndpointsUsingUserToken,
//   (endpoints) => endpoints.workspaces.deleteWorkspace,
//   (data, params) => {
//     const body = params[0]?;
//     let resourceId = body?.workspaceId;

//     if (resourceId) {
//       deleteWorkspaceChildren(resourceId);
//       useWorkspacesStore.getState().remove(resourceId);
//     }
//   }
// );

export const usePermissionsAddMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.permissionItems.addItems,
  (data, params) => {
    // Success effect is done in-component when done. Reason is, add and
    // deleteHooks are usually called together, also, permissions form close on
    // success, so we won't need to handle them here.
  }
);

export const usePermissionsDeleteMutationHook = makeEndpointMutationHook(
  getPublicFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.permissionItems.deleteItems,
  (data, params) => {
    // Success effect is done in-component when done. Reason is, add and
    // deleteHooks are usually called together, also, permissions form close on
    // success, so we won't need to handle them here.
  }
);

export const useWaitlistedUsersUpgradeMutationHook = makeEndpointMutationHook(
  getPrivateFimidaraEndpointsUsingUserToken,
  (endpoints) => endpoints.internal.upgradeWaitlistedUsers
);

export function clearOutResolvedPermissionFetchStore() {
  useResolveEntityPermissionsFetchStore.getState().clear();
}

function workspaceIdMatch<
  T0 extends { workspaceId?: string },
  T1 extends { workspaceId?: string }
>(p0: T0, p1: T1) {
  return p0.workspaceId === p1.workspaceId;
}

function applyWorkspaceFileUploadToStores(
  result: { file: { resourceId: string; parentId?: string | null; idPath?: string[]; namepath: string[] } },
  params: WorkspaceFileUploadParams
) {
  if (params.fileId) {
    useWorkspaceFilesStore
      .getState()
      .set(result.file.resourceId, result.file as any);
  } else {
    insertInFetchStoreAddMutationFn(
      result.file as any,
      useWorkspaceFilesStore,
      useWorkspaceFilesFetchStore,
      matchesFolderContentListParams
    );
    invalidateFolderContentFetchesForUploadedFile(result.file);
  }
}

function isRootParentId(parentId: string | null | undefined) {
  return parentId === null || parentId === undefined;
}

/** Match a file/folder to a listFolderContent fetch keyed by folderId and/or folderpath. */
function matchesFolderContentListParams<
  TResource extends {
    parentId?: string | null;
    namepath: string[];
    workspaceId?: string;
  },
  TParams extends { folderId?: string; folderpath?: string }
>(resource: TResource, lsParams: TParams) {
  if (lsParams.folderId) {
    return lsParams.folderId === resource.parentId;
  }

  // Root listings pass folderId: undefined and folderpath: workspaceRootname
  if (isRootParentId(resource.parentId)) {
    return !lsParams.folderId;
  }

  // List may be keyed only by folderpath — compare to the resource's parent path
  // (folderpath includes workspace rootname; resource.namepath does not).
  if (lsParams.folderpath) {
    const normalizedListPath = lsParams.folderpath.replace(/^\/+/, "");
    const pathParts = normalizedListPath.split("/").filter(Boolean);
    // pathParts[0] is workspace rootname; remaining is parent folder namepath
    const listParentNamepath = pathParts.slice(1);
    const resourceParentNamepath = resource.namepath.slice(0, -1);
    return (
      listParentNamepath.length === resourceParentNamepath.length &&
      listParentNamepath.every(
        (name, index) => name === resourceParentNamepath[index]
      )
    );
  }

  return false;
}

/**
 * After uploading a new file, refresh folder lists that should show a folder
 * created for a nested upload path. The file itself is inserted into the
 * matching files fetch via insertInFetchStoreAddMutationFn.
 */
function invalidateFolderContentFetchesForUploadedFile(file: {
  parentId?: string | null;
  idPath?: string[];
  namepath: string[];
}) {
  // Nested path e.g. NewFolder/file.txt — NewFolder should appear in grandparent.
  if (file.namepath.length <= 1) {
    return;
  }

  const grandparentId =
    file.idPath && file.idPath.length > 1
      ? file.idPath[file.idPath.length - 2]
      : null;

  const matchesParent = (params: { folderId?: string }) => {
    if (isRootParentId(grandparentId)) {
      return !params.folderId;
    }
    return params.folderId === grandparentId;
  };

  useWorkspaceFoldersFetchStore.setState((store) => ({
    states: store.states.filter(([params]) => !matchesParent(params)),
  }));
}

function insertInFetchStoreAddMutationFn<
  TResource extends { resourceId: string },
  TData extends { idList: string[] },
  TKeyParams
>(
  resource: TResource,
  useResourceListStore: ResourceZustandStore<TResource>,
  useFetchStore: FetchResourceZustandStore<TData, any, TKeyParams>,
  comparisonFn: AnyFn<[TResource, TKeyParams], boolean>
) {
  useResourceListStore.getState().set(resource.resourceId, resource);
  const fetchState = useFetchStore
    .getState()
    .findFetchState((params, state) => comparisonFn(resource, params));

  if (fetchState) {
    useFetchStore.getState().setFetchState(
      fetchState[0],
      (state) => {
        if (!state?.data) {
          return state as any;
        }

        const idList = uniq(
          [resource.resourceId].concat(state?.data?.idList ?? [])
        );
        const newState = {
          ...state,
          data: {
            ...state?.data,
            idList,
            count: idList.length,
          },
        };

        return newState;
      },
      /** initialize */ false
    );
  }
}

function deleteFolderChildren(folderId: string) {
  const folderList = Object.values(useWorkspaceFoldersStore.getState().items);
  const fileList = Object.values(useWorkspaceFilesStore.getState().items);
  const childrenFolderIdList = folderList
    .filter((nextFolder) => nextFolder.idPath.includes(folderId))
    .map((nextFolder) => nextFolder.resourceId);
  const childrenFileIdList = fileList
    .filter((nextFile) => nextFile.idPath.includes(folderId))
    .map((nextFile) => nextFile.resourceId);
  useWorkspaceFoldersStore.getState().remove(childrenFolderIdList);
  useWorkspaceFilesStore.getState().remove(childrenFileIdList);
}

export function useMergeMutationHookStates(...hooks: Array<Result<any, any>>) {
  let loading = false;
  let error: Error[] = [];
  const previousErrorsRef = React.useRef<Error[]>([]);

  hooks.forEach((hook) => {
    loading ||= hook.loading;
    if (hook.error) error.push(hook.error);
  });

  if (isEqual(previousErrorsRef.current, error)) {
    error = previousErrorsRef.current;
  } else {
    previousErrorsRef.current = error;
  }

  return { error, loading };
}
