import { mergeProps, splitProps } from "solid-js";

import { HopeComponentProps } from "@/components/types";
import { classNames, createCssSelector } from "@/utils/css";
import { ElementType } from "@/utils/types";

import { Box } from "../box/box";
import { containerStyles, ContainerVariants } from "./container.styles";

export type ContainerProps<C extends ElementType> = HopeComponentProps<C, ContainerVariants>;

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
    centered: true,
    centerContent: false,
  };

  const propsWithDefault: ContainerProps<C> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["class"],
    ["centered", "centerContent"]
  );

  const classes = () => classNames(local.class, hopeContainerClass, containerStyles(variantProps));

  return <Box class={classes()} {...others} />;
}

Container.toString = () => createCssSelector(hopeContainerClass);
