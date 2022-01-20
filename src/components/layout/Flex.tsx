import { Property } from "csstype";
import { splitProps } from "solid-js";

import { StyleProps } from "@/styled-system/props/styleProps";

import { hope } from "../factory";
import { ElementType, PolymorphicComponentProps } from "../types";

export type FlexOptions = Partial<{
  /**
   * Shorthand for `display: inline-flex`
   */
  inline?: boolean;
  /**
   * Shorthand for `alignItems` style prop
   */
  align?: Property.AlignItems;

  /**
   * Shorthand for `justifyContent` style prop
   */
  justify?: Property.JustifyContent;

  /**
   * Shorthand for `flexWrap` style prop
   */
  wrap?: Property.FlexWrap;

  /**
   * Shorthand for `flexDirection` style prop
   */
  direction?: Property.FlexDirection;

  /**
   * Shorthand for `flexBasis` style prop
   */
  basis?: Property.FlexBasis;

  /**
   * Shorthand for `flexGrow` style prop
   */
  grow?: Property.FlexGrow;

  /**
   * Shorthand for `flexShrink` style prop
   */
  shrink?: Property.FlexShrink;
}>;

export type FlexProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  FlexOptions & StyleProps
>;

const BaseFlex = hope("div");

export function Flex<C extends ElementType = "div">(props: FlexProps<C>) {
  const [flexOptions, others] = splitProps(props, [
    "inline",
    "align",
    "justify",
    "wrap",
    "direction",
    "basis",
    "grow",
    "shrink",
  ]);

  return (
    <BaseFlex
      display={flexOptions.inline ? "inline-flex" : "flex"}
      alignItems={flexOptions.align}
      justifyContent={flexOptions.justify}
      flexWrap={flexOptions.wrap}
      flexDirection={flexOptions.direction}
      flexBasis={flexOptions.basis}
      flexGrow={flexOptions.grow}
      flexShrink={flexOptions.shrink}
      {...others}
    />
  );
}

Flex.className = BaseFlex.className;
Flex.displayName = BaseFlex.displayName;
Flex.selector = BaseFlex.selector;
Flex.toString = () => BaseFlex.selector;
