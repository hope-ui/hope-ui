import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { stackStyles, StackVariants } from "./Stack.styles";

export interface StackOptions extends StackVariants {
  direction?: StackVariants["flexDirection"];
  wrap?: StackVariants["flexWrap"];
}

export type StackProps<C extends ElementType> = PolymorphicComponentProps<C, StackOptions>;

const hopeStackClass = "hope-stack";

export function Stack<C extends ElementType = "div">(props: StackProps<C>) {
  const defaultProps: StackProps<"div"> = {
    as: "div",
    direction: "row",
    alignItems: "center",
    justifyContent: "start",
    wrap: "nowrap",
  };

  props = mergeProps(defaultProps, props);
  const [local, styleProps, shorthandStyleProps, others] = splitProps(
    props,
    commonProps,
    [...boxPropNames, "css"],
    ["direction", "wrap"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: hopeStackClass,
      baseClass: stackStyles({
        flexDirection: shorthandStyleProps.direction,
        flexWrap: shorthandStyleProps.wrap,
        ...styleProps, // longhand props if provided will override the short ones
      }),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

Stack.toString = () => createCssSelector(hopeStackClass);

/* -------------------------------------------------------------------------------------------------
 * VStack
 * -----------------------------------------------------------------------------------------------*/

export interface VStackOptions extends StackOptions {
  spacing?: StackVariants["rowGap"];
}

export type VStackProps<C extends ElementType> = StackProps<C> & VStackOptions;

export function VStack<C extends ElementType = "div">(props: VStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);
  return <Stack direction="column" rowGap={local.spacing} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * HStack
 * -----------------------------------------------------------------------------------------------*/

export interface HStackOptions extends StackOptions {
  spacing?: StackVariants["columnGap"];
}

export type HStackProps<C extends ElementType> = StackProps<C> & HStackOptions;

export function HStack<C extends ElementType = "div">(props: HStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);
  return <Stack direction="row" columnGap={local.spacing} {...others} />;
}
