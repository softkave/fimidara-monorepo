import { Button } from "@/components/ui/button.tsx";
import { DropdownItems } from "@/components/ui/dropdown-items.tsx";
import { insertMenuDivider } from "@/components/utils/utils";
import { Ellipsis } from "lucide-react";
import React from "react";
import useTargetGrantPermissionModal from "../../../hooks/useTargetGrantPermissionModal";

export interface IRootFilesMenuProps {
  workspaceId: string;
}

enum MenuKeys {
  Permissions = "permissions",
}

const RootFilesMenu: React.FC<IRootFilesMenuProps> = (props) => {
  const { workspaceId } = props;
  const permissionsHook = useTargetGrantPermissionModal({
    workspaceId,
    targetId: workspaceId,
    actionTargetType: "folder",
    actionType: "group",
  });

  const onSelectMenuItem = (key: string) => {
    if (key === MenuKeys.Permissions) {
      permissionsHook.toggle();
    }
  };

  const items = insertMenuDivider([
    {
      key: MenuKeys.Permissions,
      label: "Permissions",
    },
  ]);

  return (
    <React.Fragment>
      <DropdownItems items={items} onSelect={onSelectMenuItem} asChild>
        <Button variant="outline" size="icon">
          <Ellipsis className="w-4 h-4" />
        </Button>
      </DropdownItems>
      {permissionsHook.node}
    </React.Fragment>
  );
};

export default RootFilesMenu;
