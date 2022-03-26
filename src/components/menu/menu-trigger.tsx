import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";

export type MenuTriggerProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

const hopeMenuTriggerClass = "hope-menu__trigger";

/**
 * The trigger that toggles the menu.
 */
export function MenuTrigger<C extends ElementType = "button">(props: MenuTriggerProps<C>) {
  const [local, others] = splitProps(props as MenuTriggerProps<"button">, ["class"]);

  const classes = () => classNames(local.class, hopeMenuTriggerClass);

  return <hope.button class={classes()} {...others} />;
}

MenuTrigger.toString = () => createClassSelector(hopeMenuTriggerClass);
