import { Property } from "csstype";
import { splitProps } from "solid-js";

import { hope } from "../factory";
import { ElementType, HopeComponentProps } from "../types";

export type FlexOptions = Partial<{
  /**
   * Shorthand for `display: inline-flex`
   */
  inlineFlex: boolean;
  /**
   * Shorthand for `alignItems` style prop
   */
  align: Property.AlignItems;

  /**
   * Shorthand for `justifyContent` style prop
   */
  justify: Property.JustifyContent;

  /**
   * Shorthand for `flexWrap` style prop
   */
  wrap: Property.FlexWrap;

  /**
   * Shorthand for `flexDirection` style prop
   */
  direction: Property.FlexDirection;

  /**
   * Shorthand for `flexBasis` style prop
   */
  basis: Property.FlexBasis;

  /**
   * Shorthand for `flexGrow` style prop
   */
  grow: Property.FlexGrow;

  /**
   * Shorthand for `flexShrink` style prop
   */
  shrink: Property.FlexShrink;
}>;

export type FlexProps<C extends ElementType> = HopeComponentProps<C, []> & FlexOptions;

const BaseFlex = hope("div", {
  display: "flex",

  variants: {
    inlineFlex: {
      true: {
        display: "inline-flex",
      },
    },
  },
});

export function Flex<C extends ElementType = "div">(props: FlexProps<C>) {
  const [local, others] = splitProps(props, [
    "inlineFlex",
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
      inlineFlex={local.inlineFlex}
      alignItems={local.align}
      justifyContent={local.justify}
      flexWrap={local.wrap}
      flexDirection={local.direction}
      flexBasis={local.basis}
      flexGrow={local.grow}
      flexShrink={local.shrink}
      {...others}
    />
  );
}

Flex.className = BaseFlex.className;
Flex.displayName = BaseFlex.displayName;
Flex.selector = BaseFlex.selector;
Flex.toString = () => BaseFlex.selector;
