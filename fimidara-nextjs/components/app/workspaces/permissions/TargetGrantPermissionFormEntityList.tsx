import { MaybeScroll } from "@/components/internal/maybe-scroll";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import PageError from "@/components/utils/page/PageError";
import PageLoading from "@/components/utils/page/PageLoading";
import {
  kActionLabel,
  kResourceTypeToChildrenTypesMap,
  kResourceTypeToPermittedActions,
} from "@/lib/definitions/system";
import { useFetchArbitraryFetchState } from "@/lib/hooks/fetchHookUtils";
import { useResolveEntityPermissionsFetchHook } from "@/lib/hooks/fetchHooks";
import { getBaseError } from "@/lib/utils/errors";
import { makeKey } from "@/lib/utils/fns";
import { indexArray } from "@/lib/utils/indexArray";
import {
  FimidaraPermissionAction,
  FimidaraResourceType,
  ResolveEntityPermissionItemInput,
  ResolveEntityPermissionsEndpointParams,
  ResolvedEntityPermissionItem,
} from "fimidara";
import { flatten, merge, set, uniq } from "lodash-es";
import React from "react";
import EntityPermissionForm from "./EntityPermissionForm";
import {
  PermissionMapItemInfo,
  ResolvedPermissionsMap,
  TargetGrantPermissionFormEntityInfo,
} from "./types";

export interface TargetGrantPermissionFormEntityListProps<
  T extends { resourceId: string }
> {
  disabled?: boolean;
  workspaceId: string;
  targetId: string;
  actionTargetType: FimidaraResourceType;
  entities: Array<T>;
  defaultUpdatedPermissions?: ResolvedPermissionsMap;
  getInfoFromItem(item: T): TargetGrantPermissionFormEntityInfo;
  onChange(
    updated: ResolvedPermissionsMap,
    original: ResolvedPermissionsMap
  ): void;
  actionType: "item" | "group" | "both";
}

const separator = "#";
export const resolvedPermissionToKey = (
  entity: Pick<ResolvedEntityPermissionItem, "entityId" | "action">
) => makeKey([entity.entityId, entity.action], separator);

/** Returns a tuple of `[entityId, action]` */
export const splitKey = (key: string) => key.split(separator);

function resolveChildrenTypes(type: FimidaraResourceType) {
  const visited = new Map<FimidaraResourceType, FimidaraResourceType>();
  const children: FimidaraResourceType[] = [];
  const visitNext: FimidaraResourceType[] = [type];

  for (let next = visitNext.shift(); next; next = visitNext.shift()) {
    const c01 = kResourceTypeToChildrenTypesMap[next];
    c01.forEach((t01) => {
      if (!visited.has(t01)) {
        visited.set(t01, t01);
        children.push(t01);
        visitNext.push(t01);
      }
    });
  }

  return children;
}

function resolveActions(
  types: FimidaraResourceType[],
  actionType: "item" | "group" | "both"
) {
  return uniq(
    flatten(
      types.map((type) => {
        const actions = kResourceTypeToPermittedActions[type];
        if (actionType === "item") {
          return actions.item;
        } else if (actionType === "group") {
          return actions.group ?? [];
        } else {
          return actions.item.concat(actions.group ?? []);
        }
      })
    )
  );
}

function TargetGrantPermissionFormEntityList<T extends { resourceId: string }>(
  props: TargetGrantPermissionFormEntityListProps<T>
) {
  const {
    disabled,
    workspaceId,
    targetId,
    actionTargetType,
    entities,
    defaultUpdatedPermissions,
    getInfoFromItem,
    onChange,
    actionType,
  } = props;

  const types = React.useMemo(
    () => resolveChildrenTypes(actionTargetType),
    [actionTargetType]
  );

  const everyAction = React.useMemo(
    () => Object.keys(kActionLabel) as FimidaraPermissionAction[],
    []
  );

  const actions = React.useMemo(() => {
    const itemActions = kResourceTypeToPermittedActions[actionTargetType];
    const childrenActions = resolveActions(types, "both");
    const compiledActions = uniq(
      (actionType === "item"
        ? itemActions.item
        : actionType === "group"
        ? itemActions.group ?? []
        : itemActions.item.concat(itemActions.group ?? [])
      ).concat(childrenActions)
    );
    return compiledActions;
  }, [actionTargetType, types, actionType]);

  const params = React.useMemo((): ResolveEntityPermissionsEndpointParams => {
    return {
      workspaceId,
      items: entities.map((entity): ResolveEntityPermissionItemInput => {
        return {
          targetId,
          entityId: entity.resourceId,
          action: actions,
        };
      }),
    };
  }, [entities, targetId, workspaceId, actions]);

  const rpHook = useResolveEntityPermissionsFetchHook(params);
  const rpState = useFetchArbitraryFetchState(rpHook.fetchState);

  const rpMap: ResolvedPermissionsMap = React.useMemo(() => {
    return indexArray(rpState.data?.items ?? [], {
      indexer: resolvedPermissionToKey,
    });
  }, [rpState.data?.items]);

  const [updatedPermissionsMap, setUpdatedPermissionsMap] =
    React.useState<ResolvedPermissionsMap>(defaultUpdatedPermissions ?? {});

  const activePermissionsMap = React.useMemo(() => {
    return merge({}, rpMap, updatedPermissionsMap);
  }, [rpMap, updatedPermissionsMap]);

  const handleChange = React.useCallback(
    (
      entity: T,
      action: FimidaraPermissionAction,
      permitted: PermissionMapItemInfo
    ) => {
      const key = resolvedPermissionToKey({
        action,
        entityId: entity.resourceId,
      });
      const updated: ResolvedPermissionsMap = {
        ...updatedPermissionsMap,
      };

      set(updated, key, permitted);
      setUpdatedPermissionsMap(updated);
      onChange(updated, rpMap);
    },
    [rpMap, updatedPermissionsMap, onChange]
  );

  let content: React.ReactNode = null;

  if (rpState.error) {
    content = (
      <PageError
        message={getBaseError(rpState.error) || "Error resolving permissions"}
      />
    );
  } else if (rpState.isLoading) {
    content = <PageLoading message="Resolving permissions..." />;
  } else if (rpState.data) {
    content = (
      <Accordion type="single" collapsible>
        {entities.map((entity) => {
          const info = getInfoFromItem(entity);
          return (
            <AccordionItem key={entity.resourceId} value={entity.resourceId}>
              <AccordionTrigger>
                <p className="text-left">{info.name}</p>
              </AccordionTrigger>
              <AccordionContent>
                <MaybeScroll className="h-full max-h-80 overflow-y-auto">
                  <EntityPermissionForm
                    actions={actions}
                    everyAction={everyAction}
                    entity={entity}
                    disabled={disabled}
                    permissionsMap={activePermissionsMap}
                    onChange={handleChange}
                  />
                </MaybeScroll>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  }

  return <React.Fragment>{content}</React.Fragment>;
}

export default TargetGrantPermissionFormEntityList;
