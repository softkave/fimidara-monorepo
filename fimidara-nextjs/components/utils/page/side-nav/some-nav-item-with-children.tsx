import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import {
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar.tsx";
import { useCallback } from "react";
import { SomeNavItemMenuButton } from "./some-nav-item-menu-button.tsx";
import { SomeNavItem } from "./some-nav-item.tsx";
import { ISomeNavItem } from "./types.ts";
import {
  ISomeNavBehaviourProps,
  useSomeNavBehaviour,
} from "./useSomeNavBahviour.tsx";

export interface ISomeNavItemWithChildrenProps extends ISomeNavBehaviourProps {
  item: ISomeNavItem;
  isSubItem?: boolean;
}

export function SomeNavItemWithChildren(props: ISomeNavItemWithChildrenProps) {
  const { item, isSubItem = false } = props;
  const someNavBehaviour = useSomeNavBehaviour(props);

  const isSelected = someNavBehaviour.checkIsSelected(item.key);
  const isOpen = someNavBehaviour.checkIsOpen(item.key);

  const handleOpen = useCallback(() => {
    someNavBehaviour.handleOpen(item);
  }, [someNavBehaviour, item]);

  const MenuItem = isSubItem ? SidebarMenuSubItem : SidebarMenuItem;

  return (
    <Collapsible
      className="group/collapsible"
      defaultOpen={isOpen}
      onOpenChange={handleOpen}
    >
      <MenuItem>
        <CollapsibleTrigger
          render={
            <SomeNavItemMenuButton
              item={item}
              isSelected={isSelected}
              onClick={someNavBehaviour.handleSelect}
              isSubItem={isSubItem}
            />
          }
        />
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <SomeNavItem
                key={child.key}
                item={child}
                openMap={someNavBehaviour.openMap}
                selectedMap={someNavBehaviour.selectedMap}
                onOpen={props.onOpen}
                onSelect={props.onSelect}
                open={props.open}
                selected={props.selected}
                isSubItem={true}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </MenuItem>
    </Collapsible>
  );
}
