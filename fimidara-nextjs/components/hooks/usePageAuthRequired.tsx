"use client";

import { toast } from "@/hooks/use-toast.ts";
import { callRmCookieEndpoint } from "@/lib/api/account/rm-cookie.ts";
import { fimidxConsoleLogger } from "@/lib/common/logger/fimidx-console-logger.ts";
import { kAppAccountPaths } from "@/lib/definitions/paths/account.ts";
import { kDefaultRedirectingQueryKey } from "@/lib/definitions/paths/root.ts";
import { useLogout } from "@/lib/hooks/session/useLogout.ts";
import { useSessionStore } from "@/lib/hooks/session/useSessionStore";
import { useUserLoggedIn } from "@/lib/hooks/session/useUserLoggedIn.ts";
import { isNil } from "lodash-es";
import { signOut } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactElement, useEffect, useRef } from "react";
import { useStateHistory } from "./useStateHistory.tsx";

const defaultOnRedirecting = (): ReactElement => <></>;

export interface WithPageAuthRequiredOptions {
  returnTo?: string;
  renderRedirecting?: () => ReactElement;
  render: () => ReactElement;
}

export const usePageAuthRequired = (options: WithPageAuthRequiredOptions) => {
  const {
    returnTo,
    render,
    renderRedirecting = defaultOnRedirecting,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLogoutRequested, routeToOnLogout, set } = useSessionStore();
  const { isLoggedIn } = useUserLoggedIn();
  const { logout } = useLogout();
  const trackedLoggedIn = useStateHistory({
    state: isLoggedIn,
    maxHistorySize: 2,
  });

  const isRedirecting =
    searchParams.get(kDefaultRedirectingQueryKey) === "true";
  const setRef = useRef(set);
  useEffect(() => {
    if (isLogoutRequested && !isRedirecting) {
      const toastControl = toast({ title: "Logging out..." });
      callRmCookieEndpoint()
        .catch(fimidxConsoleLogger.error.bind(fimidxConsoleLogger))
        .finally(() => toastControl.dismiss())
        .then(() => {
          logout();
          setRef.current({
            isLogoutRequested: false,
            routeToOnLogout: undefined,
          });
          signOut({
            redirectTo: kAppAccountPaths.appendRedirectingQueryKey(
              routeToOnLogout || kAppAccountPaths.login
            ),
          });
        });
    }
  }, [isLogoutRequested, logout, routeToOnLogout, pathname, isRedirecting]);

  useEffect(() => {
    // Only transition to login if logged in state is newly decided to be false,
    // so this should only run once
    if (
      isNil(trackedLoggedIn.previousState) &&
      trackedLoggedIn.state === false &&
      !isRedirecting
    ) {
      const returnToPath = returnTo || pathname;
      const loginPath = kAppAccountPaths.loginWithReturnPath(returnToPath);
      if (!pathname.includes(kAppAccountPaths.login)) {
        const toastControl = toast({ title: "Logging out..." });
        callRmCookieEndpoint()
          .catch(fimidxConsoleLogger.error.bind(fimidxConsoleLogger))
          .finally(() => toastControl.dismiss())
          .then(() => {
            const finalLoginPath =
              kAppAccountPaths.appendRedirectingQueryKey(loginPath);
            router.push(finalLoginPath);
          });
      }
    }
  }, [
    trackedLoggedIn.state,
    trackedLoggedIn.previousState,
    returnTo,
    pathname,
    router,
    isRedirecting,
  ]);

  if (isLoggedIn === undefined) {
    return null;
  } else if (isLoggedIn) {
    return render();
  } else {
    return renderRedirecting();
  }
};
