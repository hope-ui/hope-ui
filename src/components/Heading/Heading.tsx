import { mergeProps, splitProps } from "solid-js";

import { useHopeTheme } from "@/contexts/HopeContext";
import { css } from "@/theme/stitches.config";

import { Text, TextProps } from "../Text";
import { ElementType } from "../types";
import { commonProps, generateClassList } from "../utils";

const headingStyles = css();

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

  props = mergeProps(defaultProps, props);
  const [local, others] = splitProps(props, commonProps);

  const classList = () => {
    return generateClassList({
      baseClass: headingStyles(),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Text as={local.as as ElementType} classList={classList()} {...others} />;
}

Heading.toString = () => headingStyles.selector;
