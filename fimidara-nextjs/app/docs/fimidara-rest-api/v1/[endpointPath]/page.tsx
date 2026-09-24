import HttpEndpointDoc from "@/components/docs/HttpEndpointDoc";
import { kDocNavRootKeysList } from "@/components/docs/navItems.tsx";
import PageNothingFound from "@/components/utils/page/PageNothingFound";
import { fimidxConsoleLogger } from "@/lib/common/logger";
import { systemConstants } from "@/lib/definitions/system";
import { promises } from "fs";
import { last } from "lodash-es";
import { MfdocHttpEndpointDefinitionTypePrimitive } from "mfdoc/mfdoc-core";
import path from "path";

interface FimidaraRestApiEndpointDocPageProps {
  params: Promise<{ endpointPath: string }>;
}

async function getEndpointInfo(endpointPath: string) {
  try {
    if (endpointPath) {
      const s1 = endpointPath
        .split("__")
        .filter((p) => !(kDocNavRootKeysList as string[]).includes(p));
      const s2 = s1.slice(0, -1); // path minus method
      const p1 = path.join(
        process.cwd(),
        systemConstants.endpointInfoPath,
        `${s2.join("/")}__${last(s1)}.json`
      );

      if ((await promises.stat(p1)).isFile()) {
        const endpointInfoRaw = await promises.readFile(p1);
        const endpointInfoJson = JSON.parse(endpointInfoRaw.toString("utf-8"));
        return endpointInfoJson as MfdocHttpEndpointDefinitionTypePrimitive;
      }
    }
  } catch (error) {
    fimidxConsoleLogger.error(error);
  }
}

export default async function FimidaraRestApiEndpointDocPage(
  props: FimidaraRestApiEndpointDocPageProps
) {
  const { endpointPath } = await props.params;
  const endpoint = await getEndpointInfo(endpointPath);

  if (!endpoint) {
    return (
      <PageNothingFound
        message={
          <p>
            Endpoint <code>{endpointPath}</code> not found.
          </p>
        }
      />
    );
  }

  return <HttpEndpointDoc endpoint={endpoint} />;
}
