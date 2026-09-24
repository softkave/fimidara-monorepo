"use client";

import { AppLayout } from "@/components/utils/AppLayout.tsx";
import { usePathname } from "next/navigation";

export function WorkspaceLayoutShell(props: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentClassName = pathname?.includes("/image-transform")
    ? "max-w-6xl"
    : undefined;

  return (
    <AppLayout contentClassName={contentClassName}>{props.children}</AppLayout>
  );
}
