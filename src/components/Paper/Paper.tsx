import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { PaperProps } from "@/components";
import { useHopeTheme } from "@/contexts";
import { ElementType } from "@/utils";

export function Paper<C extends ElementType = "div">(props: PaperProps<C>) {
  const theme = useHopeTheme().components.Paper;

  const defaultProps: PaperProps<"div"> = {
    as: "div",
    padding: theme.padding,
    radius: theme.radius,
    shadow: theme.shadow,
    withBorder: theme.withBorder,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "as",
    "class",
    "className",
    "classList",
    "padding",
    "radius",
    "shadow",
    "withBorder",
  ]);

  const rootClassList = () => ({
    "h-paper": true,
    "h-paper--with-border": local.withBorder,
    [`h-paper--padding-${local.padding}`]: true,
    [`h-paper--radius-${local.radius}`]: true,
    [`h-paper--shadow-${local.shadow}`]: true,
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  return <Dynamic component={local.as} classList={rootClassList()} {...others} />;
}
