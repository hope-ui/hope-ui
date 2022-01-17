import { objectKeys } from "@/utils/object";

import {
  BackgroundProps,
  BorderProps,
  BorderRadiusProps,
  ColorProps,
  FlexboxProps,
  GridProps,
  LayoutProps,
  MarginProps,
  OtherCSSProps,
  PaddingProps,
  PositionProps,
  ShadowProps,
  SizeProps,
  SpacingProps,
  StyleProps,
  TypographyProps,
} from "./props";
import { pseudoSelectors } from "./shorthands/pseudos";

/* 
Hack to get all styles prop names in sync with the related prop types 
*/

type PropConfig<T> = Record<keyof T, true>;

const background: PropConfig<BackgroundProps> = {
  bg: true,
  background: true,
  bgColor: true,
  backgroundColor: true,
  bgGradient: true,
  bgClip: true,
  backgroundClip: true,
  bgImage: true,
  backgroundImage: true,
  bgSize: true,
  backgroundSize: true,
  bgPosition: true,
  backgroundPosition: true,
  bgRepeat: true,
  backgroundRepeat: true,
  bgAttachment: true,
  backgroundAttachment: true,
};

const border: PropConfig<BorderProps> = {
  border: true,
  borderWidth: true,
  borderStyle: true,
  borderColor: true,
  borderTop: true,
  borderTopWidth: true,
  borderTopStyle: true,
  borderTopColor: true,
  borderRight: true,
  borderEnd: true,
  borderRightWidth: true,
  borderEndWidth: true,
  borderRightStyle: true,
  borderEndStyle: true,
  borderRightColor: true,
  borderEndColor: true,
  borderBottom: true,
  borderBottomWidth: true,
  borderBottomStyle: true,
  borderBottomColor: true,
  borderLeft: true,
  borderStart: true,
  borderLeftWidth: true,
  borderStartWidth: true,
  borderLeftStyle: true,
  borderStartStyle: true,
  borderLeftColor: true,
  borderStartColor: true,
  borderX: true,
  borderY: true,
};

const borderRadius: PropConfig<BorderRadiusProps> = {
  borderRadius: true,
  borderTopLeftRadius: true,
  borderTopRightRadius: true,
  borderBottomRightRadius: true,
  borderBottomLeftRadius: true,
  borderTopRadius: true,
  borderRightRadius: true,
  borderBottomRadius: true,
  borderLeftRadius: true,
};

const color: PropConfig<ColorProps> = { color: true, opacity: true };

const flexbox: PropConfig<FlexboxProps> = {
  alignItems: true,
  alignContent: true,
  justifyItems: true,
  justifyContent: true,
  flexWrap: true,
  flexDirection: true,
  flex: true,
  flexGrow: true,
  flexShrink: true,
  flexBasis: true,
  justifySelf: true,
  alignSelf: true,
  order: true,
};

const grid: PropConfig<GridProps> = {
  gap: true,
  rowGap: true,
  columnGap: true,
  gridColumn: true,
  gridRow: true,
  gridArea: true,
  gridAutoFlow: true,
  gridAutoRows: true,
  gridAutoColumns: true,
  gridTemplateRows: true,
  gridTemplateColumns: true,
  gridTemplateAreas: true,
};

const layout: PropConfig<LayoutProps> = {
  d: true,
  display: true,
  verticalAlign: true,
  overflow: true,
  overflowX: true,
  overflowY: true,
};

const margin: PropConfig<MarginProps> = {
  m: true,
  margin: true,
  mx: true,
  my: true,
  mt: true,
  marginTop: true,
  mr: true,
  marginRight: true,
  me: true,
  marginEnd: true,
  mb: true,
  marginBottom: true,
  ml: true,
  marginLeft: true,
  ms: true,
  marginStart: true,
};

const otherCSS: PropConfig<OtherCSSProps> = {
  animation: true,
  appearance: true,
  transform: true,
  transformOrigin: true,
  visibility: true,
  whiteSpace: true,
  userSelect: true,
  pointerEvents: true,
  wordBreak: true,
  overflowWrap: true,
  textOverflow: true,
  boxSizing: true,
  cursor: true,
  resize: true,
  transition: true,
  objectFit: true,
  objectPosition: true,
  float: true,
  fill: true,
  stroke: true,
  outline: true,
};

const padding: PropConfig<PaddingProps> = {
  p: true,
  padding: true,
  px: true,
  py: true,
  pt: true,
  paddingTop: true,
  pr: true,
  paddingRight: true,
  pe: true,
  paddingEnd: true,
  pb: true,
  paddingBottom: true,
  pl: true,
  paddingLeft: true,
  ps: true,
  paddingStart: true,
};

const position: PropConfig<PositionProps> = {
  pos: true,
  position: true,
  zIndex: true,
  top: true,
  right: true,
  left: true,
  bottom: true,
};

const shadow: PropConfig<ShadowProps> = { textShadow: true, shadow: true, boxShadow: true };

const size: PropConfig<SizeProps> = {
  w: true,
  width: true,
  minW: true,
  minWidth: true,
  maxW: true,
  maxWidth: true,
  h: true,
  height: true,
  minH: true,
  minHeight: true,
  maxH: true,
  maxHeight: true,
  boxSize: true,
};

const spacing: PropConfig<SpacingProps> = {
  spaceX: true,
  spaceY: true,
};

const typography: PropConfig<TypographyProps> = {
  fontFamily: true,
  fontSize: true,
  fontWeight: true,
  lineHeight: true,
  letterSpacing: true,
  textAlign: true,
  fontStyle: true,
  textTransform: true,
  textDecoration: true,
};

const styleProps: PropConfig<StyleProps> = {
  ...margin,
  ...padding,
  ...color,
  ...typography,
  ...size,
  ...layout,
  ...flexbox,
  ...grid,
  ...spacing,
  ...background,
  ...border,
  ...borderRadius,
  ...position,
  ...shadow,
  ...otherCSS,
};

/**
 * Array based on all style and pseudo prop names.
 * Used to splitProps in SolidJS components
 */
export const systemPropNames = objectKeys({ ...styleProps, ...pseudoSelectors });
