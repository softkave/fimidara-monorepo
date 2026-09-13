"use client";

import ItemList from "@/components/utils/list/ItemList";
import ThumbnailContent from "@/components/utils/page/ThumbnailContent";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { getResourceId } from "@/lib/utils/resource";
import { AgentToken } from "fimidara";
import { noop } from "lodash-es";
import Link from "next/link";
import { FC, ReactNode, useCallback } from "react";
import AgentTokenMenu from "./AgentTokenMenu";

export interface AgentTokenListProps {
  workspaceId: string;
  tokens: AgentToken[];
  renderItem?: (item: AgentToken) => ReactNode;
}

const AgentTokenList: FC<AgentTokenListProps> = (props) => {
  const { workspaceId, tokens, renderItem } = props;

  // TODO: add a way to differentiate between the provided ID
  // and the resource ID

  const internalRenderItem = useCallback(
    (item: AgentToken) => (
      <ThumbnailContent
        key={item.resourceId}
        main={
          <div className="flex flex-col justify-center">
            <Link
              href={kAppWorkspacePaths.agentToken(workspaceId, item.resourceId)}
            >
              {item.name || item.resourceId}
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
            <AgentTokenMenu key="menu" token={item} onCompleteDelete={noop} />
          </div>
        }
      />
    ),
    [workspaceId]
  );

  return (
    <ItemList
      bordered
      items={tokens}
      renderItem={renderItem || internalRenderItem}
      getId={getResourceId}
      emptyMessage="No agent tokens yet"
      space="md"
    />
  );
};

export default AgentTokenList;
