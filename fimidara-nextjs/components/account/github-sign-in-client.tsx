"use client";

import { kClientPaths } from "@/lib/definitions/paths/clientPath.ts";
import { signIn } from "next-auth/react";
import { useLoggedInReturnTo } from "../hooks/useLoggedInReturnTo.tsx";
import { GithubIcon } from "../icons/github.tsx";
import { Button } from "../ui/button.tsx";
import { cn } from "../utils.ts";

export interface IGitHubSignInClientProps {
  redirectTo?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  size?: "icon" | "default" | "sm" | "lg";
  variant?: "default" | "outline";
  showIcon?: boolean;
}

export default function GitHubSignInClient(props: IGitHubSignInClientProps) {
  const {
    className,
    iconClassName,
    textClassName,
    size = "default",
    variant = "outline",
    showIcon = true,
  } = props;
  const returnTo = useLoggedInReturnTo({
    defaultReturnTo: props.redirectTo,
  });

  return (
    <Button
      onClick={() =>
        signIn("github", { redirectTo: kClientPaths.withURL(returnTo) })
      }
      variant={variant}
      className={cn(className, "gap-4 font-normal")}
      size={size}
    >
      {showIcon && <GithubIcon className={cn("size-4", iconClassName)} />}
      <span className={cn("flex-1", textClassName)}>Sign-in with GitHub</span>
    </Button>
  );
}
