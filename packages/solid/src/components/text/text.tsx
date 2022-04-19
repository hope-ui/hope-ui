import { mergeProps, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import { textStyles, TextVariants } from "./text.styles";

export type TextProps<C extends ElementType = "p"> = HTMLHopeProps<C, TextVariants>;

export type TextStyleConfig = SinglePartComponentStyleConfig<TextVariants>;

const hopeTextClass = "hope-text";

/**
 * Text component is the used to render text and paragraphs within an interface.
 * It renders a <p> tag by default.
 */
export function Text<C extends ElementType = "p">(props: TextProps<C>) {
  const theme = useStyleConfig().Text;

  const defaultProps: TextProps<"p"> = {
    size: theme?.defaultProps?.size,
  };

  const propsWithDefault: TextProps<"p"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "size"]);

  const classes = () => classNames(local.class, hopeTextClass, textStyles({ size: local.size }));

  return <hope.p class={classes()} __baseStyle={theme?.baseStyle} {...others} />;
}

Text.toString = () => createClassSelector(hopeTextClass);
