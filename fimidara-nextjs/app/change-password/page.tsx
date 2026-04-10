"use client";

import { useLoggedInReturnTo } from "@/components/hooks/useLoggedInReturnTo.tsx";
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
import { FormAlert } from "@/components/utils/FormAlert.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import { systemConstants } from "@/lib/definitions/system.ts";
import { kUserConstants } from "@/lib/definitions/user.ts";
import { useUserChangePasswordWithTokenMutationHook } from "@/lib/hooks/mutationHooks.ts";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export interface IChangePasswordWithTokenFormData {
  password: string;
}

interface IChangePasswordWithTokenFormInternalData
  extends IChangePasswordWithTokenFormData {
  // confirmPassword: string;
}

export interface IChangePasswordWithTokeneProps {}

const formSchema = z.object({
  password: z
    .string()
    .min(kUserConstants.minPasswordLength)
    .max(kUserConstants.maxPasswordLength),
});

export default function ChangePasswordWithToken(
  props: IChangePasswordWithTokeneProps
) {
  const router = useRouter();
  const { toast } = useToast();
  const returnTo = useLoggedInReturnTo();
  const changePasswordHook = useUserChangePasswordWithTokenMutationHook({
    onSuccess(data, params) {
      router.push(returnTo);
    },
  });
  const onSubmit = async (body: z.infer<typeof formSchema>) => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get(systemConstants.tokenQueryKey);

    if (!token) {
      toast({
        title: "Change password token not found",
        description:
          "Please ensure you are using the change password link sent to your email address",
      });

      return;
    }

    return await changePasswordHook.runAsync(body, { authToken: token });
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  useFormHelpers(form, { errors: changePasswordHook.error });

  const passwordNode = (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Password</FormLabel>
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

  return (
    <div className={styles.formBody}>
      <div className={cn(styles.formContentWrapper, "p-4")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <h2 className="text-xl">Change Password</h2>
            <FormAlert error={changePasswordHook.error} />
            {passwordNode}
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
