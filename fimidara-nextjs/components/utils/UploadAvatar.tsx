import { useToast } from "@/hooks/use-toast.ts";
import { fimidxConsoleLogger } from "@/lib/common/logger";
import { CloudUploadOutlined } from "@ant-design/icons";
import { getFimidaraUploadFileURL } from "fimidara";
import { defaultTo, first } from "lodash-es";
import React from "react";
import { systemConstants } from "../../lib/definitions/system";
import { useAssertGetUser } from "../hooks/useAssertGetUser";
import { AvatarUpload, type UploadFile } from "../internal/upload";
import { cn } from "../utils";
import IconButton from "./buttons/IconButton";
import { errorMessageNotificatition } from "./errorHandling";

export type IImageUploadMessages = Partial<{
  uploading: string;
  successful: string;
  failed: string;
}>;

export interface IUploadAvatarProps {
  messages?: IImageUploadMessages;
  className?: string;
  filepath: string;
  onCompleteUpload: () => void;
}

const DEFAULT_MESSAGES: IImageUploadMessages = {
  uploading: "Uploading image",
  successful: "Uploaded image successfully",
  failed: "Error uploading image",
};

const UploadAvatar: React.FC<IUploadAvatarProps> = (props) => {
  const { filepath, className, onCompleteUpload } = props;
  const { toast } = useToast();
  const u0 = useAssertGetUser();
  const customMessages = {
    ...DEFAULT_MESSAGES,
    ...defaultTo(props.messages, {}),
  };

  const [loading, setLoading] = React.useState(false);

  const handleImageSelect = async (file: UploadFile) => {
    // Validate image type
    if (first(file.type.split("/")) !== "image") {
      errorMessageNotificatition(
        "Invalid image type",
        /** defaultMessage */ undefined,
        toast
      );
      return;
    }

    setLoading(true);

    try {
      const clientAssignedToken = u0.assertGet().clientJwtToken;
      const uploadURL = getFimidaraUploadFileURL({
        filepath,
        serverURL: systemConstants.serverAddr,
      });

      // Create FormData for upload
      const formData = new FormData();
      formData.append("data", file);

      // Perform the upload
      const response = await fetch(uploadURL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientAssignedToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Uploaded image successfully",
          description: (
            <span>
              {customMessages.successful}.{" "}
              <strong>
                Please reload the page if your change doesn&apos;t take effect
                soon.
              </strong>
            </span>
          ) as any,
        });

        setTimeout(() => {
          onCompleteUpload();
        }, 3000);
      } else {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      fimidxConsoleLogger.error("Upload error:", error);
      errorMessageNotificatition(null, customMessages.failed, toast);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <IconButton
      icon={<CloudUploadOutlined />}
      disabled={loading}
      title={"Upload image"}
    />
  );

  return (
    <div className={cn("w-10 h-10", className)}>
      <AvatarUpload
        maxSize={5 * 1024 * 1024} // 5MB
        onImageSelect={handleImageSelect}
        disabled={loading}
        showFileList={false}
        showUploadButton={false}
        validator={(file) => {
          if (first(file.type.split("/")) !== "image") {
            return "Invalid image type";
          }
          return null;
        }}
      >
        {uploadButton}
      </AvatarUpload>
    </div>
  );
};

export default UploadAvatar;
