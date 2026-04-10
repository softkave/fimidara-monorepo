import AppTitle from "@/components/app/AppTitle.tsx";
import { MaybeScroll } from "@/components/internal/maybe-scroll";
import { cn } from "@/components/utils.ts";
import React from "react";
import PageDrawer from "../PageDrawer.tsx";
import { SomeNav } from "./old-some-nav.tsx";
import { ISomeNavItem } from "./types.ts";
import {
  IUseOldSideNavBehaviourProps,
  useOldSideNavBehaviour,
} from "./useOldSideNavBehaviour.tsx";

export interface ISideNavProps extends IUseOldSideNavBehaviourProps {
  title: React.ReactNode;
  items: ISomeNavItem[];
  onClose: () => void;
  hideOnClose?: boolean;
}

export function SideNav(props: ISideNavProps) {
  const { isOpen, title, items, onClose, hideOnClose = true } = props;
  const oldBehaviour = useOldSideNavBehaviour(props);

  const menuNode = (
    <SomeNav
      key={oldBehaviour.key}
      items={items as ISomeNavItem[]}
      style={{ minWidth: isOpen ? "300px" : undefined }}
      className={"h-full py-2"}
      selected={oldBehaviour.selected}
      onSelect={oldBehaviour.handleSelect}
      open={oldBehaviour.open}
      onOpen={oldBehaviour.handleOpen}
    />
  );

  if (oldBehaviour.isLg) {
    if (!isOpen && hideOnClose) {
      return null;
    }

    return (
      <div className="h-full grid grid-rows-[auto_1fr] gap-0 max-w-[300px] w-full border-r">
        <AppTitle
          className={cn(
            "py-4",
            "px-4",
            "items-center",
            "flex",
            "sticky top-0 bg-white z-50"
          )}
        />
        <div className="overflow-hidden">
          <MaybeScroll className="h-full">{menuNode}</MaybeScroll>
        </div>
      </div>
    );
  } else {
    return (
      <PageDrawer
        open={isOpen}
        onClose={onClose}
        title={title}
        className="px-0 grid grid-rows-[auto_1fr] gap-0"
        titleClassName="px-4"
        side="left"
        contentClassName="overflow-hidden p-0"
      >
        <MaybeScroll className="h-full">{menuNode}</MaybeScroll>
      </PageDrawer>
    );
  }
}
