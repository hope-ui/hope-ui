import { Property } from "csstype";
import { splitProps } from "solid-js";

import { ResponsiveProps, SpaceScaleValue } from "../../styled-system/types";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { stackStyles } from "./stack.styles";

export type StackOptions = ResponsiveProps<{
  direction?: Property.FlexDirection;
  wrap?: Property.FlexWrap;
  spacing?: Property.Gap<SpaceScaleValue> | number;
}>;

export type StackProps<C extends ElementType = "div"> = HTMLHopeProps<C, StackOptions>;

const hopeStackClass = "hope-stack";

/**
 * Stack is a layout component that makes it easy to stack elements together and apply a space between them.
 *
 * Foundation of <VStack /> and <HStack /> components.
 */
export function Stack<C extends ElementType = "div">(props: StackProps<C>) {
  const [local, others] = splitProps(props, ["class", "direction", "wrap", "spacing"]);

  const classes = () => classNames(local.class, hopeStackClass, stackStyles());

  return (
    <Box
      class={classes()}
      flexDirection={local.direction}
      flexWrap={local.wrap}
      gap={local.spacing}
      {...others}
    />
  );
}

Stack.toString = () => createClassSelector(hopeStackClass);

/* -------------------------------------------------------------------------------------------------
 * HStack
 * -----------------------------------------------------------------------------------------------*/

export type HStackOptions = ResponsiveProps<{
  spacing?: Property.ColumnGap<SpaceScaleValue> | number;
}>;

export type HStackProps<C extends ElementType = "div"> = StackProps<C> & HStackOptions;

/**
 * A view that arranges its children in a horizontal line.
 */
export function HStack<C extends ElementType = "div">(props: HStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);

  return <Stack direction="row" alignItems="center" columnGap={local.spacing} {...others} />;
}

HStack.toString = () => createClassSelector(hopeStackClass);

/* -------------------------------------------------------------------------------------------------
 * VStack
 * -----------------------------------------------------------------------------------------------*/

export type VStackOptions = ResponsiveProps<{
  spacing?: Property.RowGap<SpaceScaleValue> | number;
}>;

export type VStackProps<C extends ElementType = "div"> = StackProps<C> & VStackOptions;

/**
 * A view that arranges its children in a vertical line.
 */
export function VStack<C extends ElementType = "div">(props: VStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);

  return <Stack direction="column" alignItems="center" rowGap={local.spacing} {...others} />;
}

VStack.toString = () => createClassSelector(hopeStackClass);
