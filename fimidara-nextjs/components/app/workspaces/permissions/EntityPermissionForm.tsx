import { kDisabledPermissions } from "@/lib/definitions/system";
import { FimidaraPermissionAction } from "fimidara";
import React from "react";
import PermissionActionList from "./PermissionActionList";
import { PermissionMapItemInfo, ResolvedPermissionsMap } from "./types";
import { getResolvedPermissionToKey } from "./utils";

export interface EntityPermissionFormProps<T extends { resourceId: string }> {
  disabled?: boolean;
  entity: T;
  permissionsMap: ResolvedPermissionsMap;
  actions: FimidaraPermissionAction[];
  everyAction: FimidaraPermissionAction[];
  onChange(
    entity: T,
    entries: PermissionMapItemInfo | Array<PermissionMapItemInfo>
  ): void;
}

function EntityPermissionForm<T extends { resourceId: string }>(
  props: EntityPermissionFormProps<T>
) {
  const { disabled, permissionsMap, actions, everyAction, entity, onChange } =
    props;

  const handleChange = React.useCallback(
    (entries: PermissionMapItemInfo | Array<PermissionMapItemInfo>) => {
      const entriesArray = Array.isArray(entries) ? entries : [entries];
      onChange(entity, entriesArray);
    },
    [entity, onChange]
  );

  const getActionPermission = React.useCallback(
    (action: FimidaraPermissionAction) => {
      const key = getResolvedPermissionToKey({
        action,
        entityId: entity.resourceId,
      });
      const p = permissionsMap[key];
      const isActionDisabled =
        kDisabledPermissions.includes(action) || !actions.includes(action);
      const disabledReason = isActionDisabled
        ? "Permission support implementation pending"
        : "";

      return {
        action,
        disabledReason,
        disabled: isActionDisabled,
        entityId: p?.entityId ?? entity.resourceId,
        access: p?.access ?? false,
      };
    },
    [entity, permissionsMap, actions]
  );

  const pList = React.useMemo(() => {
    return everyAction
      .filter((action) => actions.includes(action))
      .map((action) => getActionPermission(action))
      .sort((p01, p02) => {
        if (p01.disabled && !p02.disabled) {
          return 1;
        } else if (p02.disabled && !p01.disabled) {
          return -1;
        } else {
          return 0;
        }
      });
  }, [everyAction, getActionPermission, actions]);

  return (
    <PermissionActionList
      includeToggleAll
      disabled={disabled}
      items={pList}
      onChange={handleChange}
    />
  );
}

export default EntityPermissionForm;
