"use client";

import { CSSProperties, ReactNode, useRef } from "react";
import { useHasScrolled } from "@/hooks/use-has-scrolled";
import { cn } from "../utils.ts";

export interface HeaderShellProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function HeaderShell(props: HeaderShellProps) {
  const { children, className, style } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useHasScrolled(rootRef);

  return (
    <div ref={rootRef} className="relative z-20 shrink-0">
      <div
        className={cn(
          "bg-background transition-shadow duration-200",
          hasScrolled &&
            "shadow-[0_1px_0_0_var(--border),0_8px_16px_-10px_rgb(0_0_0_/_0.14)]",
          className
        )}
        style={style}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background to-transparent transition-opacity duration-200",
          hasScrolled ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
