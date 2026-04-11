"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StyleableComponentProps } from "@/components/utils/styling/types";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { cn } from "@/lib/utils";
import { FolderTree } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { useNamepathParentsHook } from "./useNamepathParentsHook";

export interface NamepathBreadcrumbProps extends StyleableComponentProps {
  workspaceId: string;
  /** Folder path segments only, or for files: folder segments then the file
   * name as the last element. */
  namepath?: string[];
  resourceId: string;
  resourceKind: "file" | "folder";
  /** Parent folder IDs in path order (see `File` / `Folder` `idPath`). */
  idPath?: string[];
  workspaceRootname?: string;
}

function cumulativeNamepathKey(namepath: string[], endIndex: number) {
  return namepath.slice(0, endIndex + 1).join("/");
}

const kEmptyArray: string[] = [];

function NamepathBreadcrumb(props: NamepathBreadcrumbProps) {
  const {
    workspaceId,
    resourceId,
    resourceKind,
    idPath = kEmptyArray,
    namepath = kEmptyArray,
    workspaceRootname,
    className,
    style,
  } = props;

  const { parentsByNamepathKey } = useNamepathParentsHook({
    workspaceId,
    idPath,
    resourceKind,
    resourceId,
    namepath,
  });

  const rootHref = kAppWorkspacePaths.folderList(workspaceId);
  const folderSegmentCount =
    resourceKind === "file"
      ? Math.max(0, namepath.length - 1)
      : namepath.length;

  const crumbs: ReactNode[] = [];

  crumbs.push(
    <BreadcrumbItem key="root">
      {workspaceRootname ? (
        <BreadcrumbLink asChild>
          <Link href={rootHref}>{workspaceRootname}</Link>
        </BreadcrumbLink>
      ) : (
        <BreadcrumbLink asChild>
          <Link
            href={rootHref}
            aria-label="Folders"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <FolderTree className="h-4 w-4" />
          </Link>
        </BreadcrumbLink>
      )}
    </BreadcrumbItem>
  );

  for (let i = 0; i < folderSegmentCount; i++) {
    const label = namepath[i];
    const key = cumulativeNamepathKey(namepath, i);
    const entry = parentsByNamepathKey.get(key);
    const href = entry?.resourceId
      ? kAppWorkspacePaths.folder(workspaceId, entry.resourceId)
      : null;

    crumbs.push(
      <Fragment key={key}>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {href ? (
            <BreadcrumbLink asChild>
              <Link href={href}>{label}</Link>
            </BreadcrumbLink>
          ) : (
            <span className="text-muted-foreground">{label}</span>
          )}
        </BreadcrumbItem>
      </Fragment>
    );
  }

  if (resourceKind === "file" && namepath.length > 0) {
    const fileLabel = namepath[namepath.length - 1];
    const fileHref = kAppWorkspacePaths.file(workspaceId, resourceId);

    crumbs.push(
      <Fragment key="__file__">
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={fileHref}>{fileLabel}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Fragment>
    );
  }

  return (
    <Breadcrumb className={className} style={style}>
      <BreadcrumbList className="p-0 list-none">{crumbs}</BreadcrumbList>
    </Breadcrumb>
  );
}

export default NamepathBreadcrumb;
