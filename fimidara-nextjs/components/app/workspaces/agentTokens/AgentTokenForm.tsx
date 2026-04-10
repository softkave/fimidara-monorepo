import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/datepicker.tsx";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea.tsx";
import { cn } from "@/components/utils.ts";
import { FormAlert } from "@/components/utils/FormAlert";
import { useToast } from "@/hooks/use-toast.ts";
import { agentTokenConstants } from "@/lib/definitions/agentToken";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { systemConstants } from "@/lib/definitions/system";
import {
  useWorkspaceAgentTokenAddMutationHook,
  useWorkspaceAgentTokenUpdateMutationHook,
} from "@/lib/hooks/mutationHooks";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers";
import { systemValidation } from "@/lib/validation/system.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgentToken } from "fimidara";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OmitFrom } from "softkave-js-utils";
import { z } from "zod";

const formSchema = z.discriminatedUnion("shouldRefresh", [
  z.object({
    shouldRefresh: z.literal(false),
    refreshDuration: z.number().optional(),
    name: systemValidation.name.optional(),
    description: systemValidation.description.optional(),
    expiresAt: z.number().optional(),
    providedResourceId: z
      .string()
      .max(agentTokenConstants.providedResourceMaxLength, {
        message: `${agentTokenConstants.providedResourceMaxLength} max chars`,
      })
      .nullable()
      .optional(),
  }),
  z.object({
    shouldRefresh: z.literal(true),
    refreshDuration: z.number(),
    name: systemValidation.name.optional(),
    description: systemValidation.description.optional(),
    expiresAt: z.number().optional(),
    providedResourceId: z
      .string()
      .max(agentTokenConstants.providedResourceMaxLength, {
        message: `${agentTokenConstants.providedResourceMaxLength} max chars`,
      })
      .nullable()
      .optional(),
  }),
]);

function getAgentTokenFormInputFromToken(
  item: AgentToken
): z.infer<typeof formSchema> {
  const input: OmitFrom<z.infer<typeof formSchema>, "shouldRefresh"> & {
    shouldRefresh: boolean;
  } = {
    name: item.name,
    description: item.description,
    expiresAt: item.expiresAt,
    providedResourceId: item.providedResourceId || undefined,
    shouldRefresh: item.shouldRefresh || false,
    refreshDuration: item.refreshDuration,
  };

  return input as z.infer<typeof formSchema>;
}

export interface IAgentTokenFormProps {
  agentToken?: AgentToken;
  className?: string;
  workspaceId: string;
}

type RefreshDurationUnit =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "years";

function getRefreshDurationInMs(
  unit: RefreshDurationUnit,
  value: number
): number | undefined {
  if (value === 0) {
    return undefined;
  }

  return unit === "seconds"
    ? value * 1000
    : unit === "minutes"
    ? value * 60 * 1000
    : unit === "hours"
    ? value * 3600 * 1000
    : unit === "days"
    ? value * 86400 * 1000
    : unit === "weeks"
    ? value * 604800 * 1000
    : unit === "months"
    ? value * 2592000 * 1000
    : value * 31536000 * 1000;
}

export default function AgentTokenForm(props: IAgentTokenFormProps) {
  const { agentToken, className, workspaceId } = props;
  const { toast } = useToast();
  const router = useRouter();
  const [refreshDurationUnit, setRefreshDurationUnit] =
    useState<RefreshDurationUnit>("seconds");
  const updateHook = useWorkspaceAgentTokenUpdateMutationHook({
    onSuccess(data, params) {
      toast({ title: "Agent token updated" });
      router.push(
        kAppWorkspacePaths.agentToken(
          data.token.workspaceId,
          data.token.resourceId
        )
      );
    },
  });

  const createHook = useWorkspaceAgentTokenAddMutationHook({
    onSuccess(data, params) {
      toast({ title: "Agent token created" });
      router.push(
        kAppWorkspacePaths.agentToken(
          data.token.workspaceId,
          data.token.resourceId
        )
      );
    },
  });

  const mergedHook = agentToken ? updateHook : createHook;
  const onSubmit = (body: z.infer<typeof formSchema>) =>
    agentToken
      ? updateHook.runAsync({
          tokenId: agentToken.resourceId,
          token: {
            ...body,
            providedResourceId: body.providedResourceId || undefined,
            refreshDuration: getRefreshDurationInMs(
              refreshDurationUnit,
              body.refreshDuration || 0
            ),
          },
        })
      : createHook.runAsync({
          workspaceId,
          ...body,
          providedResourceId: body.providedResourceId || undefined,
          refreshDuration: getRefreshDurationInMs(
            refreshDurationUnit,
            body.refreshDuration || 0
          ),
        });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: agentToken
      ? getAgentTokenFormInputFromToken(agentToken)
      : { shouldRefresh: false },
  });

  useFormHelpers(form, { errors: mergedHook.error });

  const nameNode = (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Token Name</FormLabel>
          <FormControl>
            <div>
              <Input
                {...field}
                maxLength={systemConstants.maxNameLength}
                placeholder="Enter token name"
                autoComplete="off"
              />
              <InputCounter
                count={field.value?.length || 0}
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
                placeholder="Enter token description"
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

  const expiresNode = (
    <FormField
      control={form.control}
      name="expiresAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Expires</FormLabel>
          <FormControl>
            <div className="block">
              <DatePicker
                {...field}
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => {
                  form.setValue("expiresAt", date?.valueOf());
                }}
                className="w-full"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const providedResourceIdNode = (
    <FormField
      control={form.control}
      name="providedResourceId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Provided Resource ID</FormLabel>
          <FormControl>
            <div>
              <Textarea
                {...field}
                value={field.value || ""}
                placeholder="Enter token provided resource ID"
                maxLength={agentTokenConstants.providedResourceMaxLength}
              />
              <InputCounter
                count={field.value?.length || 0}
                maxCount={agentTokenConstants.providedResourceMaxLength}
                onTruncate={() => {
                  form.setValue(
                    "providedResourceId",
                    field.value?.slice(
                      0,
                      agentTokenConstants.providedResourceMaxLength
                    )
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

  const shouldRefreshNode = (
    <FormField
      control={form.control}
      name="shouldRefresh"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Should Refresh</FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shouldRefresh"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label
                htmlFor="shouldRefresh"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Should Refresh Generated JWT Token
              </label>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );

  const refreshDurationNode = (
    <FormField
      control={form.control}
      name="refreshDuration"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Refresh Duration</FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2 w-full">
              <Select
                value={refreshDurationUnit}
                onValueChange={(value) =>
                  setRefreshDurationUnit(value as RefreshDurationUnit)
                }
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
              <Input
                {...field}
                type="number"
                placeholder="Enter refresh duration"
                className="flex-1"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    field.onChange(undefined);
                  } else {
                    field.onChange(parseInt(value));
                  }
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const shouldRefresh = form.watch("shouldRefresh");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
      >
        <FormAlert error={mergedHook.error} />
        {nameNode}
        {providedResourceIdNode}
        {descriptionNode}
        {expiresNode}
        {shouldRefreshNode}
        {shouldRefresh ? refreshDurationNode : null}
        <div className="!mt-8">
          <Button type="submit" loading={mergedHook.loading} className="w-full">
            {agentToken ? "Update Token" : "Create Token"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
