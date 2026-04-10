import { DirectoryUpload, type UploadFile } from "@/components/internal/upload";
import { Button } from "@/components/ui/button.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { InputCounter } from "@/components/ui/input-counter.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { cn } from "@/components/utils.ts";
import { FormAlert } from "@/components/utils/FormAlert";
import { useToast } from "@/hooks/use-toast.ts";
import { addRootnameToPath, folderConstants } from "@/lib/definitions/folder";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { systemConstants } from "@/lib/definitions/system";
import { useWorkspaceFoldersFetchHook } from "@/lib/hooks/fetchHooks";
import {
  useWorkspaceFileUploadMutationHook,
  useWorkspaceFolderAddMutationHook,
  useWorkspaceFolderUpdateMutationHook,
} from "@/lib/hooks/mutationHooks";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers";
import { useTransferProgressHandler } from "@/lib/hooks/useTransferProgress";
import { fileValidationParts } from "@/lib/validation/file";
import { systemValidation } from "@/lib/validation/system";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMount } from "ahooks";
import { Folder, stringifyFimidaraFolderpath } from "fimidara";
import { compact, last } from "lodash-es";
import { CircleChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEventHandler, ReactNode, useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FilesFormUploadProgress } from "./FilesFormUploadProgress";
import { SelectedFilesForm, selectedFilesSchema } from "./SelectedFilesForm";
import { SingleFileFormValue } from "./types";
import {
  debouncedReplaceBaseFolderName,
  getFirstFoldername,
  getNewFileLocalId,
  replaceBaseFoldername,
} from "./utils";
import { newFileValidationSchema } from "./validation";

const folderValidation = z.object({
  name: fileValidationParts.filename.min(1),
  description: systemValidation.description.nullable().optional(),
  files: z.array(newFileValidationSchema).optional(),
});

export interface FolderFormValues {
  name: string;
  description?: string | null;
  files?: Array<SingleFileFormValue>;
}

function getFolderFormInputFromFolder(item: Folder): FolderFormValues {
  return {
    name: item.name,
    description: item.description,
  };
}

export interface FolderFormProps {
  folder?: Folder;
  className?: string;
  parentId?: string;
  /** folder parent path without rootname */
  parentPath?: string;
  workspaceId: string;
  workspaceRootname: string;
}

export default function FolderForm(props: FolderFormProps) {
  const { folder, className, workspaceId, workspaceRootname } = props;
  const { toast } = useToast();
  const parentPath =
    props.parentPath ||
    (folder
      ? stringifyFimidaraFolderpath({ namepath: folder.namepath.slice(0, -1) })
      : "");

  const router = useRouter();
  const updateHook = useWorkspaceFolderUpdateMutationHook({
    onSuccess(data, params) {
      toast({ title: "Folder updated" });
      router.push(
        kAppWorkspacePaths.folder(workspaceId, data.folder.resourceId)
      );
    },
  });

  const createHook = useWorkspaceFolderAddMutationHook({
    onSuccess(data, params) {
      toast({ title: "Folder created" });
      router.push(
        kAppWorkspacePaths.folder(workspaceId, data.folder.resourceId)
      );
    },
  });

  const progressHandlerHook = useTransferProgressHandler();
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

  // We don't need to clear files state for folder/root because uploaded files
  // mutate the list and add themselves
  const { clearFetchState } = useWorkspaceFoldersFetchHook({
    page: 0 /** not necessary */,
    pageSize: 1 /** not necessary */,
    folderId: folder?.resourceId,
    folderpath: folder
      ? addRootnameToPath(folder.namepath, workspaceRootname).join("/")
      : workspaceRootname,
  });

  useMount(() => {
    // TODO: should we have scheduled refresh or refresh on page load instead?
    // Refetch folder children after leaving form
    return () => clearFetchState();
  });

  const hookLoading =
    uploadHook.loading || createHook.loading || updateHook.loading;
  const hookError = uploadHook.error || createHook.error || updateHook.error;

  const handleSubmitFile = async (input: SingleFileFormValue) => {
    if (input.file) {
      const filepath = addRootnameToPath(
        compact([parentPath, wFoldername, input.name]).join(
          folderConstants.nameSeparator
        ),
        workspaceRootname
      );

      return await uploadHook.runAsync({
        filepath,
        // fileId: input.resourceId,
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
      });
    }
  };

  const handleCreateFolder = (data: FolderFormValues) => {
    if (!folder) {
      const folderpath = compact([parentPath, data.name]).join(
        folderConstants.nameSeparator
      );

      return createHook.runAsync({
        folderpath: addRootnameToPath(folderpath, workspaceRootname),
        description: data.description || undefined,
      });
    }
  };

  const handleUpdateFolder = (data: FolderFormValues) => {
    const folderpath = addRootnameToPath(
      compact([parentPath, data.name]).join(folderConstants.nameSeparator),
      workspaceRootname
    );

    return updateHook.runAsync({
      // folderId: folder.resourceId,
      folderpath,
      folder: { description: data.description || undefined },
    });
  };

  const onSubmit = async (data: z.infer<typeof folderValidation>) => {
    if (data.files) {
      await Promise.all(data.files.map(handleSubmitFile));

      if (data.description) {
        await handleUpdateFolder(data);
      }
    } else if (folder) {
      await handleUpdateFolder(data);
    } else {
      await handleCreateFolder(data);
    }
  };

  const form = useForm<z.infer<typeof folderValidation>>({
    resolver: zodResolver(folderValidation),
    defaultValues: folder ? getFolderFormInputFromFolder(folder) : { name: "" },
  });
  useFormHelpers(form, { errors: hookError });

  const wFiles = form.watch("files");
  const wFoldername = form.watch("name");

  const autofillName = useMemo(() => {
    return getFirstFoldername(
      compact(wFiles?.map((file) => file.file?.webkitRelativePath))
    );
  }, [wFiles]);

  const onAutofillName = () => {
    if (!autofillName || folder) {
      return;
    }

    form.setValue("name", autofillName);
  };

  const onUpdateFolderName: ChangeEventHandler<HTMLInputElement> = (evt) => {
    const name = evt.target.value;
    form.setValue("name", name);

    if (name) {
      debouncedReplaceBaseFolderName(wFiles || [], name);
    }
  };

  const nameNode = (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel required>Folder Name</FormLabel>
            <FormControl>
              <div>
                <Input
                  {...field}
                  onChange={onUpdateFolderName}
                  placeholder="Enter folder name"
                  disabled={hookLoading || !!folder}
                  maxLength={folderConstants.maxFolderNameLength}
                  autoComplete="off"
                />
                <InputCounter
                  count={field.value?.length || 0}
                  maxCount={folderConstants.maxFolderNameLength}
                  onTruncate={() => {
                    form.setValue(
                      "name",
                      field.value?.slice(0, folderConstants.maxFolderNameLength)
                    );
                  }}
                  className="mt-1"
                />
                {autofillName && !folder && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={onAutofillName}
                    className="space-x-2 flex px-0"
                  >
                    <CircleChevronRight className="h-4 w-4" />
                    <span>
                      Use <strong>{autofillName}</strong> from selected files
                    </span>
                  </Button>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );

  const descriptionNode = (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <div>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter folder description"
                  maxLength={systemConstants.maxDescriptionLength}
                />
                <InputCounter
                  count={field.value?.length || 0}
                  maxCount={systemConstants.maxDescriptionLength}
                  onTruncate={() => {
                    form.setValue(
                      "description",
                      field.value?.slice(
                        0,
                        systemConstants.maxDescriptionLength
                      )
                    );
                  }}
                  className="mt-1"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );

  // TODO: include max file size
  const selectFolderNode = (
    <FormField
      control={form.control}
      name="files"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <DirectoryUpload
              disabled={hookLoading}
              showFileList={false}
              buttonText="Select Folder"
              onDirectorySelect={(uploadFiles: UploadFile[]) => {
                const files = uploadFiles.map(
                  (file): SingleFileFormValue => ({
                    file,
                    mimetype: file.type,
                    resourceId: undefined,
                    name:
                      last(file.webkitRelativePath?.split("/")) || file.name,
                    __localId: getNewFileLocalId(),
                  })
                );

                if (!folder && !wFoldername) {
                  const foldername =
                    getFirstFoldername(
                      compact(
                        uploadFiles.map((file) => file.webkitRelativePath)
                      )
                    ) || "";

                  form.setValue("name", foldername);
                }

                form.setValue("files", files);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  let selectedFilesNode: ReactNode = null;

  if (wFiles?.length) {
    selectedFilesNode = (
      <div className="mb-4">
        <SelectedFilesForm
          isDirectory
          form={
            form as unknown as UseFormReturn<
              z.infer<typeof selectedFilesSchema>
            >
          }
          beforeUpdateModifyName={(name) => {
            if (wFoldername) {
              const [{ name: updatedName }] = replaceBaseFoldername(
                [{ name }],
                wFoldername
              );
              return updatedName;
            }

            return name;
          }}
        />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
      >
        <FormAlert error={hookError} />
        {parentPath && <p>{parentPath}/</p>}
        <div className="space-y-4">
          {nameNode}
          {descriptionNode}
          {selectFolderNode}
          {selectedFilesNode}
        </div>
        <FilesFormUploadProgress
          identifiers={progressHandlerHook.identifiers}
        />
        <div>
          <Button type="submit" loading={hookLoading} className="w-full">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
