import { mergeProps, splitProps } from "solid-js";

import { StyledSystemVariants } from "@/styled-system/system.styles";
import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, HopeComponentProps } from "../types";
import { baseTextStyles, BaseTextVariants } from "./Text.styles";

export type BaseTextOptions = BaseTextVariants & {
  size?: StyledSystemVariants["fontSize"];
};

export type BaseTextProps<C extends ElementType> = HopeComponentProps<C, BaseTextOptions>;

/**
 * [Internal] Foundation of <Text /> and <Heading /> components.
 */
export function BaseText<C extends ElementType = "p">(props: BaseTextProps<C>) {
  const defaultProps: BaseTextProps<"p"> = {
    as: "p",
  };

  const propsWithDefault: BaseTextProps<C> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(propsWithDefault, classPropsKeys, ["size"]);

  const classList = () => {
    return generateClassList({
      hopeClass: "",
      baseClass: baseTextStyles(variantProps),
      classProps: local,
    });
  };

  return <Box classList={classList()} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * Text
 * -----------------------------------------------------------------------------------------------*/

export type TextProps<C extends ElementType> = BaseTextProps<C>;

const hopeTextClass = "hope-text";

/**
 * Text component is the used to render text and paragraphs within an interface.
 * It renders a <p> tag by default.
 */
export function Text<C extends ElementType = "p">(props: TextProps<C>) {
  const [local, others] = splitProps(props, classPropsKeys);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeTextClass,
      baseClass: "",
      classProps: local,
    });
  };

  return <BaseText classList={classList()} {...others} />;
}

Text.toString = () => createCssSelector(hopeTextClass);
