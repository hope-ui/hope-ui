import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { headingStyles, HeadingVariants } from "./heading.styles";

export type HeadingProps<C extends ElementType = "h2"> = HopeComponentProps<C, HeadingVariants>;

const hopeHeadingClass = "hope-heading";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: HeadingProps<C>) {
  const baseStyle = useTheme().components.Heading?.baseStyle;

  const defaultProps: HeadingProps<"h2"> = {
    as: "h2",
  };

  const propsWithDefault: HeadingProps<"h2"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "size"]);

  const classes = () => classNames(local.class, hopeHeadingClass, headingStyles({ size: local.size }));

  return <Box class={classes()} __baseStyle={baseStyle} {...others} />;
}

Heading.toString = () => createClassSelector(hopeHeadingClass);
