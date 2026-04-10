import { Button } from "@/components/ui/button.tsx";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { InputCounter } from "@/components/ui/input-counter.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { cn } from "@/components/utils.ts";
import { StyleableComponentProps } from "@/components/utils/styling/types.ts";
import { useToast } from "@/hooks/use-toast.ts";
import { folderConstants } from "@/lib/definitions/folder";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { systemConstants } from "@/lib/definitions/system";
import {
  useWorkspaceAddMutationHook,
  useWorkspaceUpdateMutationHook,
} from "@/lib/hooks/mutationHooks";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers";
import { systemValidation } from "@/lib/validation/system";
import { workspaceValidationParts } from "@/lib/validation/workspace";
import { zodResolver } from "@hookform/resolvers/zod";
import { Workspace } from "fimidara";
import { AddWorkspaceEndpointParams } from "fimidara-private-js-sdk";
import { CircleChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormAlert } from "../../utils/FormAlert";
import { getRootnameFromName } from "./utils";

const formSchema = z.object({
  name: systemValidation.name.min(1),
  rootname: workspaceValidationParts.rootname.min(1),
  description: systemValidation.description.optional(),
});

function getWorkspaceFormInputFromWorkspace(
  item: Workspace
): AddWorkspaceEndpointParams {
  return {
    name: item.name,
    rootname: item.rootname,
    description: item.description,
  };
}

export interface WorkspaceFormProps extends StyleableComponentProps {
  workspace?: Workspace;
}

export default function WorkspaceForm(props: WorkspaceFormProps) {
  const { workspace, className, style } = props;
  const { toast } = useToast();
  const router = useRouter();
  const updateHook = useWorkspaceUpdateMutationHook({
    onSuccess(data, params) {
      toast({ title: "Workspace updated" });
    },
  });
  const createHook = useWorkspaceAddMutationHook({
    onSuccess(data, params) {
      toast({ title: "Workspace created" });
      router.push(kAppWorkspacePaths.folderList(data.workspace.resourceId));
    },
  });
  const stateHook = workspace ? updateHook : createHook;
  const onSubmit = async (body: z.infer<typeof formSchema>) =>
    workspace
      ? await updateHook.runAsync({
          workspaceId: workspace.resourceId,
          workspace: body,
        })
      : await createHook.runAsync(body);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: workspace
      ? getWorkspaceFormInputFromWorkspace(workspace)
      : { name: "", rootname: "" },
  });

  useFormHelpers(form, { errors: stateHook.error });

  const wName = form.watch("name");

  const nameNode = (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Workspace Name</FormLabel>
          <FormControl>
            <div>
              <Input
                {...field}
                maxLength={systemConstants.maxNameLength}
                placeholder="Enter workspace name"
                autoComplete="off"
              />
              <InputCounter
                count={field.value.length}
                maxCount={systemConstants.maxNameLength}
                onTruncate={() => {
                  form.setValue(
                    "name",
                    field.value.slice(0, systemConstants.maxNameLength)
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

  const rootnameNode = (
    <FormField
      control={form.control}
      name="rootname"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Workspace Root Name</FormLabel>
          <FormControl>
            <div>
              <Input
                {...field}
                disabled={field.disabled || !!workspace}
                placeholder="Enter workspace root name"
                maxLength={folderConstants.maxFolderNameLength}
                autoComplete="off"
              />
              <InputCounter
                count={field.value?.length ?? 0}
                maxCount={folderConstants.maxFolderNameLength}
                onTruncate={() => {
                  form.setValue(
                    "rootname",
                    field.value?.slice(0, folderConstants.maxFolderNameLength)
                  );
                }}
                className="mt-1"
              />
              {!workspace && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    form.setValue("rootname", getRootnameFromName(wName));
                  }}
                  className="space-x-2 flex px-0"
                  disabled={!wName}
                >
                  <CircleChevronRight className="h-4 w-4" />
                  <span>Auto-fill from workspace name</span>
                </Button>
              )}
            </div>
          </FormControl>
          <FormDescription>
            Used for namespacing when working with files and folders. For{" "}
            example &quot;my-workspace-root-name/my-folder/my-file.txt&quot;
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const descriptionNode = (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <div>
              <Textarea
                {...field}
                name="description"
                placeholder="Enter workspace description"
                maxLength={systemConstants.maxDescriptionLength}
              />
              <InputCounter
                count={field.value?.length || 0}
                maxCount={systemConstants.maxDescriptionLength}
                onTruncate={() => {
                  form.setValue(
                    "description",
                    field.value?.slice(0, systemConstants.maxDescriptionLength)
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
        style={style}
      >
        <FormAlert error={stateHook.error} />
        <div className="space-y-4">
          {nameNode}
          {rootnameNode}
          {descriptionNode}
        </div>
        <div>
          <Button type="submit" loading={stateHook.loading} className="w-full">
            {workspace ? "Update Workspace" : "Create Workspace"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
