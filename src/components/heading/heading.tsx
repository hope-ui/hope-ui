import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme/provider";
import { classNames, createCssSelector } from "@/utils/css";

import { BaseText, BaseTextProps } from "../text/text";
import { ElementType } from "../types";
import { headingStyles } from "./heading.styles";

const hopeHeadingClass = "hope-heading";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: BaseTextProps<C>) {
  const baseStyle = useTheme().components.Heading?.baseStyle;

  const defaultProps: BaseTextProps<"h2"> = {
    as: "h2",
  };

  const propsWithDefault: BaseTextProps<"h2"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class"]);

  const classes = () => classNames(local.class, hopeHeadingClass, headingStyles());

  return <BaseText class={classes()} __baseStyle={baseStyle} {...others} />;
}

Heading.toString = () => createCssSelector(hopeHeadingClass);
