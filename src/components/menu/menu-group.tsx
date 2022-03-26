import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { menuGroupStyles } from "./menu.styles";

export type MenuGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeMenuGroupClass = "hope-menu__group";

/**
 * Component used to group multiple menu item.
 */
export function MenuGroup<C extends ElementType = "div">(props: MenuGroupProps<C>) {
  const [local, others] = splitProps(props as MenuGroupProps<"div">, ["class"]);

  const classes = () => classNames(local.class, hopeMenuGroupClass, menuGroupStyles());

  return <Box class={classes()} {...others} />;
}

MenuGroup.toString = () => createClassSelector(hopeMenuGroupClass);
