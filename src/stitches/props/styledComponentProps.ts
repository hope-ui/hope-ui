import { ElementType, PolymorphicComponentProps } from "@/components";

import { BackgroundProps, backgroundPropsKeys } from "./backgroundProps";
import { BorderProps, borderPropsKeys } from "./borderProps";
import { BorderRadiusProps, borderRadiusPropsKeys } from "./borderRadiusProps";
import { ColorProps, colorPropsKeys } from "./colorProps";
import { FlexboxProps, flexboxPropsKeys } from "./flexboxProps";
import { GridProps, gridPropsKeys } from "./gridProps";
import { LayoutProps, layoutPropsKeys } from "./layoutProps";
import { MarginProps, marginPropsKeys } from "./marginProps";
import { OtherCSSProps, otherCSSPropsKeys } from "./otherCSSProps";
import { PaddingProps, paddingPropsKeys } from "./paddingProps";
import { PositionProps, positionPropsKeys } from "./positionProps";
import { PseudoProps, pseudoPropsKeys } from "./pseudoProps";
import { ShadowProps, shadowPropsKeys } from "./shadowProps";
import { SizeProps, sizePropsKeys } from "./sizeProps";
import { SxProp } from "./sxProp";
import { TypographyProps, typographyPropsKeys } from "./typographyProps";

export type StyledComponentOptions = MarginProps &
  PaddingProps &
  ColorProps &
  TypographyProps &
  SizeProps &
  LayoutProps &
  FlexboxProps &
  GridProps &
  BackgroundProps &
  BorderProps &
  BorderRadiusProps &
  PositionProps &
  ShadowProps &
  PseudoProps &
  OtherCSSProps;

export type StyledComponentProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  StyledComponentOptions & SxProp
>;

export type StyledComponentOptionsKeys = keyof StyledComponentOptions;

/**
 * Array based on the `StyledComponentOptions`.
 * Used to splitProps in SolidJS components
 */
export const styledComponentOptionsKeys: StyledComponentOptionsKeys[] = [
  ...marginPropsKeys,
  ...paddingPropsKeys,
  ...colorPropsKeys,
  ...typographyPropsKeys,
  ...sizePropsKeys,
  ...layoutPropsKeys,
  ...flexboxPropsKeys,
  ...gridPropsKeys,
  ...backgroundPropsKeys,
  ...borderPropsKeys,
  ...borderRadiusPropsKeys,
  ...positionPropsKeys,
  ...shadowPropsKeys,
  ...pseudoPropsKeys,
  ...otherCSSPropsKeys,
];
