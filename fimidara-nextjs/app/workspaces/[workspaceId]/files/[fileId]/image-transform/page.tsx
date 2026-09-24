"use client";

import WorkspaceContainer from "@/components/app/workspaces/WorkspaceContainer";
import FileContainer from "@/components/app/workspaces/files/FileContainer";
import { isImageFile } from "@/components/app/workspaces/files/utils";
import PageNothingFound from "@/components/utils/page/PageNothingFound";
import { ImageTransformPlayground } from "@/components/web/ImageTransformPlayground.tsx";
import React, { use } from "react";

export type IFileImageTransformPageProps = {
  params: Promise<{ workspaceId: string; fileId: string }>;
};

const FileImageTransformPage: React.FC<IFileImageTransformPageProps> = (
  props
) => {
  const { fileId, workspaceId } = use(props.params);

  return (
    <WorkspaceContainer
      workspaceId={workspaceId}
      render={(workspace) => {
        return (
          <FileContainer
            fileId={fileId}
            workspaceId={workspaceId}
            render={(file) => {
              if (!isImageFile(file)) {
                return (
                  <PageNothingFound
                    message={
                      <p>
                        Image transform is only available for image files
                        (image MIME type or image extension).
                      </p>
                    }
                  />
                );
              }

              return (
                <ImageTransformPlayground
                  file={file}
                  workspaceRootname={workspace.rootname}
                />
              );
            }}
          />
        );
      }}
    />
  );
};

export default FileImageTransformPage;
