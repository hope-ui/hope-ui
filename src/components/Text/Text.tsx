import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createCssSelector, generateClassList } from "@/utils/function";
import { commonProps } from "@/utils/object";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { baseTextStyles, BaseTextVariants } from "./Text.styles";

export type BaseTextOptions = BaseTextVariants & {
  size?: BaseTextVariants["fontSize"];
};

export type BaseTextProps<C extends ElementType> = PolymorphicComponentProps<C, BaseTextOptions>;

/**
 * [Internal] Foundation of <Text /> and <Heading /> components.
 */
export function BaseText<C extends ElementType = "p">(props: BaseTextProps<C>) {
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...boxPropNames,
    "css",
    "size",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: "",
      baseClass: baseTextStyles(styleProps),
      classProps: local,
    });
  };

  return <Dynamic component={local.as ?? "p"} classList={classList()} {...others} />;
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
  const defaultProps: TextProps<"p"> = {
    as: "p",
  };

  const propsWithDefault: TextProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "className", "classList"]);

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
