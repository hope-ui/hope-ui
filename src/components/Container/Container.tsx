import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { ElementType } from "@/components";
import type { ContainerProps } from "@/components/Container/types";
import { useHopeTheme } from "@/contexts";

export function Container<C extends ElementType = "div">(props: ContainerProps<C>) {
  const containerTheme = useHopeTheme().components?.Container;

  const defaultProps: ContainerProps<"div"> = {
    as: "div",
    centered: containerTheme?.centered ?? true,
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
