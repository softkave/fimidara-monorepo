"use client";

import { fimidxConsoleLogger } from "@/lib/common/logger/fimidx-console-logger.ts";
import { fetchWorkspaceFoldersIntoStoreByIds } from "@/lib/hooks/fetchHookUtils";
import { useWorkspaceFoldersStore } from "@/lib/hooks/resourceListStores";
import { useHandleServerRecommendedActions } from "@/lib/hooks/useHandleServerRecommendedActions";
import { toAppErrorList } from "@/lib/utils/errors";
import { useEffect, useMemo, useState } from "react";

export type NamepathBreadcrumbParentEntry = {
  resourceId: string;
  namepath?: string[];
};

export interface UseNamepathParentsHookParams {
  workspaceId: string;
  idPath: string[];
  resourceKind: "file" | "folder";
  /** Current file or folder ID; omit or empty when only rendering the workspace
   * root crumb. */
  resourceId: string;
  namepath: string[];
}

export function useNamepathParentsHook(params: UseNamepathParentsHookParams) {
  const { workspaceId, idPath, resourceKind, resourceId, namepath } = params;
  const { handleServerRecommendedActions } =
    useHandleServerRecommendedActions();

  const folderSegmentCount =
    resourceKind === "file"
      ? Math.max(0, namepath.length - 1)
      : namepath.length;

  const neededIds = useMemo(() => {
    const ids = [...idPath];
    if (resourceKind === "folder" && namepath.length > 0 && resourceId) {
      ids.push(resourceId);
    }
    return ids;
  }, [idPath, resourceKind, namepath.length, resourceId]);

  const items = useWorkspaceFoldersStore((s) => s.items);

  const missingFetchKey = useMemo(
    () =>
      neededIds
        .filter((id) => id && !items[id])
        .slice()
        .sort()
        .join("\0"),
    [neededIds, items]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    ReturnType<typeof toAppErrorList> | undefined
  >();

  useEffect(() => {
    if (!workspaceId || !missingFetchKey) {
      setLoading(false);
      return;
    }

    const idsToFetch = neededIds.filter(
      (id) => id && !useWorkspaceFoldersStore.getState().get(id)
    );
    if (idsToFetch.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);

    (async () => {
      try {
        await fetchWorkspaceFoldersIntoStoreByIds(workspaceId, idsToFetch);
        if (!cancelled) {
          setLoading(false);
        }
      } catch (e: unknown) {
        fimidxConsoleLogger.error(e);
        if (!cancelled) {
          setError(toAppErrorList(e));
          setLoading(false);
          handleServerRecommendedActions(e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, missingFetchKey, neededIds, handleServerRecommendedActions]);

  const parentsByNamepathKey = useMemo(() => {
    const m = new Map<string, NamepathBreadcrumbParentEntry>();
    for (let i = 0; i < folderSegmentCount; i++) {
      const key = namepath.slice(0, i + 1).join("/");
      const fid =
        resourceKind === "folder" && i === folderSegmentCount - 1
          ? resourceId
          : idPath[i];
      if (!fid) {
        continue;
      }
      const folder = items[fid];
      m.set(key, {
        resourceId: fid,
        namepath: folder?.namepath,
      });
    }
    return m;
  }, [folderSegmentCount, idPath, items, namepath, resourceId, resourceKind]);

  return { parentsByNamepathKey, loading, error };
}
