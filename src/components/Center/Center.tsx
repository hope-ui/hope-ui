import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { CenterProps, ElementType } from "@/components";

export function Center<C extends ElementType = "div">(props: CenterProps<C>) {
  const defaultProps: CenterProps<"div"> = {
    as: "div",
    inline: false,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "as",
    "class",
    "className",
    "classList",
    "inline",
  ]);

  const rootClassList = () => ({
    "h-center": true,
    "h-center--inline": local.inline,
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  return <Dynamic component={local.as} classList={rootClassList()} {...others} />;
}
