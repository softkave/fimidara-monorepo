"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export function MaybeScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <div className={cn("h-full overflow-y-auto", className)}>{children}</div>
  ) : (
    <ScrollArea className={className}>
      {children}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
