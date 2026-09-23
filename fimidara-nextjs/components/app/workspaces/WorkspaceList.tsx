"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import IconButton from "@/components/utils/buttons/IconButton";
import ItemList from "@/components/utils/list/ItemList";
import ListHeader from "@/components/utils/list/ListHeader";
import PageContent02 from "@/components/utils/page/PageContent02";
import PageNothingFound from "@/components/utils/page/PageNothingFound";
import PaginatedContent from "@/components/utils/page/PaginatedContent";
import ThumbnailContent from "@/components/utils/page/ThumbnailContent.tsx";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { useFetchPaginatedResourceListFetchState } from "@/lib/hooks/fetchHookUtils";
import { useUserWorkspacesFetchHook } from "@/lib/hooks/fetchHooks";
import usePagination from "@/lib/hooks/usePagination";
import { PlusOutlined } from "@ant-design/icons";
import { Workspace } from "fimidara";
import { User } from "fimidara-private-js-sdk";
import { isBoolean, noop } from "lodash-es";
import Link from "next/link";
import { FC, useState } from "react";
import WorkspaceAvatar from "./WorkspaceAvatar.tsx";
import WorkspaceForm from "./WorkspaceForm.tsx";
import WorkspaceMenu from "./WorkspaceMenu.tsx";

export interface IWorkspaceListProps {
  user: User;
}

const WorkspaceList: FC<IWorkspaceListProps> = (props) => {
  const { user } = props;
  const pagination = usePagination();
  const { fetchState } = useUserWorkspacesFetchHook({
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
  const { count, error, isLoading, resourceList, isDataFetched } =
    useFetchPaginatedResourceListFetchState(fetchState);
  const [formOpen, setFormOpen] = useState<Workspace | boolean>(false);

  const contentNode = (
    <PageContent02
      error={error}
      isLoading={isLoading}
      isDataFetched={isDataFetched}
      data={resourceList}
      defaultErrorMessage="Error fetching workspaces"
      defaultLoadingMessage="Loading workspaces..."
      render={(data) => (
        <ItemList
          bordered
          items={data}
          getId={(item: Workspace) => item.resourceId}
          renderItem={(item: Workspace) => (
            <ThumbnailContent
              key={item.resourceId}
              prefixNode={
                <div className="flex flex-col">
                  <WorkspaceAvatar
                    workspaceId={item.resourceId}
                    alt={`Workspace picture for ${item.name}`}
                    className="sm:w-8 sm:h-8"
                  />
                </div>
              }
              main={
                <div className="flex flex-col justify-center">
                  <Link href={kAppWorkspacePaths.folderList(item.resourceId)}>
                    <div className="break-words">{item.name}</div>
                  </Link>
                  {item.description && (
                    <span className="text-secondary break-words">
                      {item.description}
                    </span>
                  )}
                </div>
              }
              menu={
                <div className="flex flex-col justify-center h-full">
                  <WorkspaceMenu workspace={item} onCompleteDelete={noop} />
                </div>
              }
              className="py-4"
            />
          )}
          emptyMessage={
            <PageNothingFound
              message={
                user.isOnWaitlist
                  ? "You are currently on waitlist so you can't create workspaces, " +
                    "but you can be added to an existing workspace. " +
                    "Once you've been upgraded from the waitlist, we'll send an email to you confirming the upgrade."
                  : "Create a workspace to get started"
              }
            />
          }
        />
      )}
    />
  );

  const isNewWorkspaceForm = isBoolean(formOpen);
  const sNode = (
    <Sheet open={!!formOpen} onOpenChange={setFormOpen}>
      <SheetContent className="w-full max-w-[420px] p-0">
        <SheetHeader className="p-6 space-y-2">
          <SheetTitle>
            {isNewWorkspaceForm ? "New Workspace" : "Update Workspace"}
          </SheetTitle>
        </SheetHeader>
        <WorkspaceForm
          workspace={isBoolean(formOpen) ? undefined : formOpen}
          className="p-6 pt-0"
        />
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-4 sm:max-w-[500px] sm:mx-auto">
      {sNode}
      <ListHeader
        label="Workspaces"
        buttons={
          <IconButton
            icon={<PlusOutlined />}
            disabled={user.isOnWaitlist}
            onClick={() => setFormOpen(true)}
          />
        }
      />
      <PaginatedContent
        content={contentNode}
        pagination={count ? { ...pagination, count } : undefined}
      />
    </div>
  );
};

export default WorkspaceList;
