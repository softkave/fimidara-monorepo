"use client";

import ItemList from "@/components/utils/list/ItemList.tsx";
import ListHeader from "@/components/utils/list/ListHeader.tsx";
import PageContent02 from "@/components/utils/page/PageContent02";
import PaginatedContent from "@/components/utils/page/PaginatedContent.tsx";
import ThumbnailContent from "@/components/utils/page/ThumbnailContent.tsx";
import { kAppUserPaths } from "@/lib/definitions/paths/user.ts";
import { useFetchPaginatedResourceListFetchState } from "@/lib/hooks/fetchHookUtils";
import { useUserCollaborationRequestsFetchHook } from "@/lib/hooks/fetchHooks";
import usePagination from "@/lib/hooks/usePagination";
import { formatDateTime } from "@/lib/utils/dateFns";
import Link from "next/link";

export default function UserCollaborationRequestList() {
  const pagination = usePagination();
  const { fetchState } = useUserCollaborationRequestsFetchHook({
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
  const { count, error, isLoading, resourceList, isDataFetched } =
    useFetchPaginatedResourceListFetchState(fetchState);

  const contentNode = (
    <PageContent02
      error={error}
      isLoading={isLoading}
      isDataFetched={isDataFetched}
      data={resourceList}
      defaultErrorMessage="Error fetching collaboration requests"
      defaultLoadingMessage="Loading collaboration requests..."
      render={(data) => (
        <ItemList
          bordered
          items={data}
          renderItem={(item) => (
            <ThumbnailContent
              key={item.resourceId}
              main={
                <div className="flex flex-col justify-center break-words">
                  <Link href={`${kAppUserPaths.request(item.resourceId)}`}>
                    <span>
                      Request from <strong>{item.workspaceName}</strong>
                    </span>
                  </Link>
                  <span className="text-secondary">
                    Sent {formatDateTime(item.createdAt)}
                  </span>
                  {item.expiresAt && (
                    <span className="text-secondary">
                      Expires on {formatDateTime(item.expiresAt)}
                    </span>
                  )}
                </div>
              }
            />
          )}
          emptyMessage="You do not have any collaboration requests"
          space="md"
        />
      )}
    />
  );

  return (
    <div className="space-y-4">
      <ListHeader label="Your Collaboration Requests" />
      <PaginatedContent
        content={contentNode}
        pagination={{ ...pagination, count }}
      />
    </div>
  );
}
