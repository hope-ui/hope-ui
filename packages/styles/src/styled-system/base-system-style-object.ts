import { CSSObject } from "../types";
import { BorderProps } from "./props/border";
import { ColorProps } from "./props/color";
import { FlexboxProps } from "./props/flexbox";
import { GridLayoutProps } from "./props/grid";
import { InteractivityProps } from "./props/interactivity";
import { LayoutProps } from "./props/layout";
import { MarginProps } from "./props/margin";
import { PaddingProps } from "./props/padding";
import { PositionProps } from "./props/position";
import { RadiiProps } from "./props/radii";
import { ShadowProps } from "./props/shadow";
import { SizeProps } from "./props/size";
import { TypographyProps } from "./props/typography";

// moved here to avoid circular import.
export type BaseSystemStyleProps = BorderProps &
  ColorProps &
  FlexboxProps &
  GridLayoutProps &
  InteractivityProps &
  LayoutProps &
  MarginProps &
  PaddingProps &
  PositionProps &
  RadiiProps &
  ShadowProps &
  SizeProps &
  TypographyProps;

export type BaseSystemStyleObject = CSSObject & BaseSystemStyleProps;
