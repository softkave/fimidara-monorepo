"use client";

import ItemList from "@/components/utils/list/ItemList";
import { kActionLabel } from "@/lib/definitions/system";
import React, { useCallback, useMemo, useState } from "react";
import PermissionAction from "./PermissionAction";
import { PermissionMapItemInfo } from "./types";

export interface PermissionActionListProps {
  disabled?: boolean;
  items: PermissionMapItemInfo[];
  onChange: (
    entries: PermissionMapItemInfo | Array<PermissionMapItemInfo>
  ) => void;
  includeToggleAll?: boolean;
}

const PermissionActionList: React.FC<PermissionActionListProps> = (props) => {
  const { disabled, onChange, items, includeToggleAll = true } = props;

  const [toggleAllAccess, setToggleAllAccess] = useState(false);

  const managedItems = useMemo(() => {
    const itemsWithLabel = items.map((item) => {
      return {
        ...item,
        label: kActionLabel[item.action],
      };
    });
    return includeToggleAll
      ? ["toggleAll" as const, ...itemsWithLabel]
      : itemsWithLabel;
  }, [items, includeToggleAll]);

  const handleToggleAllChange = useCallback(
    (access: boolean) => {
      setToggleAllAccess(access);
      const entries = items.map((item) => {
        return {
          action: item.action,
          entityId: item.entityId,
          access,
        };
      });
      onChange(entries);
    },
    [items, onChange]
  );

  return (
    <ItemList
      bordered
      items={managedItems}
      space="sm"
      renderItem={(p) => {
        if (p === "toggleAll") {
          return (
            <PermissionAction
              label="Toggle All"
              access={toggleAllAccess}
              disabled={disabled}
              onChange={handleToggleAllChange}
            />
          );
        }

        return (
          <PermissionAction
            label={p.label}
            access={p.access}
            disabled={disabled}
            onChange={(change) => {
              if (change === false && toggleAllAccess) {
                handleToggleAllChange(false);
              }

              onChange({
                action: p.action,
                entityId: p.entityId,
                access: change,
              });
            }}
          />
        );
      }}
    />
  );
};

export default PermissionActionList;
