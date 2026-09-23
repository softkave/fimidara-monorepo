"use client";

import { kClientPaths } from "@/lib/definitions/paths/clientPath.ts";
import { signIn } from "next-auth/react";
import { useLoggedInReturnTo } from "../hooks/useLoggedInReturnTo.tsx";
import { GoogleIcon } from "../icons/google.tsx";
import { Button } from "../ui/button.tsx";
import { cn } from "../utils.ts";

export interface IGoogleSignInClientProps {
  redirectTo?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  variant?: "default" | "outline";
  showIcon?: boolean;
}

export default function GoogleSignInClient(props: IGoogleSignInClientProps) {
  const { className, iconClassName, textClassName, variant = "outline", showIcon = true } = props;
  const returnTo = useLoggedInReturnTo({
    defaultReturnTo: props.redirectTo,
  });

  return (
    <Button
      onClick={() =>
        signIn("google", { redirectTo: kClientPaths.withURL(returnTo) })
      }
      variant={variant}
      className={cn(className, "gap-4 font-normal")}
    >
      {showIcon && <GoogleIcon className={cn("size-4", iconClassName)} />}
      <span className={cn("flex-1", textClassName)}>Sign-in with Google</span>
    </Button>
  );
}
