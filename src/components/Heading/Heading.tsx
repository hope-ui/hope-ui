import { mergeProps, splitProps } from "solid-js";

import { useHopeTheme } from "@/contexts/HopeContext";

import { Text, TextProps } from "../Text";
import { ElementType } from "../types";
import { classPropNames, generateClassList } from "../utils";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: TextProps<C>) {
  const theme = useHopeTheme().components.Heading;

  const defaultProps: TextProps<"h2"> = {
    as: "h2",
    size: theme?.defaultProps?.size ?? "base",
    weight: theme?.defaultProps?.weight ?? "semibold",
    align: theme?.defaultProps?.align ?? "left",
    color: theme?.defaultProps?.color ?? "dark",
    secondary: theme?.defaultProps?.secondary ?? false,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, classProps, others] = splitProps(propsWithDefault, ["as"], classPropNames);

  const classList = () => {
    return generateClassList({
      baseClass: "",
      themeBaseStyle: theme?.baseStyle,
      ...classProps,
    });
  };

  return <Text as={local.as as any} classList={classList()} {...others} />;
}
