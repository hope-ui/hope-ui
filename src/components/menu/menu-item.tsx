import { Accessor, createEffect, createSignal, JSX, onMount, splitProps } from "solid-js";

import { MarginProps } from "@/styled-system/props/margin";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useMenuContext } from "./menu";
import { menuItemIconWrapperStyles, menuItemStyles, MenuItemVariants } from "./menu.styles";
import { MenuItemData } from "./menu.utils";

type MenuItemOptions = Partial<MenuItemData> &
  MenuItemVariants & {
    /**
     * The icon to display next to the menu item text.
     */
    icon?: JSX.Element;

    /**
     * The space between the icon and the menu item text.
     */
    iconSpacing?: MarginProps["marginRight"];
  };

export type MenuItemProps<C extends ElementType = "div"> = HTMLHopeProps<C, MenuItemOptions>;

const hopeMenuItemClass = "hope-menu__item";
const hopeMenuItemIconWrapperClass = "hope-menu__item__icon-wrapper";

/**
 * The component that contains a menu item.
 */
export function MenuItem<C extends ElementType = "div">(props: MenuItemProps<C>) {
  const menuContext = useMenuContext();

  const [index, setIndex] = createSignal<number>(-1);

  let itemRef: HTMLDivElement | undefined;

  const [local, others] = splitProps(props as MenuItemProps<"div">, [
    "ref",
    "class",
    "children",
    "colorScheme",
    "icon",
    "iconSpacing",
    "textValue",
    "disabled",
    "closeOnSelect",
    "onSelect",
    "onClick",
  ]);

  const itemData: Accessor<MenuItemData> = () => ({
    textValue: local.textValue ?? itemRef?.textContent ?? "",
    disabled: !!local.disabled,
    closeOnSelect: local.closeOnSelect != null ? !!local.closeOnSelect : menuContext.state.closeOnSelect,
    onSelect: local.onSelect,
  });

  const id = () => `${menuContext.state.itemIdPrefix}-${index()}`;
  const isActiveDescendant = () => menuContext.isItemActiveDescendant(index());

  const assignItemRef = (el: HTMLDivElement) => {
    itemRef = el;

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onItemClick = (event: MouseEvent) => {
    event.stopPropagation();
    menuContext.onItemClick(index());
  };

  const onItemMouseMove = (event: MouseEvent) => {
    if (local.disabled) {
      menuContext.onItemMouseMove(-1);
    }

    if (isActiveDescendant() || local.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    menuContext.onItemMouseMove(index());
  };

  const classes = () => {
    return classNames(
      local.class,
      hopeMenuItemClass,
      menuItemStyles({
        colorScheme: local.colorScheme,
      })
    );
  };

  const iconWrapperClasses = () => {
    return classNames(hopeMenuItemIconWrapperClass, menuItemIconWrapperStyles());
  };

  onMount(() => {
    setIndex(menuContext.registerItem(itemData()));
  });

  createEffect(() => {
    if (isActiveDescendant() && itemRef) {
      menuContext.scrollToItem(itemRef);
    }
  });

  return (
    <Box
      ref={assignItemRef}
      role="menuitem"
      id={id()}
      data-active={isActiveDescendant() ? "" : undefined}
      data-disabled={local.disabled ? "" : undefined}
      data-group
      class={classes()}
      onClick={onItemClick}
      onMouseMove={onItemMouseMove}
      onMouseDown={menuContext.onItemMouseDown}
      {...others}
    >
      <hope.span aria-hidden="true" class={iconWrapperClasses()} mr={local.iconSpacing ?? "0.5rem"}>
        {local.icon}
      </hope.span>
      {local.children}
    </Box>
  );
}

MenuItem.toString = () => createClassSelector(hopeMenuItemClass);
