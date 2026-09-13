"use client";

import IconButton from "@/components/utils/buttons/IconButton";
import ItemList from "@/components/utils/list/ItemList";
import ListHeader from "@/components/utils/list/ListHeader";
import PageError from "@/components/utils/page/PageError";
import PageLoading from "@/components/utils/page/PageLoading";
import PaginatedContent from "@/components/utils/page/PaginatedContent";
import ThumbnailContent from "@/components/utils/page/ThumbnailContent";
import { StyleableComponentProps } from "@/components/utils/styling/types";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { useFetchNonPaginatedResourceListFetchState } from "@/lib/hooks/fetchHookUtils";
import { useEntityAssignedPermissionGroupsFetchHook } from "@/lib/hooks/fetchHooks";
import { cn } from "@/lib/utils.ts";
import { formatDateTime } from "@/lib/utils/dateFns";
import { getBaseError } from "@/lib/utils/errors";
import { indexArray } from "@/lib/utils/indexArray";
import { PlusOutlined } from "@ant-design/icons";
import { useToggle } from "ahooks";
import { noop } from "lodash-es";
import Link from "next/link";
import { FC, Fragment, ReactNode, useMemo } from "react";
import AssignPermissionGroupsForm from "./AssignPermissionGroupsForm";
import PermissionGroupMenu from "./PermissionGroupMenu";

export interface IAssignedPermissionGroupListProps
  extends StyleableComponentProps {
  workspaceId: string;
  entityId: string;
}

// TODO: add bulk remove, and add bulk actions to other lists

const AssignedPermissionGroupList: FC<IAssignedPermissionGroupListProps> = (
  props
) => {
  const { workspaceId, entityId, className, style } = props;
  const { fetchState, clearFetchState } =
    useEntityAssignedPermissionGroupsFetchHook({
      entityId,
      workspaceId,
    });
  const { error, isLoading, resourceList, other } =
    useFetchNonPaginatedResourceListFetchState(fetchState);

  const [isAssignFormVisible, toggleHook] = useToggle();

  const permissionGroupsMap = useMemo(
    () => indexArray(resourceList, { path: "resourceId" }),
    [resourceList]
  );

  let content: ReactNode = null;

  if (error) {
    content = (
      <PageError
        message={
          getBaseError(error) || "Error fetching assigned permission groups"
        }
      />
    );
  } else if (isLoading) {
    content = <PageLoading message="Loading assigned permission groups..." />;
  } else if (other) {
    content = (
      <ItemList
        space="md"
        items={other.immediateAssignedPermissionGroupsMeta}
        renderItem={(item) => {
          const permissionGroup = permissionGroupsMap[item.permissionGroupId];

          if (!permissionGroup) {
            return null;
          }

          return (
            <ThumbnailContent
              key={item.permissionGroupId}
              main={
                <div className="flex flex-col justify-center break-words">
                  <Link
                    href={kAppWorkspacePaths.permissionGroup(
                      workspaceId,
                      item.permissionGroupId
                    )}
                  >
                    {permissionGroup.name}
                  </Link>
                  {permissionGroup.description && (
                    <span className="text-secondary break-words">
                      {permissionGroup.description}
                    </span>
                  )}
                  <span className="text-secondary">
                    Assigned {formatDateTime(item.assignedAt)}
                  </span>
                </div>
              }
              menu={
                <div className="flex flex-col justify-center h-full">
                  <PermissionGroupMenu
                    key="menu"
                    permissionGroup={permissionGroup}
                    unassignParams={{ entityId }}
                    onCompleteDelete={noop}
                    onCompleteUnassignPermissionGroup={noop}
                  />
                </div>
              }
            />
          );
        }}
        getId={(item) => item.permissionGroupId}
        emptyMessage={"No assigned permission groups yet"}
      />
    );
  }

  let assignFormNode: ReactNode = null;

  if (other && isAssignFormVisible) {
    assignFormNode = (
      <AssignPermissionGroupsForm
        workspaceId={workspaceId}
        entityId={entityId}
        permissionGroups={other.immediateAssignedPermissionGroupsMeta.map(
          (p) => p.permissionGroupId
        )}
        onClose={toggleHook.toggle}
        onCompleteSubmit={() => {
          clearFetchState();
        }}
      />
    );
  }

  return (
    <Fragment>
      <div className={cn(className, "space-y-4")} style={style}>
        <ListHeader
          label="Assigned Permission Groups"
          buttons={
            <div className="space-x-2">
              <IconButton
                icon={<PlusOutlined />}
                onClick={() => toggleHook.toggle()}
              />
            </div>
          }
        />
        <PaginatedContent content={content} />
      </div>
      {assignFormNode}
    </Fragment>
  );
};

export default AssignedPermissionGroupList;
