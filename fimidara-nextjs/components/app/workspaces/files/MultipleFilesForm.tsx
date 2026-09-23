import {
  MultipleFilesUpload,
  type UploadFile,
} from "@/components/internal/upload";
import { Button } from "@/components/ui/button.tsx";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form.tsx";
import { cn } from "@/components/utils.ts";
import { StyleableComponentProps } from "@/components/utils/styling/types";
import { indexArray } from "@/lib/utils/indexArray";
import { compact } from "lodash-es";
import { FileUp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { SelectedFilesForm } from "./SelectedFilesForm";
import { SingleFileFormValue } from "./types.ts";
import { getNewFileLocalId } from "./utils";
import { fileFormValidationSchema } from "./validation.ts";

export interface MultipleFilesFormProps extends StyleableComponentProps {
  disabled?: boolean;
  form: UseFormReturn<z.infer<typeof fileFormValidationSchema>>;
}

export function MultipleFilesForm(props: MultipleFilesFormProps) {
  const { disabled, form, className, style } = props;

  // TODO: include max file size
  // Only show the default upload button when we're uploading new files
  const selectFileNode = (
    <FormField
      control={form.control}
      name="files"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <MultipleFilesUpload
              disabled={disabled}
              value={compact(field.value?.map((item) => item.file))}
              onFileSelect={(uploadFiles: UploadFile[]) => {
                const existingFilesMap = indexArray(field.value ?? [], {
                  indexer: (current) => current.file?.uid ?? current.name,
                });
                const update = (field.value ?? []).concat(
                  uploadFiles
                    .filter((file) => !existingFilesMap[file.uid ?? file.name])
                    .map(
                      (file): SingleFileFormValue => ({
                        file,
                        __localId: getNewFileLocalId(),
                        resourceId: undefined,
                        name: file.name,
                        mimetype: file.type,
                      })
                    )
                );

                form.setValue("files", update);
              }}
              buttonText="Select Files"
              showFileList={false}
              showUploadButton={true}
            >
              <Button title="Select Files" type="button" variant="outline">
                <div className="gap-2 flex items-center">
                  <FileUp className="h-4 w-4" />
                  <span>Select Files</span>
                </div>
              </Button>
            </MultipleFilesUpload>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className={cn(className)} style={style}>
      <SelectedFilesForm {...props} />
      {selectFileNode}
    </div>
  );
}
