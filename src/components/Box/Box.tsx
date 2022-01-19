import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { BorderProps } from "@/stitches/props/borderProps";
import { ColorProps } from "@/stitches/props/colorProps";
import { CommonFlexboxAndGridProps } from "@/stitches/props/commonFlexboxAndGridProps";
import { CSSProp } from "@/stitches/props/cssProp";
import { FlexboxProps } from "@/stitches/props/flexboxProps";
import { GridProps } from "@/stitches/props/gridProps";
import { LayoutProps } from "@/stitches/props/layoutProps";
import { MarginProps } from "@/stitches/props/marginProps";
import { PaddingProps } from "@/stitches/props/paddingProps";
import { PositionProps } from "@/stitches/props/positionProps";
import { ShadowProps } from "@/stitches/props/shadowProps";
import { SizeProps } from "@/stitches/props/sizeProps";
import {
  borderPropConfig,
  colorPropConfig,
  commonFlexboxAndGridPropConfig,
  flexboxPropConfig,
  getIntersectionKeys,
  gridPropConfig,
  layoutPropConfig,
  marginPropConfig,
  paddingPropConfig,
  positionPropConfig,
  shadowPropConfig,
  sizePropConfig,
  typographyPropConfig,
} from "@/stitches/props/stylePropsConfig";
import { TypographyProps } from "@/stitches/props/typographyProps";
import { stitches } from "@/stitches/stitches.config";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonPropNames } from "../utils";

type BoxOptions = LayoutProps &
  ColorProps &
  BorderProps &
  ShadowProps &
  MarginProps &
  PaddingProps &
  PositionProps &
  SizeProps &
  FlexboxProps &
  GridProps &
  CommonFlexboxAndGridProps &
  TypographyProps &
  CSSProp;

export type BoxProps<C extends ElementType> = PolymorphicComponentProps<C, BoxOptions>;

const boxStylePropConfig = {
  ...layoutPropConfig,
  ...colorPropConfig,
  ...borderPropConfig,
  ...shadowPropConfig,
  ...marginPropConfig,
  ...paddingPropConfig,
  ...positionPropConfig,
  ...sizePropConfig,
  ...flexboxPropConfig,
  ...gridPropConfig,
  ...commonFlexboxAndGridPropConfig,
  ...typographyPropConfig,
};

const box = stitches.css();

export function Box<C extends ElementType = "div">(props: BoxProps<C>) {
  const stylePropNames = getIntersectionKeys(props, boxStylePropConfig);

  const [local, styleProps, others] = splitProps(props, commonPropNames, stylePropNames);

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
