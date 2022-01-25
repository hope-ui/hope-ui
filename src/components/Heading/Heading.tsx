import { mergeProps } from "solid-js";

import { Text, TextProps } from "../Text";
import { ElementType } from "../types";

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: TextProps<C>) {
  const defaultProps: TextProps<"h2"> = {
    as: "h2",
    weight: "semibold",
  };

  const propsWithDefault = mergeProps(defaultProps, props);

  return <Text {...propsWithDefault} />;
}
