import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { menuLabelStyles } from "./menu.styles";

export type MenuLabelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeMenuLabelClass = "hope-menu__label";

/**
 * Component used to render the label of a group.
 */
export function MenuLabel<C extends ElementType = "div">(props: MenuLabelProps<C>) {
  const [local, others] = splitProps(props as MenuLabelProps<"div">, ["class"]);

  const classes = () => classNames(local.class, hopeMenuLabelClass, menuLabelStyles());

  return <Box class={classes()} {...others} />;
}

MenuLabel.toString = () => createClassSelector(hopeMenuLabelClass);
