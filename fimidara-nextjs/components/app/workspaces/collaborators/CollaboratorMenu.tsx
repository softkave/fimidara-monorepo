import { useDeleteModal } from "@/components/hooks/useDeleteModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DropdownItems } from "@/components/ui/dropdown-items.tsx";
import { errorMessageNotificatition } from "@/components/utils/errorHandling";
import { insertMenuDivider } from "@/components/utils/utils";
import { useToast } from "@/hooks/use-toast.ts";
import { useWorkspaceCollaboratorDeleteMutationHook } from "@/lib/hooks/mutationHooks";
import { Collaborator } from "fimidara";
import { compact } from "lodash-es";
import { Ellipsis } from "lucide-react";
import React from "react";
import useTargetGrantPermissionModal from "../../../hooks/useTargetGrantPermissionModal";

export interface CollaboratorMenuProps {
  workspaceId: string;
  collaborator: Collaborator;
  onCompleteRemove: () => any;
}

enum MenuKeys {
  DeleteItem = "delete-item",
  GrantPermission = "grant-permission",
}

const CollaboratorMenu: React.FC<CollaboratorMenuProps> = (props) => {
  const { workspaceId, collaborator, onCompleteRemove } = props;
  const { toast } = useToast();
  const permissionsHook = useTargetGrantPermissionModal({
    workspaceId,
    targetId: collaborator.resourceId,
    actionTargetType: "user",
    actionType: "item",
  });
  const deleteHook = useWorkspaceCollaboratorDeleteMutationHook({
    onSuccess(data, params) {
      toast({ title: "Collaborator removed" });
      onCompleteRemove();
    },
    onError(error, params) {
      errorMessageNotificatition(error, "Error removing collaborator", toast);
    },
  });

  const deleteModalHook = useDeleteModal({
    title: "Remove collaborator",
    description: `Are you sure you want to remove collaborator "${compact([
      collaborator.firstName,
      collaborator.lastName,
    ]).join(" ")}"?`,
    onDelete: async () => {
      await deleteHook.runAsync({
        workspaceId,
        collaboratorId: collaborator.resourceId,
      });
    },
  });

  const onSelectMenuItem = (key: string) => {
    if (key === MenuKeys.DeleteItem) {
      deleteModalHook.setShow(true);
    } else if (key === MenuKeys.GrantPermission) {
      permissionsHook.toggle();
    }
  };

  const items = insertMenuDivider([
    {
      key: MenuKeys.GrantPermission,
      label: "Permissions",
    },
    {
      key: MenuKeys.DeleteItem,
      label: "Remove Collaborator",
    },
  ]);

  return (
    <React.Fragment>
      <DropdownItems
        disabled={deleteHook.loading}
        items={items}
        onSelect={onSelectMenuItem}
        asChild
      >
        <Button variant="outline" size="icon">
          <Ellipsis className="w-4 h-4" />
        </Button>
      </DropdownItems>
      {permissionsHook.node}
      {deleteModalHook.node}
    </React.Fragment>
  );
};

export default CollaboratorMenu;
