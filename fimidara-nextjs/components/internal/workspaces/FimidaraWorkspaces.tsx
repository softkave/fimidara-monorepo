"use client";

import ItemList from "@/components/utils/list/ItemList";
import ListHeader from "@/components/utils/list/ListHeader";
import PageError from "@/components/utils/page/PageError";
import PageLoading from "@/components/utils/page/PageLoading";
import PaginatedContent from "@/components/utils/page/PaginatedContent";
import ThumbnailContent from "@/components/utils/page/ThumbnailContent";
import { useFetchArbitraryFetchState } from "@/lib/hooks/fetchHookUtils";
import { useInternalWorkspacesFetchHook } from "@/lib/hooks/fetchHooks";
import { formatDateTime } from "@/lib/utils/dateFns";
import { getBaseError } from "@/lib/utils/errors";
import React from "react";

const FimidaraWorkspaces: React.FC<{}> = (props) => {
  const { fetchState } = useInternalWorkspacesFetchHook(undefined);
  const { error, isLoading, data } = useFetchArbitraryFetchState(fetchState);
  let content: React.ReactNode = null;

  if (error) {
    content = (
      <PageError message={getBaseError(error) || "Error fetching workspaces"} />
    );
  } else if (isLoading) {
    content = <PageLoading message="Loading workspaces..." />;
  } else if (data) {
    content = (
      <ItemList
        items={data.workspaceList}
        space="md"
        renderItem={(item) => {
          return (
            <ThumbnailContent
              key={item.resourceId}
              main={
                <div className="flex flex-col justify-center">
                  <span className="break-words">{item.name}</span>
                  <span className="text-secondary">
                    Created {formatDateTime(item.createdAt)}
                  </span>
                </div>
              }
            />
          );
        }}
        getId={(item) => item.resourceId}
        emptyMessage={"No workspaces"}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ListHeader label="fimidara Workspaces" />
      <PaginatedContent content={content} />
    </div>
  );
};

export default FimidaraWorkspaces;
