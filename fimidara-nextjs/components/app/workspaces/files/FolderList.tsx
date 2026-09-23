"use client";

import ItemList from "@/components/utils/list/ItemList";
import AppIcon from "@/components/utils/page/AppIcon";
import ThumbnailContent from "@/components/utils/page/ThumbnailContent";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { Folder } from "fimidara";
import { noop } from "lodash-es";
import { FolderIcon } from "lucide-react";
import Link from "next/link";
import { FC, ReactNode, useCallback } from "react";
import FolderMenu from "./FolderMenu";

export interface FolderListProps {
  folders: Folder[];
  workspaceRootname: string;
  renderFolderItem?: (item: Folder, workspaceRootname: string) => ReactNode;
}

const FolderList: FC<FolderListProps> = (props) => {
  const { folders, workspaceRootname, renderFolderItem } = props;
  const internalRenderItem = useCallback(
    (item: Folder) => {
      if (renderFolderItem) {
        return renderFolderItem(item, workspaceRootname);
      }

      return (
        <ThumbnailContent
          key={item.resourceId}
          main={
            <div className="flex flex-col justify-center break-words">
              <Link
                href={kAppWorkspacePaths.folder(
                  item.workspaceId,
                  item.resourceId
                )}
              >
                {item.name}
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
              <FolderMenu
                folder={item}
                workspaceRootname={workspaceRootname}
                onScheduleDeleteSuccess={noop}
              />
            </div>
          }
          prefixNode={
            <div className="flex flex-col justify-center">
              <AppIcon
                icon={<FolderIcon className="w-4 h-4" />}
                className="items-start"
                style={{ marginTop: "1px" }}
              />
            </div>
          }
        />
      );
    },
    [renderFolderItem, workspaceRootname]
  );

  return (
    <ItemList
      bordered
      items={folders}
      renderItem={internalRenderItem}
      getId={(item: Folder) => item.resourceId}
      emptyMessage="No folders yet"
      space="sm"
    />
  );
};

export default FolderList;
