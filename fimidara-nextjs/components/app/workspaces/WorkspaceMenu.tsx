import { Button } from "@/components/ui/button.tsx";
import { DropdownItems } from "@/components/ui/dropdown-items.tsx";
import { ToastAction } from "@/components/ui/toast.tsx";
import { insertMenuDivider } from "@/components/utils/utils";
import { useToast } from "@/hooks/use-toast.ts";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { Workspace } from "fimidara";
import { compact, noop } from "lodash-es";
import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { FC, Fragment } from "react";
import useTargetGrantPermissionModal from "../../hooks/useTargetGrantPermissionModal";

export interface WorkspaceMenuProps {
  workspace: Workspace;
  includeDeleteMenuOption?: boolean;
  onCompleteDelete: () => any;
}

enum MenuKeys {
  UpdateWorkspace = "update",
  DeleteWorkspace = "delete",
  GrantPermission = "grant-permission",
}

const WorkspaceMenu: FC<WorkspaceMenuProps> = (props) => {
  const { workspace } = props;
  const { toast } = useToast();
  const permissionsHook = useTargetGrantPermissionModal({
    workspaceId: workspace.workspaceId,
    targetId: workspace.resourceId,
    actionTargetType: "workspace",
    actionType: "item",
  });

  const onSelectMenuItem = (key: string) => {
    if (key === MenuKeys.DeleteWorkspace) {
      toast({
        title: "Are you sure you want to delete this workspace?",
        action: (
          <ToastAction altText="Yes" onClick={noop}>
            Yes
          </ToastAction>
        ),
      });
    } else if (key === MenuKeys.GrantPermission) {
      permissionsHook.toggle();
    }
  };

  const items = insertMenuDivider(
    compact([
      {
        // TODO: only show if user has permission
        key: MenuKeys.UpdateWorkspace,
        label: (
          <Link
            href={kAppWorkspacePaths.updateWorkspaceForm(workspace.workspaceId)}
          >
            Update Workspace
          </Link>
        ),
      },
      {
        key: MenuKeys.GrantPermission,
        label: "Permissions",
      },
    ])
  );

  return (
    <Fragment>
      <DropdownItems items={items} onSelect={onSelectMenuItem} asChild>
        <Button variant="outline" size="icon">
          <Ellipsis className="w-4 h-4" />
        </Button>
      </DropdownItems>
      {permissionsHook.node}
    </Fragment>
  );
};

export default WorkspaceMenu;
