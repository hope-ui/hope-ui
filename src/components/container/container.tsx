import { mergeProps, splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { containerStyles, ContainerVariants } from "./container.styles";

export type ContainerProps<C extends ElementType> = HopeComponentProps<C, ContainerVariants>;

const hopeContainerClass = "hope-container";

/**
 * Layout component used to wrap app or website content
 *
 * By default it sets `margin-left` and `margin-right` to `auto`,
 * to keep its content centered.
 */
export function Container<C extends ElementType = "div">(props: ContainerProps<C>) {
  const defaultProps: ContainerProps<"div"> = {
    centered: true,
    centerContent: false,
  };

  const propsWithDefault: ContainerProps<"div"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["class"],
    ["centered", "centerContent"]
  );

  const classes = () => classNames(local.class, hopeContainerClass, containerStyles(variantProps));

  return <Box class={classes()} {...others} />;
}

Container.toString = () => createCssSelector(hopeContainerClass);
