import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useTheme } from "@/contexts/HopeContext";
import { utilityStyleProps } from "@/theme/utilityStyles";

import { TextProps } from "../Text";
import { textStyles } from "../Text/Text.styles";
import { ElementType } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";

const hopeHeadingClass = "hope-heading";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: TextProps<C>) {
  const theme = useTheme().components.Heading;

  const defaultProps: TextProps<"h2"> = {
    as: "h2",
    color: theme?.defaultProps?.color ?? "dark900",
    size: theme?.defaultProps?.size ?? "base",
    weight: theme?.defaultProps?.weight ?? "semibold",
    align: theme?.defaultProps?.align ?? "left",
  };

  props = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...utilityStyleProps,
    "css",
    "size",
    "font",
    "weight",
    "letterSpacing",
    "align",
    "capitalized",
    "uppercased",
    "lowercased",
    "lineClamp",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeHeadingClass,
      baseClass: textStyles(styleProps),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

Heading.toString = () => createCssSelector(hopeHeadingClass);
