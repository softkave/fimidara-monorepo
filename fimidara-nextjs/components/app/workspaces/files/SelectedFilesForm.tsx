import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import IconButton from "@/components/utils/buttons/IconButton.tsx";
import { StyleableComponentProps } from "@/components/utils/styling/types";
import { Trash2 } from "lucide-react";
import prettyBytes from "pretty-bytes";
import { FieldError, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { SingleFileForm } from "./SingleFileForm";
import { newFileValidationSchema } from "./validation.ts";

export const selectedFilesSchema = z.object({
  files: z.array(newFileValidationSchema),
});

export interface SelectedFilesFormProps extends StyleableComponentProps {
  form: UseFormReturn<z.infer<typeof selectedFilesSchema>>;
  isDirectory?: boolean;
  beforeUpdateModifyName?: (name: string) => string;
}

function getFirstErrorMessage(errors: Record<string, FieldError>) {
  const errorKeys = Object.keys(errors);
  return errorKeys.length ? errors[errorKeys[0]]?.message : undefined;
}

export function SelectedFilesForm(props: SelectedFilesFormProps) {
  const { form, className, style, isDirectory, beforeUpdateModifyName } = props;

  const wFiles = form.watch("files");

  const handleRemoveFile = (index: number) => {
    const update = wFiles.filter((nextValue, nextIndex) => nextIndex !== index);
    form.setValue("files", update);
    form.clearErrors(`files.${index}`);
  };

  // TODO: show file entry error in panel
  const panelNodes = wFiles.map((value, index) => {
    const errors = form.getFieldState(`files.${index}`)?.error;
    const errorMessage = getFirstErrorMessage(
      (errors || {}) as Record<string, FieldError>
    );

    return (
      <AccordionItem key={value.__localId} value={value.__localId}>
        <AccordionTrigger>
          <div className="grid grid-cols-[1fr_auto] items-center mr-2 gap-2 flex-1">
            <div className="flex flex-col items-start flex-1">
              <span className="text-left break-words">{value.name}</span>
              {errorMessage && (
                <span className="text-sm font-medium text-destructive text-left">
                  {errorMessage}
                </span>
              )}
            </div>
            <div className="gap-4 flex items-center">
              {value?.file ? (
                <span className="text-secondary">
                  {prettyBytes(value.file.size)}
                </span>
              ) : null}
              <IconButton
                onClick={() => handleRemoveFile(index)}
                icon={<Trash2 className="h-4 w-4" />}
              />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <SingleFileForm
            key={value.__localId}
            index={index}
            form={form}
            isExistingFile={!!value.resourceId}
            isDirectory={isDirectory}
            beforeUpdateModifyName={beforeUpdateModifyName}
          />
        </AccordionContent>
      </AccordionItem>
    );
  });

  const collapseNode = panelNodes.length ? (
    <div className="mb-4">
      <Accordion>
        {panelNodes}
      </Accordion>
    </div>
  ) : null;

  return (
    <div className={className} style={style}>
      {collapseNode}
    </div>
  );
}
