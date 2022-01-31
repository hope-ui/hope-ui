import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";

import { createBorderUtilityVariants } from "./variants/border";
import { createColorUtilityVariants } from "./variants/colors";
import {
  createCommonFlexboxAndGridUtilityVariants,
  createFlexboxUtilityVariants,
} from "./variants/flexbox";
import { createGridUtilityVariants } from "./variants/grid";
import { createLayoutUtilityVariants } from "./variants/layout";
import { createPositionUtilityVariants } from "./variants/position";
import { createRadiiUtilityVariants } from "./variants/radii";
import { createShadowUtilityVariants } from "./variants/shadows";
import { createSizeUtilityVariants } from "./variants/sizes";
import { createSpaceUtilityVariants } from "./variants/space";
import { createTypographyUtilityVariants } from "./variants/typography";

/**
 * Styled styled base styles inherited by all Hope UI components.
 */
export const styledSystemStyles = css({
  variants: {
    ...createBorderUtilityVariants(),
    ...createColorUtilityVariants(),
    ...createCommonFlexboxAndGridUtilityVariants(),
    ...createFlexboxUtilityVariants(),
    ...createGridUtilityVariants(),
    ...createLayoutUtilityVariants(),
    ...createPositionUtilityVariants(),
    ...createRadiiUtilityVariants(),
    ...createShadowUtilityVariants(),
    ...createSizeUtilityVariants(),
    ...createSpaceUtilityVariants(),
    ...createTypographyUtilityVariants(),
  },
});

export type StyledSystemVariants = VariantProps<typeof styledSystemStyles>;

export const styledSystemVariantsKeys: Record<keyof StyledSystemVariants, true> = {
  // Border
  borderWidth: true,
  borderStyle: true,

  // Color
  color: true,
  bg: true,
  borderColor: true,

  // Flexbox
  flex: true,
  flexDirection: true,
  flexWrap: true,
  flexGrow: true,
  flexShrink: true,
  order: true,
  alignItems: true,
  alignContent: true,
  alignSelf: true,
  justifyItems: true,
  justifyContent: true,
  justifySelf: true,
  placeItems: true,
  placeContent: true,
  placeSelf: true,

  // Grid
  gridAutoFlow: true,
  gridAutoColumns: true,
  gridAutoRows: true,
  gridTemplateColumns: true,
  gridTemplateRows: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  gridColumnEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridRowEnd: true,

  // Layout
  display: true,
  verticalAlign: true,
  overflow: true,
  overflowX: true,
  overflowY: true,

  // Position
  position: true,
  zIndex: true,

  // Radii
  borderRadius: true,

  // Sizes
  w: true,
  minW: true,
  maxW: true,
  h: true,
  minH: true,
  maxH: true,
  boxSize: true,
  boxShadow: true,

  // Space
  m: true,
  mx: true,
  my: true,
  mt: true,
  mr: true,
  mb: true,
  ml: true,

  p: true,
  px: true,
  py: true,
  pt: true,
  pr: true,
  pb: true,
  pl: true,

  top: true,
  right: true,
  bottom: true,
  left: true,

  gap: true,
  rowGap: true,
  columnGap: true,

  // Typography
  fontFamily: true,
  fontSize: true,
  fontWeight: true,
  fontStyle: true,
  lineHeight: true,
  letterSpacing: true,
  textAlign: true,
  textTransform: true,
  lineClamp: true,
};
