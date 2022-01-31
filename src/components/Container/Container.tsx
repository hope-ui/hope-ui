import { mergeProps, splitProps } from "solid-js";

import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, HopeComponentProps } from "../types";
import { containerStyles, ContainerVariants } from "./Container.styles";

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
  const [local, variantProps, others] = splitProps(propsWithDefault, classPropsKeys, [
    "centered",
    "centerContent",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeContainerClass,
      baseClass: containerStyles(variantProps),
      classProps: local,
    });
  };

  return <Box classList={classList()} {...others} />;
}

Container.toString = () => createCssSelector(hopeContainerClass);
