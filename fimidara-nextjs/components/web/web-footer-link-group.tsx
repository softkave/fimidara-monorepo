import { cn } from "@/lib/utils";
import { CornerUpRightIcon } from "lucide-react";
import Link from "next/link";

export interface IWebFooterLinkGroup {
  title: string;
  links: {
    label: string;
    href: string;
    isExternal?: boolean;
  }[];
}

export const kFooterLinkGroups: IWebFooterLinkGroup[] = [
  {
    title: "Resources",
    links: [
      { label: "App Docs", href: "/docs/fimidara/introduction" },
      { label: "REST API Docs", href: "/docs/fimidara-rest-api/v1" },
      {
        label: "JS SDK",
        href: "https://github.com/softkave/fimidara/tree/main/fimidara-js-sdk",
        isExternal: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/softkave/fimidara",
        isExternal: true,
      },
    ],
  },
  {
    title: "Other Products",
    links: [
      {
        label: "chorebuddy",
        href: "https://chorebuddy.fimidara.com",
        isExternal: true,
      },
      {
        label: "fimipost",
        href: "https://fimipost.ywordk.com",
        isExternal: true,
      },
    ],
  },
];

export function WebFooterLinkGroup(props: {
  group: IWebFooterLinkGroup;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", props.className)}>
      <h3 className="text-sm font-bold text-muted-foreground">
        {props.group.title}
      </h3>
      <ul className="flex flex-col gap-2 py-0">
        {props.group.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2"
            >
              <span>{link.label}</span>
              {link.isExternal && <CornerUpRightIcon className="w-3 h-3" />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WebFooterLinkGroupList(props: {
  groups: IWebFooterLinkGroup[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-8",
        props.className
      )}
    >
      {props.groups.map((group) => (
        <WebFooterLinkGroup key={group.title} group={group} />
      ))}
    </div>
  );
}
