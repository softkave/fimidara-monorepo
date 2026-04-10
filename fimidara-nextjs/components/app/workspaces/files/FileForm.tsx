import { Button } from "@/components/ui/button.tsx";
import { Form } from "@/components/ui/form.tsx";
import { cn } from "@/components/utils.ts";
import { FormAlert } from "@/components/utils/FormAlert";
import { useToast } from "@/hooks/use-toast.ts";
import { addRootnameToPath, folderConstants } from "@/lib/definitions/folder";
import {
  useWorkspaceFileUpdateMutationHook,
  useWorkspaceFileUploadMutationHook,
} from "@/lib/hooks/mutationHooks";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers";
import { useTransferProgressHandler } from "@/lib/hooks/useTransferProgress";
import { zodResolver } from "@hookform/resolvers/zod";
import { File as FimidaraFile, stringifyFimidaraFilepath } from "fimidara";
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
  const { file, className, folderpath, workspaceRootname } = props;
  const { toast } = useToast();
  const progressHandlerHook = useTransferProgressHandler();
  const updateHook = useWorkspaceFileUpdateMutationHook({
    onSuccess(data, params) {
      toast({ title: "File updated" });
      // router.push(
      //   appWorkspacePaths.file(workspaceId, data.file.resourceId)
      // );
    },
  });
  const uploadHook = useWorkspaceFileUploadMutationHook({
    onSuccess(data, params) {
      toast({ title: "File uploaded" });
      // router.push(
      //   appWorkspacePaths.file(workspaceId, data.file.resourceId)
      // );
    },
    onError(e, params) {
      const filepath = params[0].filepath;
      if (filepath) progressHandlerHook.setOpError(filepath, e);
    },
  });

  const submitFile = async (input: SingleFileFormValue) => {
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
        return await uploadHook.runAsync({
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

      return await uploadHook.runAsync({
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
    }
  };

  const onSubmit = async (
    data: z.infer<typeof newFileFormValidationSchema>
  ) => {
    await Promise.all(data.files.map(submitFile));
  };

  const form = useForm<z.infer<typeof newFileFormValidationSchema>>({
    resolver: zodResolver(newFileFormValidationSchema),
    defaultValues: file ? getFileFormInputFromFile(file) : initialValues,
  });

  const loading = updateHook.loading || uploadHook.loading;
  const error = updateHook.error || uploadHook.error;
  useFormHelpers(form, { errors: error });

  let contentNode: React.ReactNode = null;

  if (file) {
    contentNode = <SingleFileForm isExistingFile form={form} index={0} />;
  } else {
    contentNode = (
      <div className="mb-4">
        <MultipleFilesForm form={form} disabled={loading} />
      </div>
    );
  }

  // TODO: should "uploading files progress" below open the progress drawer on
  // click?
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
