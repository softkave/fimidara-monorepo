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
import { ReactNode, useMemo } from "react";
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
  const isInitialLoad = !foldersHook.isDataFetched && !filesHook.isDataFetched;
  const hasContent =
    foldersHook.resourceList.length || filesHook.resourceList.length;
  const hasNoContent =
    !foldersHook.resourceList.length && !filesHook.resourceList.length;

  let foldersNode: ReactNode = null;
  let filesNode: ReactNode = null;

  const renderFolders = () => (
    <PaginatedContent
      content={
        <PageContent02
          error={foldersHook.error}
          isLoading={foldersHook.isLoading}
          isDataFetched={foldersHook.isDataFetched}
          data={foldersHook.resourceList}
          defaultErrorMessage="Error fetching folders"
          defaultLoadingMessage="Loading folders..."
          render={(data) => (
            <FolderList folders={data} workspaceRootname={workspaceRootname} />
          )}
        />
      }
      pagination={{ ...foldersHook.pagination, count: foldersHook.count }}
    />
  );

  const renderFiles = () => (
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
            <AppFileList files={data} workspaceRootname={workspaceRootname} />
          )}
        />
      }
      pagination={{ ...filesHook.pagination, count: filesHook.count }}
    />
  );

  if (isInitialLoad) {
    foldersNode = renderFolders();
  } else if (hasContent) {
    if (foldersHook.resourceList.length) {
      foldersNode = renderFolders();
    }

    if (filesHook.resourceList.length) {
      filesNode = renderFiles();
    }
  } else if (hasNoContent) {
    filesNode = renderFiles();
  } else {
    foldersNode = renderFolders();
    filesNode = renderFiles();
  }

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
        {foldersNode}
        {filesNode}
      </div>
      {fileFormHook.node}
      {folderFormHook.node}
    </div>
  );
}

export default FolderChildren;
