import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import {
  CommonStyleProps,
  CSSProp,
  FlexboxAndGridProps,
  FlexboxProps,
  GridProps,
} from "@/stitches/props/styleProps";
import {
  commonStylePropConfig,
  flexboxAndGridPropConfig,
  flexboxPropConfig,
  getIntersectionKeys,
  gridPropConfig,
} from "@/stitches/props/stylePropsConfig";
import { stitches } from "@/stitches/stitches.config";

import { ElementType, PolymorphicComponentProps } from "../types";

export type BoxProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  CommonStyleProps & FlexboxProps & GridProps & FlexboxAndGridProps & CSSProp
>;

const box = stitches.css();

export function Box<C extends ElementType = "div">(props: BoxProps<C>) {
  const usedStylePropNames = getIntersectionKeys(props, {
    ...commonStylePropConfig,
    ...flexboxPropConfig,
    ...gridPropConfig,
    ...flexboxAndGridPropConfig,
  });

  const [local, styleProps, others] = splitProps(
    props,
    ["as", "class", "className", "classList", "css"],
    usedStylePropNames
  );

  const classList = () => {
    const boxWithCSSOverride = box({
      css: {
        ...styleProps,
        ...local.css,
      },
    });

    return {
      [boxWithCSSOverride]: true,
      [local.class || ""]: true,
      [local.className || ""]: true,
      ...local.classList,
    };
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
