import { WebLayout } from "@/components/utils/WebLayout.tsx";
import { WebFooter } from "@/components/web/web-footer";
import { kAppRootPaths } from "@/lib/definitions/paths/root.ts";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "fimidara — pricing",
  description: "fimidara is free for now",
};

export default function PricingPage() {
  return (
    <WebLayout
      isDocs={false}
      shouldRedirectToWorkspace={false}
      contentClassName="space-y-32 max-w-full p-0"
    >
      <div className="mt-24 space-y-6 p-6 md:p-8 max-w-lg mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="text-lg text-muted-foreground">
          <span className="font-medium text-foreground">fimidara is free for now.</span>{" "}
          There is no billing and no usage locks while we finish the product.
        </p>
        <p className="text-sm text-muted-foreground">
          We already track usage (storage and bandwidth) so you can monitor
          consumption. When paid plans ship, workspaces are expected to include
          about <strong className="text-foreground">$10 USD</strong> of free
          usage per month. Category pricing and enforcement details will be
          announced later.
        </p>
        <p className="text-sm text-muted-foreground">
          Questions or higher limits once billing is live? Contact{" "}
          <a
            href="mailto:abayomi@softkave.com"
            className="underline text-foreground"
          >
            abayomi@softkave.com
          </a>
          .
        </p>
        <p className="text-sm">
          <Link href={kAppRootPaths.home} className="underline">
            Back to home
          </Link>
        </p>
      </div>
      <WebFooter className="p-6 pb-4 md:p-8 md:pb-4" />
    </WebLayout>
  );
}
