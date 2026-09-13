"use client";

import ItemList from "@/components/utils/list/ItemList";
import ThumbnailContent from "@/components/utils/page/ThumbnailContent";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { Collaborator } from "fimidara";
import { noop } from "lodash-es";
import Link from "next/link";
import { FC, ReactNode, useCallback } from "react";
import CollaboratorMenu from "./CollaboratorMenu";

export interface CollaboratorListProps {
  workspaceId: string;
  collaborators: Collaborator[];
  renderItem?: (item: Collaborator) => ReactNode;
}

const CollaboratorList: FC<CollaboratorListProps> = (props) => {
  const { workspaceId, collaborators, renderItem } = props;

  const internalRenderItem = useCallback(
    (item: Collaborator) => (
      <ThumbnailContent
        key={item.resourceId}
        main={
          <div className="flex flex-col justify-center break-words">
            <Link
              href={kAppWorkspacePaths.collaborator(
                workspaceId,
                item.resourceId
              )}
            >
              {item.firstName + " " + item.lastName}
            </Link>
            {item.email && (
              <span className="text-secondary break-words">{item.email}</span>
            )}
          </div>
        }
        menu={
          <div className="flex flex-col justify-center h-full">
            <CollaboratorMenu
              collaborator={item}
              workspaceId={workspaceId}
              onCompleteRemove={noop}
            />
          </div>
        }
      />
    ),
    [workspaceId]
  );

  return (
    <ItemList
      bordered
      items={collaborators}
      renderItem={renderItem || internalRenderItem}
      getId={(item: Collaborator) => item.resourceId}
      emptyMessage="No collaborators yet"
      space="md"
    />
  );
};

export default CollaboratorList;
