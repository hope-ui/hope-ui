import { BorderProps } from "./borderProps";
import { ColorProps } from "./colorProps";
import { CommonFlexboxAndGridProps } from "./commonFlexboxAndGridProps";
import { FlexboxProps } from "./flexboxProps";
import { GridProps } from "./gridProps";
import { LayoutProps } from "./layoutProps";
import { MarginProps } from "./marginProps";
import { PaddingProps } from "./paddingProps";
import { PositionProps } from "./positionProps";
import { ShadowProps } from "./shadowProps";
import { SizeProps } from "./sizeProps";
import { TypographyProps } from "./typographyProps";

/*
 * Hack to get all styles prop names in sync with they related prop types.
 * Here we don't care about the value, only the object keys.
 * With this, when a value change in the prop type we get an error here.
 */

type PropConfig<T> = Record<keyof T, true>;

/**
 * Style prop names for layour related properties
 */
export const layoutPropConfig: PropConfig<LayoutProps> = {
  display: true,
  verticalAlign: true,
  overflow: true,
  overflowX: true,
  overflowY: true,
};

/**
 * Style prop names for color related properties
 */
export const colorPropConfig: PropConfig<ColorProps> = {
  color: true,
  bg: true,
  opacity: true,
};

/**
 * Style prop names for border properties
 */
export const borderPropConfig: PropConfig<BorderProps> = {
  border: true,
  borderWidth: true,
  borderStyle: true,
  borderColor: true,
  borderRadius: true,
};

/**
 * Style prop names for shadows properties
 */
export const shadowPropConfig: PropConfig<ShadowProps> = {
  boxShadow: true,
};

/**
 * Style prop names for margin properties
 */
export const marginPropConfig: PropConfig<MarginProps> = {
  m: true,
  mx: true,
  my: true,
  mt: true,
  mr: true,
  mb: true,
  ml: true,
};

/**
 * Style prop names for padding properties
 */
export const paddingPropConfig: PropConfig<PaddingProps> = {
  p: true,
  px: true,
  py: true,
  pt: true,
  pr: true,
  pb: true,
  pl: true,
};

/**
 * Style prop names for position realted properties
 */
export const positionPropConfig: PropConfig<PositionProps> = {
  position: true,
  zIndex: true,
  top: true,
  right: true,
  bottom: true,
  left: true,
};

/**
 * Style prop names for sizes properties
 */
export const sizePropConfig: PropConfig<SizeProps> = {
  w: true,
  minW: true,
  maxW: true,
  h: true,
  minH: true,
  maxH: true,
  boxSize: true,
};

/**
 * Style prop names used in flexbox based components
 */
export const flexboxPropConfig: PropConfig<FlexboxProps> = {
  justifyItems: true,
  flexWrap: true,
  flexDirection: true,
  flex: true,
  flexGrow: true,
  flexShrink: true,
  flexBasis: true,
  justifySelf: true,
  alignSelf: true,
};

/**
 * Style prop names used in CSS grid based components
 */
export const gridPropConfig: PropConfig<GridProps> = {
  gridColumnStart: true,
  gridRowStart: true,
  gridRowEnd: true,
  gridTemplate: true,
  gridColumnEnd: true,
  gridColumn: true,
  gridRow: true,
  gridAutoFlow: true,
  gridAutoColumns: true,
  gridAutoRows: true,
  gridTemplateColumns: true,
  gridTemplateRows: true,
  gridTemplateAreas: true,
  gridArea: true,
};

/**
 * Style prop names used in flexbox and CSS grid based components
 */
export const commonFlexboxAndGridPropConfig: PropConfig<CommonFlexboxAndGridProps> = {
  alignItems: true,
  alignContent: true,
  justifyContent: true,
  gap: true,
  rowGap: true,
  columnGap: true,
  placeContent: true,
  placeItems: true,
  placeSelf: true,
  order: true,
};

/**
 * Style prop names used in typography properties
 */
export const typographyPropConfig: PropConfig<TypographyProps> = {
  fontFamily: true,
  fontSize: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  letterSpacing: true,
  textAlign: true,
  fontStyle: true,
  textTransform: true,
  textDecoration: true,
};

/**
 * Get the common keys between two objects
 * @param obj The object to check if it contains some keys of the reference object.
 * @param reference The reference object to look for.
 * @returns An array of the common keys.
 */
export function getIntersectionKeys<R = Record<string, unknown>>(
  obj: Record<string, unknown>,
  reference: R
) {
  return Object.keys(obj).filter(key => key in reference) as Array<keyof R>;
}
