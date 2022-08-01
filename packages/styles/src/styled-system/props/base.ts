import { BorderProps } from "./border";
import { ColorProps } from "./color";
import { FlexboxProps } from "./flexbox";
import { GridLayoutProps } from "./grid";
import { InteractivityProps } from "./interactivity";
import { LayoutProps } from "./layout";
import { MarginProps } from "./margin";
import { PaddingProps } from "./padding";
import { PositionProps } from "./position";
import { RadiiProps } from "./radii";
import { ShadowProps } from "./shadow";
import { SizeProps } from "./size";
import { TypographyProps } from "./typography";

// moved here to avoid circular import with `pseudos`.
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
