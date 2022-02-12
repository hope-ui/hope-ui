import { Property } from "csstype";
import { splitProps } from "solid-js";

import { ResponsiveProps } from "@/styled-system/types";
import { classNames, createCssSelector } from "@/utils/css";

import { BaseFlex, BaseFlexProps } from "../flex/flex";
import { ElementType } from "../types";

export type StackProps<C extends ElementType> = BaseFlexProps<C>;

const hopeStackClass = "hope-stack";

/**
 * Stack is a layout component that makes it easy to stack elements together and apply a space between them.
 *
 * Foundation of <VStack /> and <HStack /> components.
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
