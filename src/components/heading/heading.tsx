import { mergeProps, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import { headingStyles, HeadingVariants } from "./heading.styles";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6 | "1" | "2" | "3" | "4" | "5" | "6";

interface HeadingOptions extends HeadingVariants {
  /**
   * The level of heading to be rendered. For example `3` will render an h3.
   */
  level?: HeadingLevel;
}

export type HeadingProps<C extends ElementType = "h2"> = HTMLHopeProps<C, HeadingOptions>;

export type HeadingStyleConfig = SinglePartComponentStyleConfig<void>;

const hopeHeadingClass = "hope-heading";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: HeadingProps<C>) {
  const theme = useComponentStyleConfigs().Heading;

  const defaultProps: HeadingProps<"h2"> = {
    as: "h2",
  };

  const propsWithDefault: HeadingProps<"h2"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "as", "level", "size"]);

  const classes = () => classNames(local.class, hopeHeadingClass, headingStyles({ size: local.size }));

  // create an `h` tag with the level or return the `as` prop
  const asProp = () => (local.level ? (`h${local.level}` as ElementType<any>) : local.as);

  return <Box as={asProp()} class={classes()} __baseStyle={theme?.baseStyle} {...others} />;
}

Heading.toString = () => createClassSelector(hopeHeadingClass);
