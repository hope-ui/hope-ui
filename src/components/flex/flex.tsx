import { Property } from "csstype";
import { splitProps } from "solid-js";

import { HopeComponentProps } from "@/components/types";
import { ResponsiveProps } from "@/styled-system/types";
import { classNames, createCssSelector } from "@/utils/css";
import { ElementType } from "@/utils/types";

import { Box } from "../box/box";

export type BaseFlexOptions = ResponsiveProps<{
  direction?: Property.FlexDirection;
  wrap?: Property.FlexWrap;
}>;

export type BaseFlexProps<C extends ElementType> = HopeComponentProps<C, BaseFlexOptions>;

/**
 * [Internal] Foundation of <Flex /> and <Stack /> components.
 */
export function BaseFlex<C extends ElementType = "div">(props: BaseFlexProps<C>) {
  const [local, others] = splitProps(props, ["direction", "wrap"]);

  return <Box display="flex" flexDirection={local.direction} flexWrap={local.wrap} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * Flex
 * -----------------------------------------------------------------------------------------------*/

const hopeFlexClass = "hope-flex";

/**
 * Hope UI component used to create flexbox layouts.
 * It renders a `div` with `display: flex` and comes with helpful style shorthand.
 */
export function Flex<C extends ElementType = "div">(props: BaseFlexProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeFlexClass);

  return <BaseFlex class={classes()} {...others} />;
}

Flex.toString = () => createCssSelector(hopeFlexClass);
