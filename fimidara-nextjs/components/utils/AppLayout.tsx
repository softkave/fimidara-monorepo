"use client";

import { Suspense } from "react";
import AppHeader from "../app/AppHeader.tsx";
import FimidaraSideNav from "../app/FimidaraSideNav.tsx";
import { usePageAuthRequired } from "../hooks/usePageAuthRequired.tsx";
import { MaybeScroll } from "../internal/maybe-scroll.tsx";
import { cn } from "../utils.ts";

export interface IAppLayoutProps {
  children?: React.ReactNode;
  contentClassName?: string;
}

const AppLayoutImpl = (props: IAppLayoutProps) => {
  const { children, contentClassName } = props;

  return usePageAuthRequired({
    render() {
      return (
        <div className="flex h-screen max-h-screen overflow-hidden">
          <FimidaraSideNav />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <AppHeader />
            <MaybeScroll className="min-h-0 flex-1">
              <div
                className={cn(
                  "mx-auto w-full max-w-lg flex-1 p-4",
                  contentClassName
                )}
              >
                {children}
              </div>
            </MaybeScroll>
          </div>
        </div>
      );
    },
  });
};

export const AppLayout = (props: IAppLayoutProps) => {
  return (
    <Suspense fallback={null}>
      <AppLayoutImpl {...props} />
    </Suspense>
  );
};
