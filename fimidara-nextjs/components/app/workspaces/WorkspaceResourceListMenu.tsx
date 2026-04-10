import useTargetGrantPermissionModal from "@/components/hooks/useTargetGrantPermissionModal";
import { Button } from "@/components/ui/button.tsx";
import { DropdownItems } from "@/components/ui/dropdown-items.tsx";
import { insertMenuDivider } from "@/components/utils/utils";
import { FimidaraResourceType } from "fimidara";
import { Ellipsis } from "lucide-react";
import React from "react";

export interface WorkspaceResourceListMenuProps {
  workspaceId: string;
  targetType: FimidaraResourceType;
}

enum MenuKeys {
  GrantPermission = "grant-permission",
}

const WorkspaceResourceListMenu: React.FC<WorkspaceResourceListMenuProps> = (
  props
) => {
  const { workspaceId, targetType } = props;
  const permissionsHook = useTargetGrantPermissionModal({
    workspaceId,
    actionTargetType: targetType,
    targetId: workspaceId,
    actionType: "group",
  });

  const onSelectMenuItem = (key: string) => {
    if (key === MenuKeys.GrantPermission) {
      permissionsHook.toggle();
    }
  };

  const items = insertMenuDivider([
    {
      key: MenuKeys.GrantPermission,
      label: "Permissions",
    },
  ]);

  return (
    <React.Fragment>
      {permissionsHook.node}
      <DropdownItems items={items} onSelect={onSelectMenuItem} asChild>
        <Button variant="outline" size="icon">
          <Ellipsis className="w-4 h-4" />
        </Button>
      </DropdownItems>
    </React.Fragment>
  );
};

export default WorkspaceResourceListMenu;
