import { CSSObject } from "../types";
import { SystemStyleProps } from "./system";

/** Map system style shorthand props to css properties. */
export const SHORTHAND_MAP: Partial<Record<keyof SystemStyleProps, Array<keyof CSSObject>>> = {
  // border
  borderX: ["borderRight", "borderLeft"],
  borderY: ["borderTop", "borderBottom"],

  // color
  bg: ["background"],

  // layout
  d: ["display"],

  // margin
  m: ["margin"],
  mt: ["marginTop"],
  mr: ["marginRight"],
  mb: ["marginBottom"],
  ml: ["marginLeft"],
  mx: ["marginInlineStart", "marginInlineEnd"],
  my: ["marginTop", "marginBottom"],

  // padding
  p: ["padding"],
  pt: ["paddingTop"],
  pr: ["paddingRight"],
  pb: ["paddingBottom"],
  pl: ["paddingLeft"],
  px: ["paddingInlineStart", "paddingInlineEnd"],
  py: ["paddingTop", "paddingBottom"],

  // radii
  borderTopRadius: ["borderTopLeftRadius", "borderTopRightRadius"],
  borderRightRadius: ["borderTopRightRadius", "borderBottomRightRadius"],
  borderBottomRadius: ["borderBottomRightRadius", "borderBottomLeftRadius"],
  borderLeftRadius: ["borderTopLeftRadius", "borderBottomLeftRadius"],
  rounded: ["borderRadius"],
  roundedTop: ["borderTopLeftRadius", "borderTopRightRadius"],
  roundedRight: ["borderTopRightRadius", "borderBottomRightRadius"],
  roundedBottom: ["borderBottomRightRadius", "borderBottomLeftRadius"],
  roundedLeft: ["borderTopLeftRadius", "borderBottomLeftRadius"],

  // shadow
  shadow: ["boxShadow"],

  // size
  w: ["width"],
  minW: ["minWidth"],
  maxW: ["maxWidth"],
  h: ["height"],
  minH: ["minHeight"],
  maxH: ["maxHeight"],
  boxSize: ["width", "height"],
};
