"use client";

import { useToast } from "@/hooks/use-toast.ts";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { isFimidaraEndpointError } from "../api/fimidaraEndpointUtils.ts";
import { kAppAccountPaths } from "../definitions/paths/account.ts";
import { kUserSessionStorageFns } from "../storage/UserSessionStorageFns.ts";
import { useRequestLogout } from "./session/useRequestLogout.ts";

const kTimeout = 3_000; // 3 seconds
const kMessageDuration = 10_000; // seconds

export function useHandleRequiresPasswordChange() {
  const { toast } = useToast();
  const { requestLogout } = useRequestLogout();

  const handleRequiresPasswordChange = useCallback(() => {
    setTimeout(() => {
      toast({
        title: "Logged Out",
        description:
          "An error occurred involving your session. " +
          "Because your account requires a password change, " +
          "we're going to log you out and route you to the change password page. " +
          "Please change your password to continue, thank you",
        duration: kMessageDuration,
      });
      kUserSessionStorageFns.clearData();
      requestLogout(kAppAccountPaths.forgotPassword);
    }, kTimeout);
  }, [requestLogout, toast]);

  return { handleRequiresPasswordChange };
}

export function useHandleLoginAgain() {
  const { toast } = useToast();
  const { requestLogout } = useRequestLogout();
  const pathname = usePathname();

  const handleLoginAgain = useCallback(() => {
    setTimeout(() => {
      toast({
        title: "Logged Out",
        description:
          "An error occurred involving your session, please login again, thank you",
        duration: kMessageDuration,
      });
      kUserSessionStorageFns.clearData();
      requestLogout(kAppAccountPaths.loginWithReturnPath(pathname));
    }, kTimeout);
  }, [requestLogout, toast, pathname]);

  return { handleLoginAgain };
}

export function useHandleServerRecommendedActions() {
  const { handleRequiresPasswordChange } = useHandleRequiresPasswordChange();
  const { handleLoginAgain } = useHandleLoginAgain();

  const handleServerRecommendedActions = useCallback(
    (error: unknown) => {
      if (!isFimidaraEndpointError(error)) return;

      const actions = error.errors.map((e) => e.action);
      const hasLogout = actions.includes("logout");
      const hasLoginAgain = actions.includes("loginAgain");
      const hasRequestPasswordChange = actions.includes(
        "requestChangePassword"
      );

      if (hasLogout || hasLoginAgain) {
        handleLoginAgain();
      } else if (hasRequestPasswordChange) {
        handleRequiresPasswordChange();
      }
    },
    [handleRequiresPasswordChange, handleLoginAgain]
  );

  return { handleServerRecommendedActions };
}
