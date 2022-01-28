import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useTheme } from "@/contexts/HopeContext";

import { boxPropNames } from "../Box/Box.styles";
import { TextOptions, TextProps } from "../Text";
import { textStyles } from "../Text/Text.styles";
import { ElementType } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";

export type ThemeableHeadingOptions = Pick<TextOptions, "fontWeight">;

const hopeHeadingClass = "hope-heading";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: TextProps<C>) {
  const theme = useTheme().components.Heading;

  const defaultProps: TextProps<"h2"> = {
    as: "h2",
    fontWeight: theme?.defaultProps?.fontWeight ?? "semibold",
  };

  props = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...boxPropNames,
    "css",
    "size",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeHeadingClass,
      baseClass: textStyles({
        ...styleProps,
        fontSize: styleProps.size,
      }),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

Heading.toString = () => createCssSelector(hopeHeadingClass);
