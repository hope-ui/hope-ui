import { BorderProps } from "./borderProps";
import { ColorProps } from "./colorProps";
import { CommonFlexboxAndGridProps } from "./commonFlexboxAndGridProps";
import { CSSProp } from "./cssProp";
import { FlexboxProps } from "./flexboxProps";
import { GridProps } from "./gridProps";
import { LayoutProps } from "./layoutProps";
import { MarginProps } from "./marginProps";
import { PaddingProps } from "./paddingProps";
import { PositionProps } from "./positionProps";
import { PseudoProps } from "./pseudoProps";
import { ShadowProps } from "./shadowProps";
import { SizeProps } from "./sizeProps";
import { TypographyProps } from "./typographyProps";

/**
 * Type for all Hope UI style props
 */
export type StyleProps = LayoutProps &
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
