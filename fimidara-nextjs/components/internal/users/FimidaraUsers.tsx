"use client";

import { Badge } from "@/components/ui/badge.tsx";
import ItemList from "@/components/utils/list/ItemList";
import ListHeader from "@/components/utils/list/ListHeader";
import PageError from "@/components/utils/page/PageError";
import PageLoading from "@/components/utils/page/PageLoading";
import PaginatedContent from "@/components/utils/page/PaginatedContent";
import ThumbnailContent from "@/components/utils/page/ThumbnailContent";
import { useFetchArbitraryFetchState } from "@/lib/hooks/fetchHookUtils";
import { useInternalUsersFetchHook } from "@/lib/hooks/fetchHooks";
import { getBaseError } from "@/lib/utils/errors";
import React from "react";

const FimidaraUsers: React.FC<{}> = (props) => {
  const { fetchState } = useInternalUsersFetchHook(undefined);
  const { error, isLoading, data } = useFetchArbitraryFetchState(fetchState);
  let content: React.ReactNode = null;

  if (error) {
    content = (
      <PageError message={getBaseError(error) || "Error fetching users"} />
    );
  } else if (isLoading) {
    content = <PageLoading message="Loading users..." />;
  } else if (data) {
    content = (
      <ItemList
        items={data.users}
        space="md"
        renderItem={(item) => {
          return (
            <ThumbnailContent
              key={item.resourceId}
              main={
                <div className="flex flex-col justify-center break-words">
                  <span>
                    {item.firstName} {item.lastName}
                  </span>
                  <span className="text-secondary break-words">{item.email}</span>
                  <div>
                    <Badge>
                      {item.isEmailVerified
                        ? "Email verified"
                        : "Not email verified"}
                    </Badge>
                  </div>
                </div>
              }
            />
          );
        }}
        getId={(item) => item.resourceId}
        emptyMessage={"No users"}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ListHeader label="fimidara Users" />
      <PaginatedContent content={content} />
    </div>
  );
};

export default FimidaraUsers;
