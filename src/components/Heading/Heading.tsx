import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/contexts/HopeContext";

import { BaseText, BaseTextOptions, BaseTextProps } from "../Text";
import { ElementType } from "../types";
import { createCssSelector, generateClassList } from "../utils";

export type ThemeableHeadingOptions = Pick<BaseTextOptions, "fontWeight">;

export type HeadingProps<C extends ElementType> = BaseTextProps<C>;

const hopeHeadingClass = "hope-heading";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: HeadingProps<C>) {
  const theme = useTheme().components.Heading;

  const defaultProps: HeadingProps<"h2"> = {
    as: "h2",
    fontWeight: theme?.defaultProps?.fontWeight ?? "semibold",
  };

  const propsWithDefault: HeadingProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "className", "classList"]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeHeadingClass,
      baseClass: "",
      classProps: local,
    });
  };

  return <BaseText classList={classList()} {...others} />;
}

Heading.toString = () => createCssSelector(hopeHeadingClass);
