import { splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { centerStyles } from "./center.styles";

const hopeCenterClass = "hope-center";

/**
 * Center is a layout component that centers its child within itself.
 */
export function Center<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeCenterClass, centerStyles());

  return <Box class={classes()} {...others} />;
}

Center.toString = () => createCssSelector(hopeCenterClass);
