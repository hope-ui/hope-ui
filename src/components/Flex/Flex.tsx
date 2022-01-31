import { mergeProps, splitProps } from "solid-js";

import { StyledSystemVariants } from "@/styled-system/system.styles";
import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, HopeComponentProps } from "../types";

export interface BaseFlexOptions {
  direction?: StyledSystemVariants["flexDirection"];
  wrap?: StyledSystemVariants["flexWrap"];
}

export type BaseFlexProps<C extends ElementType> = HopeComponentProps<C, BaseFlexOptions>;

/**
 * [Internal] Foundation of <Flex /> and <Stack /> components.
 */
export function BaseFlex<C extends ElementType = "div">(props: BaseFlexProps<C>) {
  const defaultProps: BaseFlexProps<"div"> = {
    display: "flex",
  };

  const propsWithDefault: BaseFlexProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["direction", "wrap"]);

  return <Box flexDirection={local.direction} flexWrap={local.wrap} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * Flex
 * -----------------------------------------------------------------------------------------------*/

export type FlexProps<C extends ElementType> = BaseFlexProps<C>;

const hopeFlexClass = "hope-flex";

/**
 * Hope UI component used to create flexbox layouts.
 * It renders a `div` with `display: flex` and comes with helpful style shorthand.
 */
export function Flex<C extends ElementType = "div">(props: FlexProps<C>) {
  const defaultProps: FlexProps<"div"> = {
    direction: "row",
    alignItems: "stretch",
    justifyContent: "start",
    wrap: "nowrap",
  };

  const propsWithDefault: FlexProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, classPropsKeys);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeFlexClass,
      baseClass: "",
      classProps: local,
    });
  };

  return <BaseFlex classList={classList()} {...others} />;
}

Flex.toString = () => createCssSelector(hopeFlexClass);
