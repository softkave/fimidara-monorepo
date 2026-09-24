import { Button } from "@/components/ui/button.tsx";
import { DropdownItems, IDropdownItem } from "@/components/ui/dropdown-items.tsx";
import { cn } from "@/components/utils.ts";
import { StyleableComponentProps } from "@/components/utils/styling/types";
import { insertMenuDivider } from "@/components/utils/utils";
import { Folder } from "fimidara";
import { Plus } from "lucide-react";
import React from "react";
import FolderMenu from "./FolderMenu";
import RootFilesMenu from "./RootFilesMenu";

export interface IFileListContainerHeaderProps extends StyleableComponentProps {
  workspaceId: string;
  workspaceRootname: string;
  folder?: Folder;
  onBeginCreateFile: () => void;
  onBeginCreateFolder: () => void;
  onScheduleDeleteSuccess: () => void;
}

enum CreateMenuKeys {
  CreateFolder = "create-folder",
  CreateFile = "create-file",
}

const FileListContainerHeader: React.FC<IFileListContainerHeaderProps> = (
  props
) => {
  const {
    workspaceId,
    folder,
    workspaceRootname,
    style,
    className,
    onBeginCreateFile,
    onBeginCreateFolder,
    onScheduleDeleteSuccess,
  } = props;

  const items: IDropdownItem[] = ([
    {
      key: CreateMenuKeys.CreateFolder,
      label: "Add Folder",
    },
    {
      key: CreateMenuKeys.CreateFile,
      label: "Add File",
    },
  ]);

  return (
    <div className={cn(className, "flex")} style={style}>
      <h5 className="flex-1">{folder?.name || "Files"}</h5>
      <div className="flex items-center space-x-2">
        <DropdownItems
          items={items}
          onSelect={(key) => {
            if (key === CreateMenuKeys.CreateFile) {
              onBeginCreateFile();
            } else if (key === CreateMenuKeys.CreateFolder) {
              onBeginCreateFolder();
            }
          }}
          asChild
        >
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownItems>
        {folder ? (
          <FolderMenu
            folder={folder}
            workspaceRootname={workspaceRootname}
            onScheduleDeleteSuccess={onScheduleDeleteSuccess}
          />
        ) : (
          <RootFilesMenu workspaceId={workspaceId} />
        )}
      </div>
    </div>
  );
};

export default FileListContainerHeader;
