import { KeysOf, SystemStyleProps } from "../types";
import {
  BorderProps,
  ColorProps,
  FlexboxProps,
  GridLayoutProps,
  InteractivityProps,
  LayoutProps,
  MarginProps,
  PaddingProps,
  PositionProps,
  PseudoSelectorProps,
  RadiiProps,
  ShadowProps,
  SizeProps,
  TypographyProps,
} from "../types/styled-system";

const borderPropNames: KeysOf<BorderProps> = {
  border: true,
  borderWidth: true,
  borderStyle: true,
  borderColor: true,
  borderTop: true,
  borderTopWidth: true,
  borderTopStyle: true,
  borderTopColor: true,
  borderRight: true,
  borderRightWidth: true,
  borderRightStyle: true,
  borderRightColor: true,
  borderBottom: true,
  borderBottomWidth: true,
  borderBottomStyle: true,
  borderBottomColor: true,
  borderLeft: true,
  borderLeftWidth: true,
  borderLeftStyle: true,
  borderLeftColor: true,
  borderX: true,
  borderY: true,
};

const colorPropNames: KeysOf<ColorProps> = {
  color: true,
  bg: true,
  background: true,
  bgColor: true,
  backgroundColor: true,
  opacity: true,
};

const flexboxPropNames: KeysOf<FlexboxProps> = {
  alignItems: true,
  alignContent: true,
  alignSelf: true,
  justifyItems: true,
  justifyContent: true,
  justifySelf: true,
  flexDirection: true,
  flexWrap: true,
  flex: true,
  flexGrow: true,
  flexShrink: true,
  flexBasis: true,
  order: true,
};

const gridLayoutPropNames: KeysOf<GridLayoutProps> = {
  gridTemplate: true,
  gridTemplateColumns: true,
  gridTemplateRows: true,
  gridTemplateAreas: true,
  gridArea: true,
  gridRow: true,
  gridRowStart: true,
  gridRowEnd: true,
  gridColumn: true,
  gridColumnStart: true,
  gridColumnEnd: true,
  gridAutoFlow: true,
  gridAutoColumns: true,
  gridAutoRows: true,
  placeItems: true,
  placeContent: true,
  placeSelf: true,
  gap: true,
  rowGap: true,
  columnGap: true,
};

const interactivityPropNames: KeysOf<InteractivityProps> = {
  appearance: true,
  userSelect: true,
  pointerEvents: true,
  resize: true,
  cursor: true,
  outline: true,
  outlineOffset: true,
  outlineColor: true,
};

const layoutPropNames: KeysOf<LayoutProps> = {
  d: true,
  display: true,
  verticalAlign: true,
  overflow: true,
  overflowX: true,
  overflowY: true,
};

const marginPropNames: KeysOf<MarginProps> = {
  margin: true,
  marginTop: true,
  marginRight: true,
  marginBottom: true,
  marginLeft: true,
  m: true,
  mt: true,
  mr: true,
  mb: true,
  ml: true,
  mx: true,
  my: true,
};

const paddingPropNames: KeysOf<PaddingProps> = {
  padding: true,
  paddingTop: true,
  paddingRight: true,
  paddingBottom: true,
  paddingLeft: true,
  p: true,
  pt: true,
  pr: true,
  pb: true,
  pl: true,
  px: true,
  py: true,
};

const positionPropNames: KeysOf<PositionProps> = {
  position: true,
  zIndex: true,
  top: true,
  right: true,
  bottom: true,
  left: true,
};

const radiiPropNames: KeysOf<RadiiProps> = {
  borderRadius: true,
  borderTopRightRadius: true,
  borderTopLeftRadius: true,
  borderBottomRightRadius: true,
  borderBottomLeftRadius: true,
  borderTopRadius: true,
  borderRightRadius: true,
  borderBottomRadius: true,
  borderLeftRadius: true,
  rounded: true,
  roundedTop: true,
  roundedRight: true,
  roundedBottom: true,
  roundedLeft: true,
};

const shadowPropNames: KeysOf<ShadowProps> = {
  boxShadow: true,
  shadow: true,
};

const sizePropNames: KeysOf<SizeProps> = {
  width: true,
  minWidth: true,
  maxWidth: true,
  height: true,
  minHeight: true,
  maxHeight: true,
  w: true,
  minW: true,
  maxW: true,
  h: true,
  minH: true,
  maxH: true,
  boxSize: true,
};

const typographyPropNames: KeysOf<TypographyProps> = {
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

const pseudoSelectorPropNames: KeysOf<PseudoSelectorProps> = {
  _hover: true,
  _active: true,
  _focus: true,
  _focusWithin: true,
  _focusVisible: true,
  _disabled: true,
  _before: true,
  _after: true,
  _groupHover: true,
  _groupActive: true,
  _groupFocus: true,
  _groupFocusWithin: true,
  _groupFocusVisible: true,
  _groupDisabled: true,
  _peerHover: true,
  _peerActive: true,
  _peerFocus: true,
  _peerFocusWithin: true,
  _peerFocusVisible: true,
  _peerDisabled: true,
};

export const stylePropNames: KeysOf<SystemStyleProps> = {
  ...borderPropNames,
  ...colorPropNames,
  ...flexboxPropNames,
  ...gridLayoutPropNames,
  ...interactivityPropNames,
  ...layoutPropNames,
  ...marginPropNames,
  ...paddingPropNames,
  ...positionPropNames,
  ...radiiPropNames,
  ...shadowPropNames,
  ...sizePropNames,
  ...typographyPropNames,
  ...pseudoSelectorPropNames,
};
