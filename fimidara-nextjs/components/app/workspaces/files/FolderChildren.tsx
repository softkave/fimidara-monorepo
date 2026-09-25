import { useFileForm } from "@/components/hooks/useFileForm.tsx";
import { useFolderForm } from "@/components/hooks/useFolderForm.tsx";
import PageContent02 from "@/components/utils/page/PageContent02.tsx";
import PaginatedContent from "@/components/utils/page/PaginatedContent.tsx";
import { StyleableComponentProps } from "@/components/utils/styling/types";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import {
  useWorkspaceFilesFetchHook,
  useWorkspaceFoldersFetchHook,
} from "@/lib/hooks/fetchHooks.ts";
import { useFetchPaginatedResourceListFetchState } from "@/lib/hooks/fetchHookUtils.tsx";
import usePagination from "@/lib/hooks/usePagination.ts";
import {
  fimidaraAddRootnameToPath,
  Folder,
  stringifyFimidaraFolderpath,
} from "fimidara";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import AppFileList from "./AppFileList.tsx";
import FileListContainerHeader from "./FileListContainerHeader";
import FolderList from "./FolderList.tsx";
import NamepathBreadcrumb from "./NamepathBreadcrumb";

export interface FolderChildrenProps extends StyleableComponentProps {
  folder?: Folder;
  workspaceId: string;
  workspaceRootname: string;
}

const useFolders = (workspaceRootname: string, folder?: Folder) => {
  const pagination = usePagination();
  const { fetchState } = useWorkspaceFoldersFetchHook({
    page: pagination.page,
    pageSize: pagination?.pageSize,
    folderId: folder?.resourceId,
    folderpath: folder
      ? fimidaraAddRootnameToPath(folder.namepath, workspaceRootname).join("/")
      : workspaceRootname,
  });

  return { pagination, ...useFetchPaginatedResourceListFetchState(fetchState) };
};

const useFiles = (workspaceRootname: string, folder?: Folder) => {
  const pagination = usePagination();
  const filesHook = useWorkspaceFilesFetchHook({
    page: pagination.page,
    pageSize: pagination?.pageSize,
    folderId: folder?.resourceId,
    folderpath: folder
      ? fimidaraAddRootnameToPath(folder.namepath, workspaceRootname).join("/")
      : workspaceRootname,
  });

  return {
    pagination,
    ...useFetchPaginatedResourceListFetchState(filesHook.fetchState),
  };
};

function FolderChildren(props: FolderChildrenProps) {
  const { folder, workspaceRootname, workspaceId, style, className } = props;
  const router = useRouter();

  const folderpath = useMemo(
    () => (folder ? stringifyFimidaraFolderpath(folder) : undefined),
    [folder]
  );

  const fileFormHook = useFileForm({
    workspaceId,
    workspaceRootname,
    folderpath,
  });
  const folderFormHook = useFolderForm({
    workspaceId,
    workspaceRootname,
    folderpath,
  });

  const foldersHook = useFolders(workspaceRootname, folder);
  const filesHook = useFiles(workspaceRootname, folder);

  return (
    <div style={style} className={className}>
      <FileListContainerHeader
        workspaceId={workspaceId}
        folder={folder}
        workspaceRootname={workspaceRootname}
        className="mb-4"
        onBeginCreateFile={() => fileFormHook.setFormOpen(true)}
        onBeginCreateFolder={() => folderFormHook.setFormOpen(true)}
        onScheduleDeleteSuccess={() => {
          router.push(kAppWorkspacePaths.folder(workspaceId, folder?.parentId));
        }}
      />
      <div className="space-y-4">
        <NamepathBreadcrumb
          workspaceId={workspaceId}
          workspaceRootname={workspaceRootname}
          namepath={folder?.namepath}
          idPath={folder?.idPath}
          resourceId={folder?.resourceId ?? ""}
          resourceKind="folder"
        />
        <PaginatedContent
          content={
            <PageContent02
              error={foldersHook.error}
              isLoading={foldersHook.isLoading}
              isDataFetched={foldersHook.isDataFetched}
              data={foldersHook.resourceList}
              defaultErrorMessage="Error fetching folders"
              defaultLoadingMessage="Loading folders..."
              render={(data) =>
                data.length ? (
                  <FolderList
                    folders={data}
                    workspaceRootname={workspaceRootname}
                  />
                ) : null
              }
            />
          }
          pagination={{ ...foldersHook.pagination, count: foldersHook.count }}
        />
        <PaginatedContent
          content={
            <PageContent02
              error={filesHook.error}
              isLoading={filesHook.isLoading}
              isDataFetched={filesHook.isDataFetched}
              data={filesHook.resourceList}
              defaultErrorMessage="Error fetching files"
              defaultLoadingMessage="Loading files..."
              render={(data) => (
                <AppFileList
                  files={data}
                  workspaceRootname={workspaceRootname}
                />
              )}
            />
          }
          pagination={{ ...filesHook.pagination, count: filesHook.count }}
        />
      </div>
      {fileFormHook.node}
      {folderFormHook.node}
    </div>
  );
}

export default FolderChildren;
