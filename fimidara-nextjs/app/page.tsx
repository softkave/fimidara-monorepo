import GitHubSignInServer from "@/components/account/github-sign-in-server.tsx";
import GoogleSignInServer from "@/components/account/google-sign-in-server.tsx";
import { WebLayout } from "@/components/utils/WebLayout.tsx";
import {
  kFeatureListItems,
  WebFeatureList,
} from "@/components/web/web-feature-list";
import { WebFooter } from "@/components/web/web-footer";
import { kAppRootPaths } from "@/lib/definitions/paths/root.ts";
import Link from "next/link";

const Home = async () => {
  return (
    <WebLayout
      isDocs={false}
      shouldRedirectToWorkspace={true}
      contentClassName="space-y-32 max-w-full p-0"
    >
      <div className="mt-32 space-y-8 p-6 md:p-8">
        <h1 className="text-2xl text-center max-w-md mx-auto w-full">
          fimidara
        </h1>
        <p className="text-3xl md:text-4xl text-center max-w-md mx-auto w-full">
          <span className="font-medium">Reliable Storage </span>
          <span className="text-muted-foreground">for </span>
          <br />
          <span className="font-medium">Software Engineers </span>
        </p>
        <div className="flex flex-col md:flex-row gap-2 !mt-8 w-full max-w-[256px] md:max-w-md mx-auto items-center md:justify-center">
          <GoogleSignInServer
            className="flex-1 w-full"
            variant="default"
            showIcon={false}
            buttonClassName="w-full"
          />
          <GitHubSignInServer
            className="flex-1 w-full"
            variant="default"
            showIcon={false}
            buttonClassName="w-full"
          />
        </div>
        <p className="text-center text-sm text-muted-foreground !mt-4">
          <Link href={kAppRootPaths.pricing} className="underline">
            Pricing — free for now
          </Link>
        </p>
        <div className="flex flex-col items-center justify-center">
          <img
            src="https://api.fimidara.com/v1/files/readFile/softkave/public/fimidara-landing.png"
            alt="fimidara"
            className="w-full h-full object-cover rounded-lg shadow-lg max-w-4xl border-2 border-gray-200"
          />
        </div>
      </div>
      <WebFeatureList items={kFeatureListItems} className="p-6 md:p-8" />
      <WebFooter className="p-6 pb-4 md:p-8 md:pb-4" />
    </WebLayout>
  );
};

export default Home;
