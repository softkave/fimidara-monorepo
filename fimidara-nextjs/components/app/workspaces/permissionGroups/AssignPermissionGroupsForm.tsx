import { MaybeScroll } from "@/components/internal/maybe-scroll";
import { Button } from "@/components/ui/button.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form.tsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import { FormAlert } from "@/components/utils/FormAlert";
import { StyleableComponentProps } from "@/components/utils/styling/types";
import { useToast } from "@/hooks/use-toast.ts";
import { kPermissionGroupConstants } from "@/lib/definitions/permissionGroups";
import {
  useMergeMutationHookStates,
  useWorkspacePermissionGroupAssignMutationHook,
  useWorkspacePermissionGroupUnassignMutationHook,
} from "@/lib/hooks/mutationHooks";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers.ts";
import { indexArray } from "@/lib/utils/indexArray";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PermissionGroupListContainer from "./PermissionGroupListContainer";

type AssignPermissionGroupsFormValues = {
  permissionGroups: string[];
};

const validationSchema = z.object({
  permissionGroups: z
    .array(z.string(), { required_error: "permission groups is required" })
    .max(kPermissionGroupConstants.maxAssignedPermissionGroups, {
      message: `${kPermissionGroupConstants.maxAssignedPermissionGroups} max chars`,
    }),
});

export interface IAssignPermissionGroupsFormProps
  extends StyleableComponentProps {
  entityId: string;
  workspaceId: string;
  permissionGroups: string[];
  onClose: () => void;
  onCompleteSubmit: () => void;
}

export default function AssignPermissionGroupsForm(
  props: IAssignPermissionGroupsFormProps
) {
  const {
    entityId,
    permissionGroups,
    className,
    style,
    workspaceId,
    onClose,
    onCompleteSubmit,
  } = props;
  const { toast } = useToast();

  const assignHook = useWorkspacePermissionGroupAssignMutationHook();
  const unassignHook = useWorkspacePermissionGroupUnassignMutationHook();
  const mergedHook = useMergeMutationHookStates(assignHook, unassignHook);

  const onSubmit = async (body: AssignPermissionGroupsFormValues) => {
    const initialPgsMap = indexArray(permissionGroups);
    const assignedPgsMap = indexArray(body.permissionGroups);
    const unassignedPgs = permissionGroups.filter(
      (pgId) => !assignedPgsMap[pgId]
    );
    const assignedPgs = body.permissionGroups.filter(
      (pgId) => !initialPgsMap[pgId]
    );

    // TODO: should we have different runs for assign and unassign?
    await Promise.all([
      assignedPgs.length &&
        assignHook.runAsync({
          workspaceId,
          entityId: [entityId],
          permissionGroupId: assignedPgs,
        }),
      unassignedPgs.length &&
        unassignHook.runAsync({
          workspaceId,
          entityId: [entityId],
          permissionGroupId: unassignedPgs,
        }),
    ]);

    if (assignedPgs.length || unassignedPgs.length) {
      toast({ title: "Assigned permission groups updated" });
    }

    onCompleteSubmit();
    onClose();
  };

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: { permissionGroups },
  });

  useFormHelpers(form, { errors: mergedHook.error });

  const wPermissionGroups = form.watch("permissionGroups");
  const selectedMap = useMemo(() => {
    return indexArray(wPermissionGroups, {
      reducer: (item) => true,
    });
  }, [wPermissionGroups]);

  const permissionGroupsNode = (
    <FormField
      control={form.control}
      name="permissionGroups"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <PermissionGroupListContainer
              withCheckbox
              workspaceId={workspaceId}
              selectedMap={selectedMap}
              onSelect={(pg) => {
                const idList = [...wPermissionGroups];
                const i = idList.indexOf(pg.resourceId);

                if (i === -1) idList.push(pg.resourceId);
                else idList.splice(i, 1);

                form.setValue("permissionGroups", idList);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const mainNode = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormAlert error={mergedHook.error} />
        <div className="space-y-4">{permissionGroupsNode}</div>
        <div>
          <Button type="submit" loading={mergedHook.loading} className="w-full">
            Update
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full max-w-[420px] p-0">
        <MaybeScroll>
          <SheetHeader className="p-6 space-y-2">
            <SheetTitle>Assign Permission Groups</SheetTitle>
          </SheetHeader>
          <div className="p-6 pt-0">{mainNode}</div>
        </MaybeScroll>
      </SheetContent>
    </Sheet>
  );
}
