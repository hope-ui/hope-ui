import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps } from "../utils";
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
    const baseClass = containerStyles(styleProps);

    return {
      [baseClass]: true,
      [local.class ?? ""]: true,
      [local.className ?? ""]: true,
      ...local.classList,
    };
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
