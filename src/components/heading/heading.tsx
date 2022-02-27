import { mergeProps, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { headingStyles, HeadingVariants } from "./heading.styles";

export type HeadingProps<C extends ElementType = "h2"> = HTMLHopeProps<C, HeadingVariants>;

const hopeHeadingClass = "hope-heading";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: HeadingProps<C>) {
  const baseStyle = useComponentStyleConfigs().Heading?.baseStyle;

  const defaultProps: HeadingProps<"h2"> = {
    as: "h2",
  };

  const propsWithDefault: HeadingProps<"h2"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "size"]);

  const classes = () => classNames(local.class, hopeHeadingClass, headingStyles({ size: local.size }));

  return <Box class={classes()} __baseStyle={baseStyle} {...others} />;
}

Heading.toString = () => createClassSelector(hopeHeadingClass);
