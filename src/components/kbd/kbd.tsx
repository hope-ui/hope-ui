import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import { kbdStyles } from "./kbd.styles";

export type KbdStyleConfig = SinglePartComponentStyleConfig<void>;

export type KbdProps<C extends ElementType = "kbd"> = HTMLHopeProps<C>;

const hopeKbdClass = "hope-kbd";

/**
 * Semantic component to render a keyboard shortcut within an application.
 */
export function Kbd<C extends ElementType = "kbd">(props: KbdProps<C>) {
  const theme = useComponentStyleConfigs().Kbd;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeKbdClass, kbdStyles());

  return <hope.kbd class={classes()} __baseStyle={theme?.baseStyle} {...others} />;
}

Kbd.toString = () => createClassSelector(hopeKbdClass);
