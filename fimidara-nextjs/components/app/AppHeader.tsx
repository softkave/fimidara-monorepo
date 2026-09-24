import React from "react";
import { cn } from "../utils.ts";
import AppTitle from "./AppTitle.tsx";
import { useAppMenu } from "./useAppMenu.tsx";
import UserMenu from "./UserMenu.tsx";
import { UploadingFilesProgressButton } from "./workspaces/files/UploadingFilesProgress.tsx";

export interface IAppHeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function AppHeader(props: IAppHeaderProps) {
  const { className, style } = props;
  const { isOpen } = useAppMenu();

  return (
    <div
      className={cn(
        "flex items-center gap-4 py-4 px-4",
        className
      )}
      style={style}
    >
      {!isOpen ? <AppTitle className="flex-1" /> : <div className="flex-1" />}
      <div className="flex items-center gap-2">
        <UploadingFilesProgressButton />
        <UserMenu />
      </div>
    </div>
  );
}
