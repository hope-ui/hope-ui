import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, generateClassList } from "../utils";
import { containerStyles, ContainerVariants } from "./Container.styles";

export type ContainerProps<C extends ElementType> = PolymorphicComponentProps<C, ContainerVariants>;

/**
 * Layout component used to wrap app or website content
 *
 * By default it sets `margin-left` and `margin-right` to `auto`,
 * to keep its content centered.
 *
 */
export function Container<C extends ElementType = "div">(props: ContainerProps<C>) {
  const [local, styleProps, others] = splitProps(props, commonProps, [
    "css",
    "centered",
    "centerContent",
  ]);

  const classList = () => {
    return generateClassList({
      baseClass: containerStyles(styleProps),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
