"use client";

import OAuthSignInClient from "@/components/account/oauth-sign-in.tsx";
import { useLoggedInReturnTo } from "@/components/hooks/useLoggedInReturnTo.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { cn } from "@/components/utils.ts";
import styles from "@/components/utils/form/form.module.css";
import { FormAlert } from "@/components/utils/FormAlert.tsx";
import { kUserConstants } from "@/lib/definitions/user.ts";
import { useUserLoginMutationHook } from "@/lib/hooks/mutationHooks/useUserLoginMutationHook.ts";
import { useFormHelpers } from "@/lib/hooks/useFormHelpers.ts";
import { kUserSessionStorageFns } from "@/lib/storage/UserSessionStorageFns";
import { zodResolver } from "@hookform/resolvers/zod";
import { isBoolean, omit } from "lodash-es";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export interface ILoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface ILoginProps {}

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(kUserConstants.maxPasswordLength),
  remember: z.boolean().optional(),
});

export default function Login(props: ILoginProps) {
  const router = useRouter();
  const returnTo = useLoggedInReturnTo();
  const loginHook = useUserLoginMutationHook({
    onSuccess(data, params) {
      router.push(returnTo);
    },
  });

  const onSubmit = async (body: z.infer<typeof formSchema>) => {
    const result = await loginHook.runAsync({
      email: body.email,
      password: body.password,
    });

    if (body.remember) {
      kUserSessionStorageFns.setData({
        jwtToken: result.jwtToken,
        clientJwtToken: result.clientJwtToken,
        refreshToken: result.refreshToken,
        jwtTokenExpiresAt: result.jwtTokenExpiresAt,
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useFormHelpers(form, { errors: loginHook.error });

  const emailNode = (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Email Address</FormLabel>
          <FormControl>
            <Input
              {...field}
              autoComplete="email"
              placeholder="Enter your email address"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

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
              autoComplete="current-password"
              placeholder="Enter your password"
              maxLength={kUserConstants.maxPasswordLength}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const rememberNode = (
    <FormField
      control={form.control}
      name="remember"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                {...omit(field, ["value"])}
                checked={field.value}
                onCheckedChange={(state) => {
                  if (isBoolean(state)) form.setValue("remember", state);
                }}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember Me
              </label>
            </div>
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
            <h2 className="text-xl">Login</h2>
            <FormAlert error={loginHook.error} />
            <div className="space-y-4">
              {emailNode}
              {passwordNode}
              {rememberNode}
            </div>
            <div>
              <Button
                type="submit"
                loading={loginHook.loading}
                className="w-full"
              >
                Login
              </Button>
            </div>
          </form>
        </Form>
        <Separator className="my-8" />
        <OAuthSignInClient className="w-full" />
      </div>
    </div>
  );
}
