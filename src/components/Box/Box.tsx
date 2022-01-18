import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { stitches } from "@/stitches";
import { ElementType, PolymorphicComponentProps } from "@/types";

export type BoxProps<C extends ElementType> = PolymorphicComponentProps<C>;

const box = stitches.css();

export function Box<C extends ElementType = "div">(props: BoxProps<C>) {
  const [local, others] = splitProps(props, ["as", "class", "className", "classList", "css"]);

  const classList = () => {
    const boxWithCSSOverride = box({ css: local.css });

    return {
      [boxWithCSSOverride]: true,
      [local.class || ""]: true,
      [local.className || ""]: true,
      ...local.classList,
    };
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
