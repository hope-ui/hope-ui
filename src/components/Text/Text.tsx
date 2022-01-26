import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useHopeTheme } from "@/contexts/HopeContext";

import { ElementType, PolymorphicComponentProps } from "../types";
import { classPropNames, generateClassList } from "../utils";
import { textStyles, TextVariants } from "./Text.styles";

export type ThemeableTextOptions = Omit<TextVariants, "lineClamp">;

export type TextProps<C extends ElementType> = PolymorphicComponentProps<C, TextVariants>;

/**
 * Text component is the used to render text and paragraphs within an interface.
 * It renders a <p> tag by default.
 */
export function Text<C extends ElementType = "p">(props: TextProps<C>) {
  const theme = useHopeTheme().components.Text;

  const defaultProps: TextProps<"p"> = {
    as: "p",
    size: theme?.defaultProps?.size ?? "base",
    weight: theme?.defaultProps?.weight ?? "normal",
    align: theme?.defaultProps?.align ?? "left",
    color: theme?.defaultProps?.color ?? "dark",
    secondary: theme?.defaultProps?.secondary ?? false,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, styleProps, classProps, others] = splitProps(
    propsWithDefault,
    ["as"],
    ["css", "size", "weight", "color", "align", "lineClamp", "secondary"],
    classPropNames
  );

  const classList = () => {
    return generateClassList({
      baseClass: textStyles(styleProps),
      themeBaseStyle: theme?.baseStyle,
      ...classProps,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}
