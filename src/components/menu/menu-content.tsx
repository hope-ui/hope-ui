import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { menuContentStyles } from "./menu.styles";

export type MenuContentProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeMenuContentClass = "hope-menu__content";

/**
 * The component that pops out when the menu is open.
 */
export function MenuContent<C extends ElementType = "div">(props: MenuContentProps<C>) {
  const [local, others] = splitProps(props as MenuContentProps<"div">, ["class"]);

  const classes = () => classNames(local.class, hopeMenuContentClass, menuContentStyles());

  return <Box class={classes()} {...others} />;
}

MenuContent.toString = () => createClassSelector(hopeMenuContentClass);
