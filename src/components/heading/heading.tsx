import { mergeProps, splitProps } from "solid-js";

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
  const defaultProps: BaseTextProps<"h2"> = {
    as: "h2",
  };

  const propsWithDefault: BaseTextProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class"]);

  const classes = () => classNames(local.class, hopeHeadingClass, headingStyles());

  return <BaseText class={classes()} {...others} />;
}

Heading.toString = () => createCssSelector(hopeHeadingClass);
