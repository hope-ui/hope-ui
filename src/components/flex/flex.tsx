import { Property } from "csstype";
import { splitProps } from "solid-js";

import { ResponsiveProps } from "../../styled-system/types";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";

export type FlexOptions = ResponsiveProps<{
  direction?: Property.FlexDirection;
  wrap?: Property.FlexWrap;
}>;

export type FlexProps<C extends ElementType = "div"> = HTMLHopeProps<C, FlexOptions>;

const hopeFlexClass = "hope-flex";

/**
 * Hope UI component used to create flexbox layouts.
 * It renders a `div` with `display: flex` and comes with helpful style shorthand.
 */
export function Flex<C extends ElementType = "div">(props: FlexProps<C>) {
  const [local, others] = splitProps(props, ["class", "direction", "wrap"]);

  const classes = () => classNames(local.class, hopeFlexClass);

  return <Box class={classes()} display="flex" flexDirection={local.direction} flexWrap={local.wrap} {...others} />;
}

Flex.toString = () => createClassSelector(hopeFlexClass);
