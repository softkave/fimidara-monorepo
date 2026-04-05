import { useToast } from "@/hooks/use-toast.ts";
import { fimidxConsoleLogger } from "@/lib/common/logger/fimidx-console-logger.ts";
import { useRequest } from "ahooks";
import assert from "assert";
import { getFimidaraReadFileURL } from "fimidara";
import { first } from "lodash-es";
import React from "react";
import { getPublicFimidaraEndpointsUsingUserToken } from "../../lib/api/fimidaraEndpoints";
import { systemConstants } from "../../lib/definitions/system";
import { useKvStore } from "../../lib/hooks/kvStore";
import { Button } from "../ui/button.tsx";
import { errorMessageNotificatition } from "../utils/errorHandling";

export interface ImageProps {
  allowDelete?: boolean;
  width?: number;
  height?: number;
  fallbackNode?: React.ReactNode;
  preview?: boolean;
  refreshKey?: string;
  filepath: string;
  alt: string;
  onClick?: (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onDelete?: () => void;
}

const skipEventForTag = "skip-click-event-on-delete-btn";

const Image: React.FC<ImageProps> = (props) => {
  const {
    preview = true,
    width,
    height,
    filepath,
    alt,
    fallbackNode,
    allowDelete,
    refreshKey,
    onClick,
    onDelete,
  } = props;
  const { toast } = useToast();

  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const imageKey = useKvStore(
    (state) => refreshKey && state.get<string>(refreshKey)
  );

  const onError = (evt: React.SyntheticEvent<HTMLImageElement, Event>) => {
    fimidxConsoleLogger.log("Image load failed", { props, evt });
    setImageLoadFailed(true);
  };

  const internalOnDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);

      try {
        await onDelete();
      } catch (error: unknown) {
        errorMessageNotificatition(error, "Error deleting image", toast);
      }

      setTimeout(() => {
        setIsDeleting(false);
      }, 2000);
    }
  };

  const getPresignedPath = async () => {
    const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
    const getResult = await endpoints.presignedPaths.getPresignedPaths({
      files: [{ filepath }],
    });

    if (getResult.paths.length) {
      const p = first(getResult.paths);
      assert.ok(p);
      return p.path;
    }

    const issueResult = await endpoints.presignedPaths.issuePresignedPath({
      filepath,
    });
    return issueResult.path;
  };

  const pathHook = useRequest(getPresignedPath);

  const handleImageClick = (
    evt: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (preview && pathHook.data) {
      setShowPreview(true);
    }
    onClick?.(evt);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
  };

  let imageNode: React.ReactNode = (
    <div
      className="flex items-center justify-center bg-gray-100 rounded text-gray-600 text-sm"
      style={{ width, height }}
    >
      Loading...
    </div>
  );

  if (pathHook.data) {
    imageNode = (
      <div className="relative cursor-pointer" onClick={handleImageClick}>
        <img
          key={imageKey}
          width={width}
          height={height}
          src={getFimidaraReadFileURL({
            serverURL: systemConstants.serverAddr,
            filepath: "/" + pathHook.data,
          })}
          alt={alt}
          onError={onError}
          className="rounded block max-w-full h-auto"
          style={{ width, height, objectFit: "cover" }}
        />
      </div>
    );
  }

  const imageWrapperNode = (
    <div className="relative inline-block" style={{ width, height }}>
      {imageNode}
      {allowDelete && (
        <div
          className={`absolute top-0 left-0 flex justify-end items-start w-full h-full p-1 pointer-events-none ${
            isDeleting ? "" : "[&>*]:hidden hover:[&>*]:!inline-block"
          }`}
          onClick={onClick}
        >
          <Button
            type="button"
            disabled={isDeleting}
            data-skipeventfortag={skipEventForTag}
            onClick={(evt) => {
              evt.stopPropagation();
              internalOnDelete();
            }}
            variant="outline"
            size="icon"
            className="pointer-events-auto"
          >
            {isDeleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  // Simple preview modal
  const previewModal = showPreview && pathHook.data && (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]"
      onClick={handlePreviewClose}
    >
      <img
        src={getFimidaraReadFileURL({
          serverURL: systemConstants.serverAddr,
          filepath: "/" + pathHook.data,
        })}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  return (
    <React.Fragment>
      {imageLoadFailed && fallbackNode ? fallbackNode : imageWrapperNode}
      {previewModal}
    </React.Fragment>
  );
};

export default Image;
