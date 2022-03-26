import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { menuItemStyles } from "./menu.styles";

export type MenuItemProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeMenuItemClass = "hope-menu__item";

/**
 * The component that contains a menu item.
 */
export function MenuItem<C extends ElementType = "div">(props: MenuItemProps<C>) {
  const [local, others] = splitProps(props as MenuItemProps<"div">, ["class"]);

  const classes = () => classNames(local.class, hopeMenuItemClass, menuItemStyles());

  return <Box class={classes()} {...others} />;
}

MenuItem.toString = () => createClassSelector(hopeMenuItemClass);
