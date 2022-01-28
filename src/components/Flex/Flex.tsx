import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { utilityStyleProps } from "@/theme/utilityStyles";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { flexStyleProps, flexStyles, FlexVariants } from "./Flex.styles";

export type FlexProps<C extends ElementType> = PolymorphicComponentProps<C, FlexVariants>;

const hopeFlexClass = "hope-flex";

/**
 * Hope UI component used to create flexbox layouts.
 * It renders a `div` with `display: flex` and comes with helpful style shorthand.
 */
export function Flex<C extends ElementType = "div">(props: FlexProps<C>) {
  const defaultProps: FlexProps<"div"> = {
    as: "div",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "start",
    flexWrap: "noWrap",
  };

  props = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...utilityStyleProps,
    ...flexStyleProps,
    "css",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeFlexClass,
      baseClass: flexStyles(styleProps),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

Flex.toString = () => createCssSelector(hopeFlexClass);
