import { useToggle } from "ahooks";
import { FimidaraResourceType } from "fimidara";
import React from "react";
import TargetGrantPermissionForm from "../app/workspaces/permissions/TargetGrantPermissionsForm";

export interface UseTargetGrantPermissionModalProps {
  workspaceId: string;
  targetId: string;
  actionTargetType: FimidaraResourceType;
  actionType: "item" | "group" | "both";
}

export enum GrantPermissionKey {
  GrantPermission = "grant-permission",
}

export default function useTargetGrantPermissionModal(
  props: UseTargetGrantPermissionModalProps
) {
  const { workspaceId, targetId, actionTargetType, actionType } = props;
  const [visible, toggleHook] = useToggle();

  const node = React.useMemo(() => {
    if (visible) {
      return (
        <TargetGrantPermissionForm
          workspaceId={workspaceId}
          targetId={targetId}
          actionTargetType={actionTargetType}
          onClose={toggleHook.toggle}
          actionType={actionType}
        />
      );
    } else {
      return null;
    }
  }, [
    visible,
    targetId,
    actionTargetType,
    workspaceId,
    toggleHook.toggle,
    actionType,
  ]);

  return { node, toggle: toggleHook.toggle };
}
