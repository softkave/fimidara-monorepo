import {
  SingleFileUpload,
  type UploadFile,
} from "@/components/internal/upload";
import { Button } from "@/components/ui/button.tsx";
import {
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
import { StyleableComponentProps } from "@/components/utils/styling/types";
import { folderConstants } from "@/lib/definitions/folder.ts";
import { systemConstants } from "@/lib/definitions/system";
import { values } from "lodash-es";
import { FileUp } from "lucide-react";
import prettyBytes from "pretty-bytes";
import { UseFormReturn } from "react-hook-form";
import { pathExtension } from "softkave-js-utils";
import { z } from "zod";
import { SingleFileFormValue } from "./types";
import {
  getFirstFoldername,
  normalizeFimidaraName,
  replaceBaseFoldername,
} from "./utils";
import { fileFormValidationSchema } from "./validation.ts";

export interface SingleFileFormProps extends StyleableComponentProps {
  isDirectory?: boolean;
  index: number;
  form: UseFormReturn<z.infer<typeof fileFormValidationSchema>>;
  isExistingFile: boolean;
  beforeUpdateModifyName?: (name: string) => string;
}

const kFileMessages = {
  nameLabel: "File Name",
  invalidNameError: "Name can include the file's extension, e.g image.png",
  namePlaceholder: "Enter file name",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Enter file description",
  existingFileButtonTitle: "Replace File",
  newFileButtonTitle: "Select File",
  autofillText: (name: string) => (
    <div className="inline-flex flex-wrap">
      <span>Use&nbsp;</span>
      <strong className="underline whitespace-normal text-left break-words">
        {name}
      </strong>
      &nbsp;
      <span>from selected file</span>
    </div>
  ),
} as const;

export function SingleFileForm(props: SingleFileFormProps) {
  const {
    form,
    index,
    style,
    className,
    isDirectory,
    isExistingFile,
    beforeUpdateModifyName,
  } = props;
  const messages = kFileMessages;
  const wFiles = form.watch("files");

  const entry = wFiles[index];
  const selectedFileName = entry?.file?.name;
  const normalizedSelectedFileName = selectedFileName
    ? (() => {
        const normalized = normalizeFimidaraName(selectedFileName);
        if (!normalized) {
          return undefined;
        }
        return beforeUpdateModifyName?.(normalized) || normalized;
      })()
    : undefined;
  const nameNode = (
    <FormField
      control={form.control}
      name={`files.${index}.name`}
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel required>{messages.nameLabel}</FormLabel>
            <FormControl>
              <div>
                <Input
                  {...field}
                  maxLength={folderConstants.maxFolderNameLength}
                  placeholder={messages.namePlaceholder}
                  disabled={field.disabled || isExistingFile}
                  autoComplete="off"
                  onChange={(evt) => {
                    const value = evt.target.value;
                    const name = beforeUpdateModifyName?.(value) || value;
                    form.setValue(`files.${index}.name`, name);
                  }}
                />
                <InputCounter
                  count={field.value?.length ?? 0}
                  maxCount={folderConstants.maxFolderNameLength}
                  onTruncate={() => {
                    const extName = pathExtension({ input: field.value });
                    const truncatedName =
                      field.value?.slice(
                        /** start */ 0,
                        folderConstants.maxFolderNameLength -
                          extName.length -
                          /** dot */ 1
                      ) +
                      /** extension dot */ "." +
                      extName;

                    form.setValue(`files.${index}.name`, truncatedName);
                  }}
                  className="mt-1"
                />
                {normalizedSelectedFileName && (
                  <Button
                    variant="link"
                    onClick={() => {
                      form.setValue(
                        `files.${index}.name`,
                        normalizedSelectedFileName
                      );
                    }}
                    type="button"
                    className="h-auto pl-0 pr-0"
                  >
                    {messages.autofillText(normalizedSelectedFileName)}
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
      name={`files.${index}.description`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <div>
              <Textarea
                {...field}
                value={field.value || ""}
                placeholder={messages.descriptionPlaceholder}
                maxLength={systemConstants.maxDescriptionLength}
              />
              <InputCounter
                count={field.value?.length || 0}
                maxCount={folderConstants.maxFolderNameLength}
                onTruncate={() => {
                  form.setValue(
                    `files.${index}.description`,
                    field.value?.slice(0, folderConstants.maxFolderNameLength)
                  );
                }}
                className="mt-1"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // TODO: include max file size
  const selectFileNode = (
    <FormField
      control={form.control}
      name={`files.${index}.file`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <SingleFileUpload
              disabled={field.disabled}
              value={field.value ? [field.value] : []}
              onFileSelect={(uploadFile: UploadFile) => {
                const existingBaseFoldername =
                  isDirectory && values?.name
                    ? getFirstFoldername([values.name])
                    : undefined;
                const name = isExistingFile
                  ? values.name
                  : normalizeFimidaraName(
                      isDirectory
                        ? uploadFile.webkitRelativePath || uploadFile.name
                        : uploadFile.name
                    );

                type ValuesType = [
                  Partial<SingleFileFormValue> &
                    Pick<SingleFileFormValue, "name">
                ];
                let newValues: ValuesType = [{ file: uploadFile, name }];

                if (existingBaseFoldername) {
                  newValues = replaceBaseFoldername(
                    newValues,
                    existingBaseFoldername
                  ) as ValuesType;
                }

                form.setValue(`files.${index}.file`, newValues[0]);
              }}
              showFileList={false}
              showUploadButton={true}
            >
              <div className="space-x-4">
                <Button
                  title={
                    field.value
                      ? messages.existingFileButtonTitle
                      : messages.newFileButtonTitle
                  }
                  type="button"
                  variant="outline"
                >
                  <div className="space-x-2 flex items-center">
                    <FileUp className="h-4 w-4" />
                    <span>
                      {field.value
                        ? messages.existingFileButtonTitle
                        : messages.newFileButtonTitle}
                    </span>
                  </div>
                </Button>
                {field.value ? (
                  <span className="text-secondary">
                    {prettyBytes(field.value.size)}
                  </span>
                ) : null}
              </div>
            </SingleFileUpload>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // TODO: should "uploading files progress" below open the progress drawer on
  // click?
  return (
    <div className={cn(className, "space-y-8")} style={style}>
      {nameNode}
      {descriptionNode}
      {selectFileNode}
    </div>
  );
}
