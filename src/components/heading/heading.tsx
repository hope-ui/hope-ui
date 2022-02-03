import { mergeProps, splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";
import { ElementType } from "@/utils/types";

import { BaseText, BaseTextProps } from "../text";
import { headingStyles } from "./heading.styles";

const hopeHeadingClass = "hope-heading";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: BaseTextProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeHeadingClass, headingStyles());

  return <BaseText as="h2" class={classes()} {...others} />;
}

Heading.toString = () => createCssSelector(hopeHeadingClass);
