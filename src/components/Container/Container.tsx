import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, PolymorphicComponentProps } from "../types";
import { classPropNames, generateClassList } from "../utils";
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
  const [local, styleProps, classProps, others] = splitProps(
    props,
    ["as"],
    ["css", "centered", "centerContent"],
    classPropNames
  );

  const classList = () => {
    return generateClassList({
      baseClass: containerStyles(styleProps),
      ...classProps,
    });
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
