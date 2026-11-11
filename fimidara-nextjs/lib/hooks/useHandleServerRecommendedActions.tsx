"use client";

import { useToast } from "@/hooks/use-toast.ts";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { isFimidaraEndpointError } from "../api/fimidaraEndpointUtils.ts";
import { kAppAccountPaths } from "../definitions/paths/account.ts";
import { kUserSessionStorageFns } from "../storage/UserSessionStorageFns.ts";
import { isJwtExpired } from "../utils/jwt.ts";
import { useUserSessionFetchStore } from "./fetchStores/session.ts";
import { useRequestLogout } from "./session/useRequestLogout.ts";

const kTimeout = 3_000; // 3 seconds
const kMessageDuration = 10_000; // seconds

let pendingLoginAgainTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingPasswordChangeTimeout: ReturnType<typeof setTimeout> | null = null;

function hasFreshSession(): boolean {
  const [state0] = useUserSessionFetchStore.getState().states;
  const bearer = state0?.[1]?.data?.other?.refresh?.getBearerToken?.();
  if (bearer && !isJwtExpired(bearer)) {
    return true;
  }

  const stored = kUserSessionStorageFns.getData();
  return Boolean(stored.jwtToken && !isJwtExpired(stored.jwtToken));
}

/** Cancel deferred logout/login-again timers (e.g. after a successful login). */
export function cancelPendingSessionActions() {
  if (pendingLoginAgainTimeout) {
    clearTimeout(pendingLoginAgainTimeout);
    pendingLoginAgainTimeout = null;
  }
  if (pendingPasswordChangeTimeout) {
    clearTimeout(pendingPasswordChangeTimeout);
    pendingPasswordChangeTimeout = null;
  }
}

export function useHandleRequiresPasswordChange() {
  const { toast } = useToast();
  const { requestLogout } = useRequestLogout();

  const handleRequiresPasswordChange = useCallback(() => {
    if (pendingPasswordChangeTimeout) {
      clearTimeout(pendingPasswordChangeTimeout);
    }

    pendingPasswordChangeTimeout = setTimeout(() => {
      pendingPasswordChangeTimeout = null;
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
    if (pendingLoginAgainTimeout) {
      clearTimeout(pendingLoginAgainTimeout);
    }

    pendingLoginAgainTimeout = setTimeout(() => {
      pendingLoginAgainTimeout = null;

      // A successful login may have landed while this timer was waiting.
      if (hasFreshSession()) {
        return;
      }

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
