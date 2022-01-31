import { mergeProps, splitProps } from "solid-js";

import { StyledSystemVariants } from "@/styled-system/system.styles";
import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { BaseFlex, BaseFlexProps } from "../Flex/Flex";
import { ElementType } from "../types";

export type StackProps<C extends ElementType> = BaseFlexProps<C>;

const hopeStackClass = "hope-stack";

/**
 * [Internal] Foundation of <VStack /> and <HStack /> components.
 */
export function Stack<C extends ElementType = "div">(props: StackProps<C>) {
  const defaultProps: StackProps<"div"> = {
    direction: "row",
    alignItems: "center",
    justifyContent: "start",
    wrap: "nowrap",
  };

  const propsWithDefault: StackProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, classPropsKeys);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeStackClass,
      baseClass: "",
      classProps: local,
    });
  };

  return <BaseFlex classList={classList()} {...others} />;
}

Stack.toString = () => createCssSelector(hopeStackClass);

/* -------------------------------------------------------------------------------------------------
 * VStack
 * -----------------------------------------------------------------------------------------------*/

export interface VStackOptions {
  spacing?: StyledSystemVariants["rowGap"];
}

export type VStackProps<C extends ElementType> = StackProps<C> & VStackOptions;

export function VStack<C extends ElementType = "div">(props: VStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);
  return <Stack direction="column" rowGap={local.spacing} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * HStack
 * -----------------------------------------------------------------------------------------------*/

export interface HStackOptions {
  spacing?: StyledSystemVariants["columnGap"];
}

export type HStackProps<C extends ElementType> = StackProps<C> & HStackOptions;

export function HStack<C extends ElementType = "div">(props: HStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);
  return <Stack direction="row" columnGap={local.spacing} {...others} />;
}
