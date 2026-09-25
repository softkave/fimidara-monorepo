"use client";

import { uniq } from "lodash-es";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAppMenu } from "../app/useAppMenu.tsx";
import { SideNav } from "../utils/page/side-nav/old-side-nav.tsx";
import { getMenuSelectedKeys } from "../utils/page/side-nav/utils.tsx";
import {
  fimidaraNavItems,
  fimidaraRestApiNavItems,
  fimidaraRestApiSideNavItems,
  fimidaraSideNavItems,
  kDocNavRootKeysMap,
} from "./navItems";

const kHttpMethods = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
]);

function mergeHttpMethodParts(parts: string[]) {
  return parts.reduce((acc, part) => {
    if (kHttpMethods.has(part) && acc.length) {
      acc[acc.length - 1] = `${acc[acc.length - 1]}__${part}`;
    } else {
      acc.push(part);
    }
    return acc;
  }, [] as string[]);
}

function getOpenKeysFromSelectedKeys(selectedKeys: string[]) {
  const openKeys: string[] = [];

  for (const key of selectedKeys) {
    const parts = mergeHttpMethodParts(key.split("__"));
    for (let i = 1; i < parts.length; i++) {
      openKeys.push(parts.slice(0, i).join("__"));
    }
  }

  return openKeys;
}

export function DocsSideNav() {
  const { isOpen, toggleAppMenu } = useAppMenu();
  const pathname = usePathname();

  const completeNavItems = useMemo(
    () => fimidaraSideNavItems.concat(fimidaraRestApiSideNavItems),
    []
  );

  const { openKeys, selectedKeys } = useMemo(() => {
    const selectedKeys = getMenuSelectedKeys(
      fimidaraNavItems.concat(fimidaraRestApiNavItems),
      pathname
    );

    const openKeys = uniq([
      ...(pathname.startsWith(`/docs/${kDocNavRootKeysMap.fimidara}/`) ||
      pathname === `/docs/${kDocNavRootKeysMap.fimidara}`
        ? [kDocNavRootKeysMap.fimidara]
        : []),
      ...(pathname.startsWith(`/docs/${kDocNavRootKeysMap.restApi}/`) ||
      pathname === `/docs/${kDocNavRootKeysMap.restApi}`
        ? [kDocNavRootKeysMap.restApi]
        : []),
      ...getOpenKeysFromSelectedKeys(selectedKeys),
    ]);

    return { openKeys, selectedKeys };
  }, [pathname]);

  return (
    <SideNav
      hideOnClose
      items={completeNavItems}
      onClose={toggleAppMenu}
      title="fimidara docs"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      isOpen={isOpen}
    />
  );
}
