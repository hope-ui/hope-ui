import { mergeProps, splitProps } from "solid-js";

import { TypographyProps } from "@/styled-system/props/typography";
import { useTheme } from "@/theme/provider";
import { classNames, createCssSelector } from "@/utils/css";
import { ElementType } from "@/utils/types";

import { BaseText, BaseTextProps } from "../text";

export type ThemeableHeadingOptions = Pick<TypographyProps, "fontWeight">;

const hopeHeadingClass = "hope-heading";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: BaseTextProps<C>) {
  //const theme = useTheme().components.Heading;

  const defaultProps: BaseTextProps<"h2"> = {
    as: "h2",
    fontWeight: "$semibold", //theme?.defaultProps?.fontWeight ?? "semibold",
  };

  const propsWithDefault: BaseTextProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class"]);

  const classes = () => classNames(local.class, hopeHeadingClass);

  return <BaseText class={classes()} {...others} />;
}

Heading.toString = () => createCssSelector(hopeHeadingClass);
