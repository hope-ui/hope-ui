import { BackgroundProps, SpacingProps } from ".";
import { BorderProps } from "./borderProps";
import { BorderRadiusProps } from "./borderRadiusProps";
import { ColorProps } from "./colorProps";
import { FlexboxProps } from "./flexboxProps";
import { GridProps } from "./gridProps";
import { LayoutProps } from "./layoutProps";
import { MarginProps } from "./marginProps";
import { OtherCSSProps } from "./otherCSSProps";
import { PaddingProps } from "./paddingProps";
import { PositionProps } from "./positionProps";
import { ShadowProps } from "./shadowProps";
import { SizeProps } from "./sizeProps";
import { TypographyProps } from "./typographyProps";

export type StyleProps = MarginProps &
  PaddingProps &
  ColorProps &
  TypographyProps &
  SizeProps &
  LayoutProps &
  FlexboxProps &
  GridProps &
  SpacingProps &
  BackgroundProps &
  BorderProps &
  BorderRadiusProps &
  PositionProps &
  ShadowProps &
  OtherCSSProps;
