import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps } from "../utils";
import { textStyles, TextVariants } from "./Text.styles";

export type TextProps<C extends ElementType> = PolymorphicComponentProps<C, TextVariants>;

/**
 * Text component is the used to render text and paragraphs within an interface.
 * It renders a <p> tag by default.
 */
export function Text<C extends ElementType = "p">(props: TextProps<C>) {
  const [local, variantProps, others] = splitProps(props, commonProps, [
    "size",
    "weight",
    "color",
    "align",
    "lineClamp",
    "secondary",
  ]);

  const classList = () => {
    const textClass = textStyles({
      ...variantProps,
      css: local.css,
    });

    return {
      [textClass]: true,
      [local.class ?? ""]: true,
      [local.className ?? ""]: true,
      ...local.classList,
    };
  };

  return <Dynamic component={local.as ?? "p"} classList={classList()} {...others} />;
}
