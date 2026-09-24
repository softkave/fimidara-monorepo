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
      return <div className="my-2 h-px bg-gray-200" key={item.key} />;
    }

    const rowClassName = cn(
      "flex w-full items-center gap-x-2 px-4 py-1 hover:bg-gray-100",
      someBehaviour.checkIsSelected(item.key) && "bg-gray-100 font-semibold"
    );

    const labelTitle =
      item.tooltip || (isString(item.label) ? item.label : undefined);

    const rowContent = (
      <>
        {item.children?.length ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              someBehaviour.handleOpen(item);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                someBehaviour.handleOpen(item);
              }
            }}
            className="cursor-pointer text-muted-foreground"
          >
            {someBehaviour.checkIsOpen(item.key) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        ) : null}
        <span className="grid flex-1 grid-cols-[auto_1fr] items-center gap-x-2">
          {item.icon ? (
            <span className="inline-flex size-4 items-center justify-center text-muted-foreground group-hover:text-foreground mx-2">
              {item.icon}
            </span>
          ) : null}
          <span
            className="overflow-hidden text-ellipsis whitespace-nowrap text-base"
            title={labelTitle}
          >
            {item.label}
          </span>
        </span>
      </>
    );

    return (
      <div
        key={item.key}
        className="grid w-full grid-rows-[auto_1fr] md:w-[300px]"
      >
        {item.href ? (
          <Link
            href={item.href}
            className={rowClassName}
            onClick={() => someBehaviour.handleSelect(item)}
          >
            {rowContent}
          </Link>
        ) : (
          <button
            type="button"
            className={cn(rowClassName, "cursor-pointer text-left")}
            onClick={() => someBehaviour.handleSelect(item)}
          >
            {rowContent}
          </button>
        )}
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
    <div className={cn(className)} style={style}>
      {navNodes}
    </div>
  );
}
