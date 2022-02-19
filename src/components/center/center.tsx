import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { centerStyles } from "./center.styles";

export type CenterProps<C extends ElementType = "div"> = HopeComponentProps<C>;

const hopeCenterClass = "hope-center";

/**
 * Center is a layout component that centers its child within itself.
 */
export function Center<C extends ElementType = "div">(props: CenterProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeCenterClass, centerStyles());

  return <Box class={classes()} {...others} />;
}

Center.toString = () => createClassSelector(hopeCenterClass);
