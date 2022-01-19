import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import {
  BorderRadiusProps,
  ColorProps,
  CSSProp,
  DisplayProps,
  FlexboxAndGridProps,
  FlexboxProps,
  GridProps,
  MarginProps,
  PaddingProps,
  ShadowProps,
  SizeProps,
} from "@/stitches/props/styleProps";
import {
  borderRadiusPropConfig,
  colorPropConfig,
  displayPropConfig,
  flexboxAndGridPropConfig,
  flexboxPropConfig,
  getIntersectionKeys,
  gridPropConfig,
  marginPropConfig,
  paddingPropConfig,
  shadowPropConfig,
  sizePropConfig,
} from "@/stitches/props/stylePropsConfig";
import { stitches } from "@/stitches/stitches.config";

import { ElementType, PolymorphicComponentProps } from "../types";

type BoxOptions = DisplayProps &
  ColorProps &
  BorderRadiusProps &
  ShadowProps &
  MarginProps &
  PaddingProps &
  SizeProps &
  FlexboxProps &
  GridProps &
  FlexboxAndGridProps &
  CSSProp;

export type BoxProps<C extends ElementType> = PolymorphicComponentProps<C, BoxOptions>;

const boxStylePropConfig = {
  ...displayPropConfig,
  ...colorPropConfig,
  ...borderRadiusPropConfig,
  ...shadowPropConfig,
  ...marginPropConfig,
  ...paddingPropConfig,
  ...sizePropConfig,
  ...flexboxPropConfig,
  ...gridPropConfig,
  ...flexboxAndGridPropConfig,
};

const box = stitches.css();

export function Box<C extends ElementType = "div">(props: BoxProps<C>) {
  const usedStylePropNames = getIntersectionKeys(props, boxStylePropConfig);

  const [local, styleProps, others] = splitProps(
    props,
    ["as", "class", "className", "classList", "css"],
    usedStylePropNames
  );

  const classList = () => {
    const boxWithOverrides = box({
      css: {
        ...styleProps,
        ...local.css,
      },
    });

    return {
      [boxWithOverrides]: true,
      [local.class || ""]: true,
      [local.className || ""]: true,
      ...local.classList,
    };
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
