import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { BorderProps } from "@/styled-system/props/borderProps";
import { ColorProps } from "@/styled-system/props/colorProps";
import { CommonFlexboxAndGridProps } from "@/styled-system/props/commonFlexboxAndGridProps";
import { CSSProp } from "@/styled-system/props/cssProp";
import { FlexboxProps } from "@/styled-system/props/flexboxProps";
import { GridProps } from "@/styled-system/props/gridProps";
import { LayoutProps } from "@/styled-system/props/layoutProps";
import { MarginProps } from "@/styled-system/props/marginProps";
import { PaddingProps } from "@/styled-system/props/paddingProps";
import { PositionProps } from "@/styled-system/props/positionProps";
import { PseudoProps } from "@/styled-system/props/pseudoProps";
import { ShadowProps } from "@/styled-system/props/shadowProps";
import { SizeProps } from "@/styled-system/props/sizeProps";
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
  pseudoPropConfig,
  shadowPropConfig,
  sizePropConfig,
  typographyPropConfig,
} from "@/styled-system/props/stylePropsConfig";
import { TypographyProps } from "@/styled-system/props/typographyProps";
import { css } from "@/styled-system/stitches.config";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonPropNames } from "../utils";

type BoxOptions = LayoutProps &
  ColorProps &
  BorderProps &
  ShadowProps &
  MarginProps &
  PaddingProps &
  PositionProps &
  PseudoProps &
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
  ...pseudoPropConfig,
  ...sizePropConfig,
  ...flexboxPropConfig,
  ...gridPropConfig,
  ...commonFlexboxAndGridPropConfig,
  ...typographyPropConfig,
};

const boxCssComponent = css();

/**
 * Box is the most abstract component of Hope UI.
 *
 * Box allows you to use style props with any element or component.
 * Box itself does not include any styles.
 *
 * By default, it renders a div element.
 *
 * @param props {@link BoxProps}
 */
export function Box<C extends ElementType = "div">(props: BoxProps<C>) {
  const stylePropNames = getIntersectionKeys(props, boxStylePropConfig);

  const [local, styleProps, others] = splitProps(props, commonPropNames, stylePropNames);

  const classList = () => {
    const boxWithOverrides = boxCssComponent({
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

Box.className = boxCssComponent.className;
Box.toString = () => boxCssComponent.selector;
