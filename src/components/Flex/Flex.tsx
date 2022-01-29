import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { flexStyles, FlexVariants } from "./Flex.styles";

export type FlexOptions = FlexVariants & {
  direction?: FlexVariants["flexDirection"];
  wrap?: FlexVariants["flexWrap"];
};

export type FlexProps<C extends ElementType> = PolymorphicComponentProps<C, FlexOptions>;

const hopeFlexClass = "hope-flex";

/**
 * Hope UI component used to create flexbox layouts.
 * It renders a `div` with `display: flex` and comes with helpful style shorthand.
 */
export function Flex<C extends ElementType = "div">(props: FlexProps<C>) {
  const defaultProps: FlexProps<"div"> = {
    as: "div",
    direction: "row",
    alignItems: "stretch",
    justifyContent: "start",
    wrap: "nowrap",
  };

  props = mergeProps(defaultProps, props);
  const [local, styleProps, shorthandStyleProps, others] = splitProps(
    props,
    commonProps,
    [...boxPropNames, "css"],
    ["direction", "wrap"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: hopeFlexClass,
      baseClass: flexStyles({
        flexDirection: shorthandStyleProps.direction,
        flexWrap: shorthandStyleProps.wrap,
        ...styleProps, // flexDirection and flexWrap from styleProps will override the shorthand props if defined
      }),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

Flex.toString = () => createCssSelector(hopeFlexClass);
