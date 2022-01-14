import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ContainerProps, ElementType } from "@/components";
import { useHopeTheme } from "@/contexts";

export function Container<C extends ElementType = "div">(props: ContainerProps<C>) {
  const theme = useHopeTheme().components.Container;

  const defaultProps: ContainerProps<"div"> = {
    as: "div",
    centered: theme.centered,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "as",
    "class",
    "className",
    "classList",
    "centered",
  ]);

  const rootClassList = () => ({
    "h-container": true,
    "h-container--centered": local.centered,
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  return <Dynamic component={local.as} classList={rootClassList()} {...others} />;
}
