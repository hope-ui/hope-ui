import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createCssSelector, generateClassList } from "@/utils/function";
import { commonProps } from "@/utils/object";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { containerStyles, ContainerVariants } from "./Container.styles";

export type ContainerProps<C extends ElementType> = PolymorphicComponentProps<C, ContainerVariants>;

const hopeContainerClass = "hope-container";

/**
 * Layout component used to wrap app or website content
 *
 * By default it sets `margin-left` and `margin-right` to `auto`,
 * to keep its content centered.
 *
 */
export function Container<C extends ElementType = "div">(props: ContainerProps<C>) {
  const defaultProps: ContainerProps<"div"> = {
    as: "div",
    centered: true,
    centerContent: false,
  };

  const propsWithDefault: ContainerProps<C> = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(propsWithDefault, commonProps, [
    ...boxPropNames,
    "css",
    "centered",
    "centerContent",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeContainerClass,
      baseClass: containerStyles(styleProps),
      classProps: local,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

Container.toString = () => createCssSelector(hopeContainerClass);
