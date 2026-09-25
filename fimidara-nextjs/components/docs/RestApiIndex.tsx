import { kAppDocPaths } from "@/lib/definitions/paths/docs.ts";
import { toCompactArray } from "@/lib/utils/fns";
import { first } from "lodash-es";
import Link from "next/link";
import React from "react";
import { IRawNavItem } from "../utils/page/side-nav/types.ts";
import {
  fimidaraRestApiNavItems,
  getNavItemPath,
  restApiRawNavItems,
} from "./navItems";

export interface RestApiIndexProps {}

const RestApiIndex: React.FC<RestApiIndexProps> = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="text-xl font-semibold">fimidara REST API</h4>
        <p className="text-sm text-muted-foreground">
          These pages are generated from the public endpoint definitions. Use
          them as the reference for paths, headers, query parameters, and
          bodies.
        </p>

        <div className="space-y-2 text-sm">
          <h5 className="font-medium">Base URL</h5>
          <p>
            Hosted API -{" "}
            <code className="font-mono">https://api.fimidara.com</code>
          </p>
          <p>
            Self-hosted - use your own origin (for example{" "}
            <code className="font-mono">https://domain.com</code>).
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <h5 className="font-medium">Authentication</h5>
          <p>
            Most endpoints accept an optional{" "}
            <code className="font-mono">Authorization: Bearer &lt;jwt&gt;</code>{" "}
            header, where the JWT comes from an{" "}
            <strong>agent token</strong>. Requests without a token are treated
            as public and evaluated against the workspace{" "}
            <code className="font-mono">Public</code> permission group.
          </p>
          <p>
            File reads can also use a{" "}
            <strong>presigned path</strong> in the URL instead of a bearer
            token (useful for images and downloads).
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <h5 className="font-medium">Image transforms</h5>
          <p>
            <code className="font-mono">GET /v1/files/readFile/...</code>{" "}
            accepts resize and format query params (
            <code className="font-mono">w</code>,{" "}
            <code className="font-mono">h</code>,{" "}
            <code className="font-mono">fit</code>,{" "}
            <code className="font-mono">format</code>, and more). See the <a href="/docs/fimidara-rest-api/v1/files__readFile__get" className="underline">readFile GET</a> docs.
            <Link
              href={kAppDocPaths.fimidaraDoc("image-transformation")}
              className="underline"
            >
              Image transformation guide
            </Link>{" "}
            and{" "}
            <Link
              href={kAppDocPaths.fimidaraRestApiDoc("files__readFile__get")}
              className="underline"
            >
              readFile GET
            </Link>
            .
          </p>
        </div>
      </div>

      {renderNavItemList(restApiRawNavItems, "", "Endpoints")}
    </div>
  );
};

export default RestApiIndex;

function renderNavItemList(
  items: IRawNavItem[],
  parentPath: string,
  parentLabel: React.ReactNode
) {
  const nodes = items.map((item) => {
    const itemPath = getNavItemPath(
      item,
      toCompactArray(first(fimidaraRestApiNavItems))
    );

    return (
      <li key={item.key}>
        {item.href && !item.children && (
          <Link href={item.href} className="underline">
            {item.label}
          </Link>
        )}
        {item.children &&
          renderNavItemList(item.children, itemPath, item.label)}
      </li>
    );
  });

  return (
    <div key={parentPath}>
      <h5 className="my-2">{parentLabel}</h5>
      <ul key={parentPath}>{nodes}</ul>
    </div>
  );
}
