import { kClientPaths } from "@/lib/definitions/paths/clientPath.ts";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { useServerUserLoggedIn } from "@/lib/hooks/session/useServerUserLoggedIn.ts";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { use } from "react";
import { DocsSideNav } from "../docs/DocsSideNav.tsx";
import WebHeader from "../web/WebHeader.tsx";
import { MaybeScroll } from "../internal/maybe-scroll.tsx";

export interface IWebLayoutProps {
  isDocs: boolean;
  shouldRedirectToWorkspace: boolean;
  children?: React.ReactNode;
  contentClassName?: string;
}

export const WebLayout = (props: IWebLayoutProps) => {
  const { children, isDocs, shouldRedirectToWorkspace } = props;
  const isLoggedIn = use(useServerUserLoggedIn());

  if (isLoggedIn && shouldRedirectToWorkspace) {
    return redirect(kClientPaths.withURL(kAppWorkspacePaths.workspaces));
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      {isDocs && <DocsSideNav />}
      <div className="@container flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <WebHeader />
        <MaybeScroll className="min-h-0 flex-1">
          <div
            className={cn(
              "mx-auto w-full max-w-4xl flex-1 p-4",
              props.contentClassName
            )}
          >
            {children}
          </div>
        </MaybeScroll>
      </div>
    </div>
  );
};
