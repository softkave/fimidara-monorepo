"use client";

import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { errorMessageNotificatition } from "@/components/utils/errorHandling";
import ItemList from "@/components/utils/list/ItemList";
import ListHeader from "@/components/utils/list/ListHeader";
import PageError from "@/components/utils/page/PageError";
import PageLoading from "@/components/utils/page/PageLoading";
import PaginatedContent from "@/components/utils/page/PaginatedContent";
import ThumbnailContent from "@/components/utils/page/ThumbnailContent";
import { useToast } from "@/hooks/use-toast.ts";
import { useFetchArbitraryFetchState } from "@/lib/hooks/fetchHookUtils";
import { useWaitlistedUsersFetchHook } from "@/lib/hooks/fetchHooks";
import { useWaitlistedUsersUpgradeMutationHook } from "@/lib/hooks/mutationHooks";
import { useSelectList } from "@/lib/hooks/useSelectList";
import { getBaseError } from "@/lib/utils/errors";
import React from "react";

// TODO: add bulk remove, and add bulk actions to other lists

const WaitlistedUsers: React.FC<{}> = (props) => {
  const { toast } = useToast();
  const { fetchState, clearFetchState } =
    useWaitlistedUsersFetchHook(undefined);
  const { error, isLoading, data } = useFetchArbitraryFetchState(fetchState);
  const selectedHook = useSelectList();
  const upgradeHook = useWaitlistedUsersUpgradeMutationHook({
    onSuccess(data, params) {
      toast({ title: "Waitlisted users upgraded" });
      clearFetchState();
      selectedHook.clear();
    },
    onError(e, params) {
      errorMessageNotificatition(e, "Error deleting upgrading users", toast);
    },
  });
  const hasSelected = selectedHook.hasSelected();

  let content: React.ReactNode = null;

  if (error) {
    content = (
      <PageError
        message={getBaseError(error) || "Error fetching waitlisted users"}
      />
    );
  } else if (isLoading) {
    content = <PageLoading message="Loading waitlisted users..." />;
  } else if (data) {
    content = (
      <ItemList
        items={data.users}
        space="md"
        renderItem={(item) => {
          return (
            <ThumbnailContent
              withCheckbox
              key={item.resourceId}
              selected={selectedHook.selected[item.resourceId]}
              onSelect={(checked) => selectedHook.set(item.resourceId, checked)}
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
        emptyMessage={"No waitlisted users"}
      />
    );
  }

  const controlsNode = (
    <Button
      type="button"
      loading={upgradeHook.loading}
      disabled={!hasSelected}
      onClick={() =>
        upgradeHook.run({
          userIds: selectedHook.getList(),
        })
      }
    >
      Upgrade users
    </Button>
  );

  return (
    <div className="space-y-4">
      <ListHeader label="Waitlisted Users" secondaryControls={controlsNode} />
      <PaginatedContent content={content} />
    </div>
  );
};

export default WaitlistedUsers;
