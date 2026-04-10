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
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { INewPermissionGroupInput } from "@/lib/definitions/permissionGroups";
import { systemConstants } from "@/lib/definitions/system";
import {
  useWorkspacePermissionGroupAddMutationHook,
  useWorkspacePermissionGroupUpdateMutationHook,
} from "@/lib/hooks/mutationHooks";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers.ts";
import { systemValidation } from "@/lib/validation/system";
import { zodResolver } from "@hookform/resolvers/zod";
import { PermissionGroup } from "fimidara";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const permissionGroupValidation = z.object({
  name: systemValidation.name.min(1),
  description: systemValidation.description.optional(),
});

function getPermissionGroupFormInputFromPermissionGroup(
  item: PermissionGroup
): INewPermissionGroupInput {
  return {
    name: item.name,
    description: item.description,
  };
}

export interface IPermissionGroupFormProps {
  permissionGroup?: PermissionGroup;
  className?: string;
  workspaceId: string;
}

export default function PermissionGroupForm(props: IPermissionGroupFormProps) {
  const { permissionGroup, className, workspaceId } = props;
  const { toast } = useToast();
  const router = useRouter();
  const updateHook = useWorkspacePermissionGroupUpdateMutationHook({
    onSuccess(data, params) {
      toast({ title: "Permission group updated" });
      router.push(
        kAppWorkspacePaths.permissionGroup(
          data.permissionGroup.workspaceId,
          data.permissionGroup.resourceId
        )
      );
    },
  });
  const createHook = useWorkspacePermissionGroupAddMutationHook({
    onSuccess(data, params) {
      toast({ title: "Permission group created" });
      router.push(
        kAppWorkspacePaths.permissionGroup(
          data.permissionGroup.workspaceId,
          data.permissionGroup.resourceId
        )
      );
    },
  });
  const mergedHook = permissionGroup ? updateHook : createHook;

  const onSubmit = (body: z.infer<typeof permissionGroupValidation>) =>
    permissionGroup
      ? updateHook.runAsync({
          permissionGroupId: permissionGroup.resourceId,
          data: body,
        })
      : createHook.runAsync({
          workspaceId,
          ...body,
        });

  const form = useForm<z.infer<typeof permissionGroupValidation>>({
    resolver: zodResolver(permissionGroupValidation),
    defaultValues: permissionGroup
      ? getPermissionGroupFormInputFromPermissionGroup(permissionGroup)
      : { name: "" },
  });

  useFormHelpers(form, { errors: mergedHook.error });

  const nameNode = (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Permission Group Name</FormLabel>
          <FormControl>
            <div>
              <Input
                {...field}
                maxLength={systemConstants.maxNameLength}
                placeholder="Enter permission group name"
                autoComplete="off"
              />
              <InputCounter
                count={field.value?.length ?? 0}
                maxCount={systemConstants.maxNameLength}
                onTruncate={() => {
                  form.setValue(
                    "name",
                    field.value?.slice(0, systemConstants.maxNameLength)
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
                placeholder="Enter permission group description"
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
      >
        <FormAlert error={mergedHook.error} />
        <div className="space-y-4">
          {nameNode}
          {descriptionNode}
        </div>
        <div>
          <Button type="submit" loading={mergedHook.loading} className="w-full">
            {permissionGroup
              ? "Update Permission Group"
              : "Create Permission Group"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
