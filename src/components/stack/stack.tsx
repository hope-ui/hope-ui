import { Property } from "csstype";
import { splitProps } from "solid-js";

import { ResponsiveProps } from "@/styled-system/types";
import { classNames, createCssSelector } from "@/utils/css";
import { ElementType } from "@/utils/types";

import { BaseFlex, BaseFlexProps } from "../flex/flex";

export type StackProps<C extends ElementType> = BaseFlexProps<C>;

const hopeStackClass = "hope-stack";

/**
 * [Internal] Foundation of <VStack /> and <HStack /> components.
 */
export function Stack<C extends ElementType = "div">(props: StackProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeStackClass);

  return <BaseFlex class={classes()} alignItems="center" {...others} />;
}

Stack.toString = () => createCssSelector(hopeStackClass);

/* -------------------------------------------------------------------------------------------------
 * VStack
 * -----------------------------------------------------------------------------------------------*/

export type VStackOptions = ResponsiveProps<{
  spacing?: Property.RowGap;
}>;

export type VStackProps<C extends ElementType> = StackProps<C> & VStackOptions;

export function VStack<C extends ElementType = "div">(props: VStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);

  return <Stack direction="column" rowGap={local.spacing} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * HStack
 * -----------------------------------------------------------------------------------------------*/

export type HStackOptions = ResponsiveProps<{
  spacing?: Property.ColumnGap;
}>;

export type HStackProps<C extends ElementType> = StackProps<C> & HStackOptions;

export function HStack<C extends ElementType = "div">(props: HStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);

  return <Stack direction="row" columnGap={local.spacing} {...others} />;
}
