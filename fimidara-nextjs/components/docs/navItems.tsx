import { fimidxConsoleLogger } from "@/lib/common/logger/fimidx-console-logger.ts";
import { kAppDocPaths } from "@/lib/definitions/paths/docs.ts";
import assert from "assert";
import { first } from "lodash-es";
import { MfdocEndpointsTableOfContent } from "mfdoc/endpointInfo.d.ts";
import { ValueOf } from "type-fest";
import restApiTableOfContent from "../../../fimidara-mfdoc-out/public-endpoints/table-of-content.json";
import { IRawNavItem } from "../utils/page/side-nav/types.ts";
import { renderToSideNavMenuItemList } from "../utils/page/side-nav/utils.tsx";
import { htmlCharacterCodes } from "../utils/utils";

export const DOCS_BASE_PATH = "/docs";
export const apiVersion = "v1";

export function getNavItemPath(item: IRawNavItem, parentItems: IRawNavItem[]) {
  const rootItem = first(parentItems);
  const includeVersion = rootItem?.key === kDocNavRootKeysMap.restApi;
  let prefixPath = "";

  if (rootItem) {
    if (includeVersion) prefixPath = `/${rootItem.key}/${apiVersion}`;
    else prefixPath = `/${rootItem.key}`;
  }

  return `${DOCS_BASE_PATH}${prefixPath}/${item.href || item.key}`;
}

export const kDocNavRootKeysMap = {
  fimidara: "fimidara",
  restApi: "fimidara-rest-api",
} as const;

export const kDocNavRootKeysList = Object.values(kDocNavRootKeysMap);

export type DocNavRootKeys = ValueOf<typeof kDocNavRootKeysMap>;

export const restApiRawNavItems = extractRestApiFromRawTableOfContent(
  restApiTableOfContent as any,
  kDocNavRootKeysMap.restApi
);

export const fimidaraNavItems: IRawNavItem[] = [
  {
    key: kDocNavRootKeysMap.fimidara,
    label: "fimidara",
    children: [
      {
        label: "Introduction",
        key: "introduction",
        href: kAppDocPaths.fimidaraDoc("introduction"),
      },
      {
        label: "Workspace",
        key: "workspace",
        href: kAppDocPaths.fimidaraDoc("workspace"),
      },
    ],
  },
];
export const fimidaraRestApiNavItems: IRawNavItem[] = [
  {
    key: kDocNavRootKeysMap.restApi,
    label: "fimidara REST API",
    children: (
      [
        {
          label: "overview",
          key: kDocNavRootKeysMap.restApi + "__" + "overview",
          href: kAppDocPaths.fimidaraRestApiDoc("overview"),
        },
      ] as IRawNavItem[]
    ).concat(restApiRawNavItems),
  },
];

export const fimidaraSideNavItems =
  renderToSideNavMenuItemList(fimidaraNavItems);
export const fimidaraRestApiSideNavItems = renderToSideNavMenuItemList(
  fimidaraRestApiNavItems
);

function extractRestApiFromRawTableOfContent(
  tableOfContent: MfdocEndpointsTableOfContent[],
  rootKey: DocNavRootKeys
): IRawNavItem[] {
  const links: IRawNavItem[] = [];
  const pFn =
    rootKey === kDocNavRootKeysMap.restApi
      ? kAppDocPaths.fimidaraRestApiDoc
      : undefined;
  assert.ok(pFn);

  function processTableOfContent(
    toc: MfdocEndpointsTableOfContent,
    parentKey: string = ""
  ): IRawNavItem[] {
    const items: IRawNavItem[] = [];

    // Process children recursively
    Object.entries(toc.children).forEach(([childKey, childToc]) => {
      const currentKey = parentKey ? `${parentKey}__${childKey}` : childKey;
      const isLeaf = Object.keys(childToc.children).length === 0;

      // Extract HTTP method from basename if it's a leaf endpoint
      let label = childToc.basename;
      let href: string | undefined;

      if (isLeaf && childToc.filepath) {
        // This is an endpoint - extract method from basename
        const methodMatch = childToc.basename.match(/__([a-z]+)$/);
        if (methodMatch) {
          const method = methodMatch[1];
          const endpointName = childToc.basename.replace(/__[a-z]+$/, "");
          label = `${endpointName}${htmlCharacterCodes.doubleDash}${method}`;
          href = pFn?.(currentKey);
        }
      }

      const item: IRawNavItem = {
        key: currentKey,
        label,
        href,
        children: isLeaf
          ? undefined
          : processTableOfContent(childToc, currentKey),
      };

      items.push(item);
    });

    return items;
  }

  // Process each root item, but skip the "fimidara" root and only process its children
  tableOfContent.forEach((rootToc) => {
    if (rootToc.basename === "fimidara") {
      // Skip the root "fimidara" item and process its children directly
      Object.entries(rootToc.children).forEach(([childKey, childToc]) => {
        const items = processTableOfContent(childToc, childKey);
        links.push(...items);
      });
    } else {
      // For other root items, process normally
      const items = processTableOfContent(rootToc, rootToc.basename);
      links.push(...items);
    }
  });

  return links;
}

/**
 * Extracts the filepath for a leaf endpoint from an href
 * @param href The href string containing the endpoint path
 * @returns The filepath for the endpoint, or undefined if not found
 */
export function extractFilepathFromHref(href: string): string | undefined {
  try {
    // Extract the endpoint path from the href
    // href format: /docs/fimidara-rest-api/v1/[endpointPath]
    const url = new URL(href, "http://localhost");
    const pathSegments = url.pathname.split("/").filter(Boolean);

    // Find the endpoint path after the version
    const versionIndex = pathSegments.findIndex((segment) => segment === "v1");
    if (versionIndex === -1 || versionIndex === pathSegments.length - 1) {
      return undefined;
    }

    const endpointPath = pathSegments.slice(versionIndex + 1).join("/");
    if (!endpointPath) {
      return undefined;
    }

    // Convert the endpoint path to the expected filepath format
    // endpointPath format: "agentTokens__addToken__post"
    // filepath format: "fimidara/agentTokens/addToken__post.json"
    const pathParts = endpointPath.split("__");
    if (pathParts.length < 2) {
      return undefined;
    }

    // The last part is the HTTP method
    const method = pathParts[pathParts.length - 1];
    const endpointName = pathParts[pathParts.length - 2];
    const category = pathParts.slice(0, -2).join("/");

    // Construct the filepath
    const filepath = `fimidara/${category}/${endpointName}__${method}.json`;
    return filepath;
  } catch (error) {
    fimidxConsoleLogger.error("Error extracting filepath from href:", error);
    return undefined;
  }
}
