"use client";

import { RefObject, useEffect, useState } from "react";
import { useIsMobile } from "./use-mobile";

function resolvePageScrollTarget(
  header: HTMLElement
): HTMLElement | Window {
  const marked =
    header.parentElement?.querySelector<HTMLElement>("[data-page-scroll]");
  if (!marked) return window;

  return (
    marked.querySelector<HTMLElement>("[data-slot='scroll-area-viewport']") ??
    marked
  );
}

export function useHasScrolled(
  headerRef: RefObject<HTMLElement | null>,
  threshold = 0
) {
  const [hasScrolled, setHasScrolled] = useState(false);
  // MaybeScroll swaps between a plain overflow div and ScrollArea by viewport.
  const isMobile = useIsMobile();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const target = resolvePageScrollTarget(header);
    const getScrollTop = () =>
      target instanceof Window ? target.scrollY : target.scrollTop;

    const onScroll = () => {
      setHasScrolled(getScrollTop() > threshold);
    };

    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [headerRef, threshold, isMobile]);

  return hasScrolled;
}
