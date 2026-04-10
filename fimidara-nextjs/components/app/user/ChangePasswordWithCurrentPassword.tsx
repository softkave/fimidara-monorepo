"use client";

import { Button } from "@/components/ui/button.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/components/utils.ts";
import styles from "@/components/utils/form/form.module.css";
import { useToast } from "@/hooks/use-toast.ts";
import { kUserConstants } from "@/lib/definitions/user";
import { useUserChangePasswordWithCurrentPasswordMutationHook } from "@/lib/hooks/mutationHooks";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormAlert } from "../../utils/FormAlert";

const validationSchema = z.object({
  password: z
    .string()
    .min(kUserConstants.minPasswordLength)
    .max(kUserConstants.maxPasswordLength),
  currentPassword: z
    .string({ required_error: "current password is required" })
    .min(1),
});

export default function ChangePasswordWithCurrentPassword() {
  const { toast } = useToast();
  const changePasswordHook =
    useUserChangePasswordWithCurrentPasswordMutationHook({
      onSuccess(data, params) {
        toast({ title: "Password changed" });
      },
    });

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      password: "",
      currentPassword: "",
    },
  });

  const onSubmit = (body: z.infer<typeof validationSchema>) => {
    return changePasswordHook.runAsync(body);
  };

  useFormHelpers(form, { errors: changePasswordHook.error });

  const newPasswordNode = (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>New Password</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              maxLength={kUserConstants.maxPasswordLength}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const currentPasswordNode = (
    <FormField
      control={form.control}
      name="currentPassword"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Current Password</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="password"
              autoComplete="current-password"
              placeholder="Enter current password"
              maxLength={kUserConstants.maxPasswordLength}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className={styles.formBody}>
      <div className={cn(styles.formContentWrapper, "py-4")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormAlert error={changePasswordHook.error} />
            <div className="space-y-4">
              {currentPasswordNode}
              {newPasswordNode}
            </div>
            <div>
              <Button
                type="submit"
                loading={changePasswordHook.loading}
                className="w-full"
              >
                Change Password
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
