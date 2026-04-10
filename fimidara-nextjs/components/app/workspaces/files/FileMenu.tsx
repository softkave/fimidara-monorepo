import { useDeleteModal } from "@/components/hooks/useDeleteModal.tsx";
import { useFileForm } from "@/components/hooks/useFileForm.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DropdownItems } from "@/components/ui/dropdown-items.tsx";
import { errorMessageNotificatition } from "@/components/utils/errorHandling";
import { insertMenuDivider } from "@/components/utils/utils";
import { useToast } from "@/hooks/use-toast.ts";
import { useWorkspaceFileDeleteMutationHook } from "@/lib/hooks/mutationHooks";
import { useDownloadFile } from "@/lib/hooks/useDownloadFile.tsx";
import {
  File,
  stringifyFimidaraFilename,
  stringifyFimidaraFilepath,
} from "fimidara";
import { Ellipsis } from "lucide-react";
import { FC, Fragment } from "react";
import useTargetGrantPermissionModal from "../../../hooks/useTargetGrantPermissionModal";

export interface FileMenuProps {
  file: File;
  workspaceRootname: string;
  onScheduleDeleteSuccess: () => void;
}

enum MenuKeys {
  DeleteItem = "delete-item",
  UpdateItem = "update-item",
  GrantPermission = "grant-permission",
  DownloadFile = "download",
}

const FileMenu: FC<FileMenuProps> = (props) => {
  const { file, workspaceRootname, onScheduleDeleteSuccess } = props;
  const { toast } = useToast();
  const permissionsHook = useTargetGrantPermissionModal({
    workspaceId: file.workspaceId,
    targetId: file.resourceId,
    actionTargetType: "file",
    actionType: "item",
  });
  const deleteHook = useWorkspaceFileDeleteMutationHook({
    onSuccess(data, params) {
      toast({ title: "File scheduled for deletion" });
      onScheduleDeleteSuccess();
    },
    onError(error, params) {
      errorMessageNotificatition(error, "Error deleting file", toast);
    },
  });
  const filename = stringifyFimidaraFilename(file);
  const downloadHook = useDownloadFile(file.resourceId, filename);

  const deleteModalHook = useDeleteModal({
    title: "Delete file",
    description: `Are you sure you want to delete file "${file.name}"?`,
    onDelete: async () => {
      await deleteHook.runAsync({
        filepath: stringifyFimidaraFilepath(file, workspaceRootname),
      });
    },
  });

  const formHook = useFileForm({
    workspaceRootname,
    workspaceId: file.workspaceId,
  });

  const onSelectMenuItem = (key: string) => {
    if (key === MenuKeys.DeleteItem) {
      deleteModalHook.setShow(true);
    } else if (key === MenuKeys.GrantPermission) {
      permissionsHook.toggle();
    } else if (key === MenuKeys.DownloadFile) {
      downloadHook.downloadHook.run();
    } else if (key === MenuKeys.UpdateItem) {
      formHook.setFormOpen(file);
    }
  };

  const items = insertMenuDivider([
    {
      key: MenuKeys.UpdateItem,
      label: "Update File",
    },
    {
      key: MenuKeys.GrantPermission,
      label: "Permissions",
    },
    {
      key: MenuKeys.DownloadFile,
      label: downloadHook.downloadHook.loading ? "Downloading..." : "Download",
      disabled: downloadHook.downloadHook.loading,
    },
    {
      key: MenuKeys.DeleteItem,
      label: "Delete File",
    },
  ]);

  return (
    <Fragment>
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
      {formHook.node}
    </Fragment>
  );
};

export default FileMenu;
