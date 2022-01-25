import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps } from "../utils";
import { headingStyles, HeadingVariants } from "./Heading.styles";

export type HeadingProps<C extends ElementType> = PolymorphicComponentProps<C, HeadingVariants>;

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export function Heading<C extends ElementType = "h2">(props: HeadingProps<C>) {
  const [local, variantProps, others] = splitProps(props, commonProps, [
    "size",
    "weight",
    "color",
    "align",
    "lineClamp",
    "secondary",
  ]);

  const classList = () => {
    const textClass = headingStyles({
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

  return <Dynamic component={local.as ?? "h2"} classList={classList()} {...others} />;
}
