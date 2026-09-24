import { Button } from "@/components/ui/button.tsx";
import { Form } from "@/components/ui/form.tsx";
import { cn } from "@/components/utils.ts";
import { FormAlert } from "@/components/utils/FormAlert";
import { useToast } from "@/hooks/use-toast.ts";
import { addRootnameToPath, folderConstants } from "@/lib/definitions/folder";
import {
  uploadWorkspaceFile,
  useWorkspaceFileUpdateMutationHook,
} from "@/lib/hooks/mutationHooks";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers";
import { useTransferProgressHandler } from "@/lib/hooks/useTransferProgress";
import { zodResolver } from "@hookform/resolvers/zod";
import { File as FimidaraFile, stringifyFimidaraFilepath } from "fimidara";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FilesFormUploadProgress } from "./FilesFormUploadProgress";
import { MultipleFilesForm } from "./MultipleFilesForm";
import { SingleFileForm } from "./SingleFileForm";
import { SingleFileFormValue } from "./types";
import { getNewFileLocalId } from "./utils";
import { newFileValidationSchema } from "./validation";

export interface FileFormValue {
  files: Array<SingleFileFormValue>;
}

const initialValues: FileFormValue = {
  files: [],
};

function getFileFormInputFromFile(item: FimidaraFile): FileFormValue {
  return {
    files: [
      {
        __localId: getNewFileLocalId(),
        resourceId: item.resourceId,
        name: item.name,
        description: item.description,
        encoding: item.encoding,
        mimetype: item.mimetype,
      },
    ],
  };
}

const newFileFormValidationSchema = z.object({
  files: z.array(newFileValidationSchema).min(1),
});

export interface FileFormProps {
  file?: FimidaraFile;
  className?: string;
  /** file parent folder without rootname. */
  folderpath?: string;
  workspaceId: string;
  workspaceRootname: string;
}

export default function FileForm(props: FileFormProps) {
  const { file, className, folderpath, workspaceId, workspaceRootname } = props;
  const { toast } = useToast();
  const progressHandlerHook = useTransferProgressHandler();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>();
  const form = useForm<z.infer<typeof newFileFormValidationSchema>>({
    resolver: zodResolver(newFileFormValidationSchema),
    defaultValues: file ? getFileFormInputFromFile(file) : initialValues,
  });

  const updateHook = useWorkspaceFileUpdateMutationHook({
    onSuccess() {
      toast({ title: "File updated" });
    },
  });

  const submitFile = async (input: SingleFileFormValue, index: number) => {
    const filepath = file
      ? stringifyFimidaraFilepath(file, workspaceRootname)
      : addRootnameToPath(
          folderpath
            ? `${folderpath}${folderConstants.nameSeparator}${input.name}`
            : input.name,
          workspaceRootname
        );

    if (input.resourceId) {
      if (input.file) {
        try {
          const result = await uploadWorkspaceFile({
            fileId: input.resourceId,
            data: input.file,
            size: input.file.size,
            description: input.description || undefined,
            mimetype: input.mimetype,
            encoding: input.encoding,
            clientMultipartId: input.file.name,
            afterPart: progressHandlerHook.getProgressHandler({
              identifier: filepath,
              totalSize: input.file.size,
            }),
            resume: true,
            firePartEventsForResumedParts: true,
          });

          progressHandlerHook.markComplete(filepath, {
            fileId: result.file.resourceId,
            workspaceId,
            totalSize: input.file.size,
          });
          form.setValue(`files.${index}.resourceId`, result.file.resourceId);
          toast({ title: "File uploaded" });
          return result;
        } catch (e) {
          progressHandlerHook.setOpError(filepath, e);
          throw e;
        }
      } else {
        return await updateHook.runAsync({
          fileId: input.resourceId,
          file: {
            description: input.description || undefined,
            mimetype: input.mimetype,

            // TODO: add to server
            // encoding: input.encoding,
          },
        });
      }
    } else {
      if (!input.file) {
        // TODO: show error?
        return;
      }

      try {
        const result = await uploadWorkspaceFile({
          filepath,
          data: input.file,
          size: input.file.size,
          description: input.description || undefined,
          mimetype: input.mimetype,
          encoding: input.encoding,
          clientMultipartId: input.file.name,
          afterPart: progressHandlerHook.getProgressHandler({
            identifier: filepath,
            totalSize: input.file.size,
          }),
          resume: true,
          firePartEventsForResumedParts: true,
        });

        progressHandlerHook.markComplete(filepath, {
          fileId: result.file.resourceId,
          workspaceId,
          totalSize: input.file.size,
        });
        form.setValue(`files.${index}.resourceId`, result.file.resourceId);
        toast({ title: "File uploaded" });
        return result;
      } catch (e) {
        progressHandlerHook.setOpError(filepath, e);
        throw e;
      }
    }
  };

  const onSubmit = async (
    data: z.infer<typeof newFileFormValidationSchema>
  ) => {
    setUploading(true);
    setUploadError(undefined);
    try {
      // Must not use a shared ahooks runAsync here — parallel runAsync cancels
      // earlier requests when a later one starts.
      await Promise.all(
        data.files.map((entry, index) => submitFile(entry, index))
      );
    } catch (e) {
      setUploadError(e);
      throw e;
    } finally {
      setUploading(false);
    }
  };

  const loading = updateHook.loading || uploading;
  const error = updateHook.error || uploadError;
  useFormHelpers(form, { errors: error });

  let contentNode: React.ReactNode = null;

  if (file) {
    contentNode = <SingleFileForm isExistingFile form={form} index={0} />;
  } else {
    contentNode = (
      <div className="mb-4">
        <MultipleFilesForm
          form={form}
          disabled={loading}
          workspaceId={workspaceId}
        />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8 max-w-full", className)}
      >
        <FormAlert error={error} />
        <div className="space-y-4">{contentNode}</div>
        <FilesFormUploadProgress
          identifiers={progressHandlerHook.identifiers}
          onDismiss={progressHandlerHook.clearProgress}
        />
        <div>
          <Button type="submit" loading={loading} className="w-full">
            {file ? "Update File" : "Upload File"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
