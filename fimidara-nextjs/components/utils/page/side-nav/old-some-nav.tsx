import { cn } from "@/components/utils.ts";
import { isString } from "lodash-es";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { StyleableComponentProps } from "../../styling/types.ts";
import { ISomeNavItem } from "./types.ts";
import {
  ISomeNavBehaviourProps,
  useSomeNavBehaviour,
} from "./useSomeNavBahviour.tsx";

export interface ISomeNavProps
  extends StyleableComponentProps,
    ISomeNavBehaviourProps {
  items: Array<ISomeNavItem>;
}

export function SomeNav(props: ISomeNavProps) {
  const { items, className, style } = props;
  const someBehaviour = useSomeNavBehaviour(props);

  const navNodes = items.map((item) => {
    if (item.isDivider) {
      return <div className="h-px bg-gray-200 my-2" key={item.key} />;
    }

    let menuItemContentNode = (
      <div
        className="gap-x-4 grid grid-cols-[auto_1fr] items-center"
        onClick={() => someBehaviour.handleSelect(item)}
      >
        {item.icon && (
          <span className="inline-flex items-center justify-center size-4">
            {item.icon}
          </span>
        )}
        <div
          className="text-ellipsis overflow-hidden whitespace-nowrap text-base"
          title={
            item.tooltip || (isString(item.label) ? item.label : undefined)
          }
        >
          {item.label}
        </div>
      </div>
    );

    if (item.href) {
      menuItemContentNode = <Link href={item.href}>{menuItemContentNode}</Link>;
    }

    return (
      <div
        key={item.key}
        className="grid grid-rows-[auto_1fr] w-full md:w-[300px]"
      >
        <div
          className={cn(
            "space-x-2 grid grid-cols-[auto_1fr] items-center py-1 px-4 hover:bg-gray-100",
            someBehaviour.checkIsSelected(item.key) && "bg-gray-100 font-bold"
          )}
        >
          {item.children?.length ? (
            <span
              onClick={() => someBehaviour.handleOpen(item)}
              className="cursor-pointer text-muted-foreground"
            >
              {someBehaviour.checkIsOpen(item.key) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          ) : null}
          {menuItemContentNode}
        </div>
        {item.children?.length && someBehaviour.checkIsOpen(item.key) ? (
          <SomeNav
            items={item.children}
            className="ml-6"
            key={item.key}
            onOpen={props.onOpen}
            onSelect={props.onSelect}
            open={props.open}
            selected={props.selected}
            openMap={someBehaviour.openMap}
            selectedMap={someBehaviour.selectedMap}
          />
        ) : null}
      </div>
    );
  });

  return (
    <div className={cn(className, "grid grid-rows-[auto_1fr]")} style={style}>
      {navNodes}
    </div>
  );
}
