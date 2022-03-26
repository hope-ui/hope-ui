import { Accessor, createEffect, createSignal, onMount, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useMenuContext } from "./menu";
import { menuItemStyles } from "./menu.styles";
import { MenuItemData } from "./menu.utils";

interface MenuItemOptions {
  /**
   * Optional text used for typeahead purposes.
   * By default the typeahead behavior will use the `.textContent` of the `MenuItem`.
   * Use this when the content is complex, or you have non-textual content inside.
   */
  textValue?: string;

  /**
   * If `true`, the item will be disabled.
   */
  disabled?: boolean;

  /**
   * Event handler called when the user selects an item (via mouse or keyboard).
   * Calling `event.preventDefault` in this handler
   * will prevent the dropdown menu from closing when selecting that item.
   */
  onSelect?: (event: Event) => void;
}

export type MenuItemProps<C extends ElementType = "div"> = HTMLHopeProps<C, MenuItemOptions>;

const hopeMenuItemClass = "hope-menu__item";

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
    "textValue",
    "disabled",
    "onSelect",
  ]);

  const itemData: Accessor<MenuItemData> = () => ({
    textValue: local.textValue ?? itemRef?.textContent ?? "",
    disabled: !!local.disabled,
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
    menuContext.onItemClick(index(), event);
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

  const classes = () => classNames(local.class, hopeMenuItemClass, menuItemStyles());

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
    />
  );
}

MenuItem.toString = () => createClassSelector(hopeMenuItemClass);
