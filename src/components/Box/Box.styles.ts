import { VariantProps } from "@stitches/core";

import { css, theme } from "@/theme/stitches.config";
import { SystemStyleObject } from "@/theme/types";

type UtilityVariant<T extends string | number | symbol> = Record<T, SystemStyleObject>;

/* -------------------------------------------------------------------------------------------------
 * Display utilities
 * -----------------------------------------------------------------------------------------------*/

function createDisplayUtilityVariants() {
  return {
    display: {
      none: { display: "none" } as SystemStyleObject,
      inline: { display: "inline" } as SystemStyleObject,
      block: { display: "block" } as SystemStyleObject,
      "inline-block": { display: "inline-block" } as SystemStyleObject,
      flex: { display: "flex" } as SystemStyleObject,
      "inline-flex": { display: "inline-flex" } as SystemStyleObject,
      grid: { display: "grid" } as SystemStyleObject,
      "inline-grid": { display: "inline-grid" } as SystemStyleObject,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Vertical alignment utilities
 * -----------------------------------------------------------------------------------------------*/

function createVerticalAlignUtilityVariants() {
  return {
    verticalAlign: {
      baseline: { verticalAlign: "baseline" } as SystemStyleObject,
      top: { verticalAlign: "top" } as SystemStyleObject,
      middle: { verticalAlign: "middle" } as SystemStyleObject,
      bottom: { verticalAlign: "bottom" } as SystemStyleObject,
      "text-top": { verticalAlign: "text-top" } as SystemStyleObject,
      "text-bottom": { verticalAlign: "text-bottom" } as SystemStyleObject,
      sub: { verticalAlign: "sub" } as SystemStyleObject,
      super: { verticalAlign: "super" } as SystemStyleObject,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Overflow utilities
 * -----------------------------------------------------------------------------------------------*/

const overflowValues = ["auto", "hidden", "clip", "visible", "scoll"] as const;

type OverflowValue = typeof overflowValues[number];

interface OverflowUtilityVariants {
  overflow: UtilityVariant<OverflowValue>;
  overflowX: UtilityVariant<OverflowValue>;
  overflowY: UtilityVariant<OverflowValue>;
}

function createOverflowUtilityVariants(): OverflowUtilityVariants {
  return overflowValues.reduce(
    (acc, val) => ({
      overflow: { ...acc.overflow, [val]: { overflow: val } as SystemStyleObject },
      overflowX: { ...acc.overflowX, [val]: { overflowX: val } as SystemStyleObject },
      overflowY: { ...acc.overflowY, [val]: { overflowY: val } as SystemStyleObject },
    }),
    {} as OverflowUtilityVariants
  );
}

/* -------------------------------------------------------------------------------------------------
 * Color utilities
 * -----------------------------------------------------------------------------------------------*/

type ColorsVariant = UtilityVariant<keyof typeof theme.colors>;

interface ColorUtilityVariants {
  color: ColorsVariant;
  bg: ColorsVariant;
  borderColor: ColorsVariant;
}

function createColorUtilityVariants(): ColorUtilityVariants {
  return Object.keys(theme.colors).reduce(
    (acc, key) => ({
      color: { ...acc.color, [key]: { color: `$${key}` } as SystemStyleObject },
      bg: { ...acc.bg, [key]: { bg: `$${key}` } as SystemStyleObject },
      borderColor: { ...acc.borderColor, [key]: { borderColor: `$${key}` } as SystemStyleObject },
    }),
    {} as ColorUtilityVariants
  );
}

/* -------------------------------------------------------------------------------------------------
 * Typography utilities
 * -----------------------------------------------------------------------------------------------*/

function createTypographyUtilityVariants() {
  return {
    fontFamily: Object.keys(theme.fonts).reduce(
      (acc, key) => ({ ...acc, [key]: { fontFamily: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.fonts>
    ),
    fontSize: Object.keys(theme.fontSizes).reduce(
      (acc, key) => ({ ...acc, [key]: { fontSize: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.fontSizes>
    ),
    fontWeight: Object.keys(theme.fontWeights).reduce(
      (acc, key) => ({ ...acc, [key]: { fontWeight: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.fontWeights>
    ),
    lineHeight: Object.keys(theme.lineHeights).reduce(
      (acc, key) => ({ ...acc, [key]: { lineHeight: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.lineHeights>
    ),
    letterSpacing: Object.keys(theme.letterSpacings).reduce(
      (acc, key) => ({ ...acc, [key]: { letterSpacing: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.letterSpacings>
    ),
    fontStyle: {
      normal: { fontStyle: "normal" } as SystemStyleObject,
      italic: { fontStyle: "italic" } as SystemStyleObject,
    },
    textAlign: {
      left: { textAlign: "left" } as SystemStyleObject,
      right: { textAlign: "right" } as SystemStyleObject,
      center: { textAlign: "center" } as SystemStyleObject,
      justify: { textAlign: "justify" } as SystemStyleObject,
    },
    textTransform: {
      uppercase: { textTransform: "uppercase" } as SystemStyleObject,
      lowercase: { textTransform: "lowercase" } as SystemStyleObject,
      capitalize: { textTransform: "capitalize" } as SystemStyleObject,
      none: { textTransform: "none" } as SystemStyleObject,
    },
    lineClamp: {
      1: { noOfLines: 1 } as SystemStyleObject,
      2: { noOfLines: 2 } as SystemStyleObject,
      3: { noOfLines: 3 } as SystemStyleObject,
      4: { noOfLines: 4 } as SystemStyleObject,
      5: { noOfLines: 5 } as SystemStyleObject,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Border utilities
 * -----------------------------------------------------------------------------------------------*/

function createBorderUtilityVariants() {
  return {
    borderWidth: {
      0: { borderWidth: "0" } as SystemStyleObject,
      1: { borderWidth: "1px" } as SystemStyleObject,
      2: { borderWidth: "2px" } as SystemStyleObject,
      4: { borderWidth: "4px" } as SystemStyleObject,
      8: { borderWidth: "8px" } as SystemStyleObject,
    },
    borderStyle: {
      solid: { borderStyle: "solid" } as SystemStyleObject,
      dashed: { borderStyle: "dashed" } as SystemStyleObject,
      dotted: { borderStyle: "dotted" } as SystemStyleObject,
      double: { borderStyle: "double" } as SystemStyleObject,
      hidden: { borderStyle: "hidden" } as SystemStyleObject,
      none: { borderStyle: "none" } as SystemStyleObject,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Position and zIndex utilities
 * -----------------------------------------------------------------------------------------------*/

function createPositionUtilityVariants() {
  return {
    position: {
      static: { position: "static" } as SystemStyleObject,
      fixed: { position: "fixed" } as SystemStyleObject,
      absolute: { position: "absolute" } as SystemStyleObject,
      relative: { position: "relative" } as SystemStyleObject,
      sticky: { position: "sticky" } as SystemStyleObject,
    },
    zIndex: Object.keys(theme.zIndices).reduce(
      (acc, key) => ({ ...acc, [key]: { zIndex: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.zIndices>
    ),
  };
}

/* -------------------------------------------------------------------------------------------------
 * Radii utilities
 * -----------------------------------------------------------------------------------------------*/

function createRadiiUtilityVariants() {
  return {
    borderRadius: Object.keys(theme.radii).reduce(
      (acc, key) => ({ ...acc, [key]: { borderRadius: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.radii>
    ),
  };
}

/* -------------------------------------------------------------------------------------------------
 * Shadow utilities
 * -----------------------------------------------------------------------------------------------*/

function createShadowUtilityVariants() {
  return {
    boxShadow: Object.keys(theme.shadows).reduce(
      (acc, key) => ({ ...acc, [key]: { boxShadow: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.shadows>
    ),
  };
}

/* -------------------------------------------------------------------------------------------------
 * Space utilities
 * -----------------------------------------------------------------------------------------------*/

type SpaceVariant = UtilityVariant<keyof typeof theme.space>;
type SpaceVariantWithAuto = UtilityVariant<keyof typeof theme.space | "auto">;

interface SpaceUtilityVariants {
  // Margin
  m: SpaceVariantWithAuto;
  mx: SpaceVariantWithAuto;
  my: SpaceVariantWithAuto;
  mt: SpaceVariantWithAuto;
  mr: SpaceVariantWithAuto;
  mb: SpaceVariantWithAuto;
  ml: SpaceVariantWithAuto;

  // Padding
  p: SpaceVariantWithAuto;
  px: SpaceVariantWithAuto;
  py: SpaceVariantWithAuto;
  pt: SpaceVariantWithAuto;
  pr: SpaceVariantWithAuto;
  pb: SpaceVariantWithAuto;
  pl: SpaceVariantWithAuto;

  // Position
  top: SpaceVariant;
  right: SpaceVariant;
  bottom: SpaceVariant;
  left: SpaceVariant;

  // Flexbox and CSS Grid gap
  gap: SpaceVariant;
  rowGap: SpaceVariant;
  columnGap: SpaceVariant;
}

function createSpaceUtilityVariants(): SpaceUtilityVariants {
  const spaceUtilities = Object.keys(theme.space).reduce(
    (acc, key) => ({
      m: { ...acc.m, [key]: { m: `$${key}` } as SystemStyleObject },
      mx: { ...acc.mx, [key]: { mx: `$${key}` } as SystemStyleObject },
      my: { ...acc.my, [key]: { my: `$${key}` } as SystemStyleObject },
      mt: { ...acc.mt, [key]: { mt: `$${key}` } as SystemStyleObject },
      mr: { ...acc.mr, [key]: { mr: `$${key}` } as SystemStyleObject },
      mb: { ...acc.mb, [key]: { mb: `$${key}` } as SystemStyleObject },
      ml: { ...acc.ml, [key]: { ml: `$${key}` } as SystemStyleObject },

      p: { ...acc.p, [key]: { p: `$${key}` } as SystemStyleObject },
      px: { ...acc.px, [key]: { px: `$${key}` } as SystemStyleObject },
      py: { ...acc.py, [key]: { py: `$${key}` } as SystemStyleObject },
      pt: { ...acc.pt, [key]: { pt: `$${key}` } as SystemStyleObject },
      pr: { ...acc.pr, [key]: { pr: `$${key}` } as SystemStyleObject },
      pb: { ...acc.pb, [key]: { pb: `$${key}` } as SystemStyleObject },
      pl: { ...acc.pl, [key]: { pl: `$${key}` } as SystemStyleObject },

      top: { ...acc.top, [key]: { top: `$${key}` } as SystemStyleObject },
      right: { ...acc.right, [key]: { right: `$${key}` } as SystemStyleObject },
      bottom: { ...acc.bottom, [key]: { bottom: `$${key}` } as SystemStyleObject },
      left: { ...acc.left, [key]: { left: `$${key}` } as SystemStyleObject },

      gap: { ...acc.gap, [key]: { gap: `$${key}` } as SystemStyleObject },
      rowGap: { ...acc.rowGap, [key]: { rowGap: `$${key}` } as SystemStyleObject },
      columnGap: { ...acc.columnGap, [key]: { columnGap: `$${key}` } as SystemStyleObject },
    }),
    {} as SpaceUtilityVariants
  );

  // Add the 'auto' variant
  const marginAndPadding = [
    "m",
    "my",
    "mx",
    "mt",
    "mr",
    "mb",
    "ml",
    "p",
    "py",
    "px",
    "pt",
    "pr",
    "pb",
    "pl",
  ] as const;

  marginAndPadding.forEach(item => {
    spaceUtilities[item].auto = { [item]: "auto" } as SystemStyleObject;
  });

  return spaceUtilities;
}

/* -------------------------------------------------------------------------------------------------
 * Sizes utilities
 * -----------------------------------------------------------------------------------------------*/

type SizesVariant = UtilityVariant<keyof typeof theme.sizes>;

interface SizeUtilityVariants {
  w: SizesVariant;
  minW: SizesVariant;
  maxW: SizesVariant;
  h: SizesVariant;
  minH: SizesVariant;
  maxH: SizesVariant;
  boxSize: SizesVariant;
}

function createSizeUtilityVariants(): SizeUtilityVariants {
  return Object.keys(theme.sizes).reduce(
    (acc, key) => ({
      w: { ...acc.w, [key]: { w: `$${key}` } as SystemStyleObject },
      minW: { ...acc.minW, [key]: { minW: `$${key}` } as SystemStyleObject },
      maxW: { ...acc.maxW, [key]: { maxW: `$${key}` } as SystemStyleObject },
      h: { ...acc.h, [key]: { h: `$${key}` } as SystemStyleObject },
      minH: { ...acc.minH, [key]: { minH: `$${key}` } as SystemStyleObject },
      maxH: { ...acc.maxH, [key]: { maxH: `$${key}` } as SystemStyleObject },
      boxSize: { ...acc.boxSize, [key]: { boxSize: `$${key}` } as SystemStyleObject },
    }),
    {} as SizeUtilityVariants
  );
}

/* -------------------------------------------------------------------------------------------------
 * Flexbox utilities
 * -----------------------------------------------------------------------------------------------*/

function createFlexboxUtilityVariants() {
  return {
    flexDirection: {
      row: { flexDirection: "row" } as SystemStyleObject,
      "row-reverse": { flexDirection: "row-reverse" } as SystemStyleObject,
      column: { flexDirection: "column" } as SystemStyleObject,
      "column-reverse": { flexDirection: "column-reverse" } as SystemStyleObject,
    },
    flexWrap: {
      nowrap: { flexWrap: "nowrap" } as SystemStyleObject,
      wrap: { flexWrap: "wrap" } as SystemStyleObject,
      "wrap-reverse": { flexWrap: "wrap-reverse" } as SystemStyleObject,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * CSS Grid utilities
 * -----------------------------------------------------------------------------------------------*/

const oneToSix = [1, 2, 3, 4, 5, 6] as const;
const oneToSeven = [...oneToSix, 7] as const;
const oneToTwelve = [...oneToSeven, 8, 9, 10, 11, 12] as const;
const oneToThirteen = [...oneToTwelve, 13] as const;

type OneToSixRange = typeof oneToSix[number];
type OneToSevenRange = typeof oneToSeven[number];
type OneToTwelveRange = typeof oneToTwelve[number];
type OneToThirteenRange = typeof oneToThirteen[number];

function createGridUtilityVariants() {
  return {
    gridAutoFlow: {
      row: { gridAutoFlow: "row" } as SystemStyleObject,
      "row-dense": { gridAutoFlow: "row dense" } as SystemStyleObject,
      column: { gridAutoFlow: "column" } as SystemStyleObject,
      "column-dense": { gridAutoFlow: "column dense" } as SystemStyleObject,
    },
    gridAutoColumns: {
      auto: { gridAutoColumns: "auto" } as SystemStyleObject,
      min: { gridAutoColumns: "min-content" } as SystemStyleObject,
      max: { gridAutoColumns: "max-content" } as SystemStyleObject,
      fr: { gridAutoColumns: " minmax(0, 1fr)" } as SystemStyleObject,
    },
    gridAutoRows: {
      auto: { gridAutoRows: "auto" } as SystemStyleObject,
      min: { gridAutoRows: "min-content" } as SystemStyleObject,
      max: { gridAutoRows: "max-content" } as SystemStyleObject,
      fr: { gridAutoRows: " minmax(0, 1fr)" } as SystemStyleObject,
    },
    gridTemplateColumns: {
      none: { gridTemplateColumns: "none" } as SystemStyleObject,
      ...oneToTwelve.reduce(
        (acc, val) => ({
          ...acc,
          [val]: { gridTemplateColumns: `repeat(${val}, minmax(0, 1fr))` } as SystemStyleObject,
        }),
        {} as UtilityVariant<OneToTwelveRange>
      ),
    },
    gridColumnSpan: {
      auto: { gridColumn: "auto" } as SystemStyleObject,
      full: { gridColumn: "1 / -1" } as SystemStyleObject,
      ...oneToTwelve.reduce(
        (acc, val) => ({
          ...acc,
          [val]: { gridColumn: `span ${val} / span ${val}` } as SystemStyleObject,
        }),
        {} as UtilityVariant<OneToTwelveRange>
      ),
    },
    gridColumnStart: {
      auto: { gridColumnStart: "auto" } as SystemStyleObject,
      ...oneToThirteen.reduce(
        (acc, val) => ({
          ...acc,
          [val]: { gridColumnStart: val } as SystemStyleObject,
        }),
        {} as UtilityVariant<OneToThirteenRange>
      ),
    },
    gridColumnEnd: {
      auto: { gridColumnEnd: "auto" } as SystemStyleObject,
      ...oneToThirteen.reduce(
        (acc, val) => ({
          ...acc,
          [val]: { gridColumnEnd: val } as SystemStyleObject,
        }),
        {} as UtilityVariant<OneToThirteenRange>
      ),
    },
    gridTemplateRows: {
      none: { gridTemplateRows: "none" } as SystemStyleObject,
      ...oneToSix.reduce(
        (acc, val) => ({
          ...acc,
          [val]: { gridTemplateRows: `repeat(${val}, minmax(0, 1fr))` } as SystemStyleObject,
        }),
        {} as UtilityVariant<OneToSixRange>
      ),
    },
    gridRowSpan: {
      auto: { gridRow: "auto" } as SystemStyleObject,
      full: { gridRow: "1 / -1" } as SystemStyleObject,
      ...oneToSix.reduce(
        (acc, val) => ({
          ...acc,
          [val]: { gridRow: `span ${val} / span ${val}` } as SystemStyleObject,
        }),
        {} as UtilityVariant<OneToSixRange>
      ),
    },
    gridRowStart: {
      auto: { gridRowStart: "auto" } as SystemStyleObject,
      ...oneToSeven.reduce(
        (acc, val) => ({
          ...acc,
          [val]: { gridRowStart: val } as SystemStyleObject,
        }),
        {} as UtilityVariant<OneToSevenRange>
      ),
    },
    gridRowEnd: {
      auto: { gridRowEnd: "auto" } as SystemStyleObject,
      ...oneToSeven.reduce(
        (acc, val) => ({
          ...acc,
          [val]: { gridRowEnd: val } as SystemStyleObject,
        }),
        {} as UtilityVariant<OneToSevenRange>
      ),
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Common Flexbox and CSS Grid utilities
 * -----------------------------------------------------------------------------------------------*/

function createCommonFlexboxAndGridUtilityVariants() {
  return {
    flex: {
      1: { flex: "1 1 0%" } as SystemStyleObject,
      auto: { flex: "1 1 auto" } as SystemStyleObject,
      initial: { flex: "0 1 auto" } as SystemStyleObject,
      none: { flex: "none" } as SystemStyleObject,
    },
    grow: {
      true: { flexGrow: "1" } as SystemStyleObject,
      false: { flexGrow: "0" } as SystemStyleObject,
    },
    shrink: {
      true: { flexShrink: "1" } as SystemStyleObject,
      false: { flexShrink: "0" } as SystemStyleObject,
    },
    order: {
      first: { order: "-9999" } as SystemStyleObject,
      last: { order: "9999" } as SystemStyleObject,
    },
    alignItems: {
      start: { alignItems: "flex-start" } as SystemStyleObject,
      end: { alignItems: "flex-end" } as SystemStyleObject,
      center: { alignItems: "center" } as SystemStyleObject,
      baseline: { alignItems: "baseline" } as SystemStyleObject,
      stretch: { alignItems: "stretch" } as SystemStyleObject,
    },
    alignContent: {
      start: { alignContent: "flex-start" } as SystemStyleObject,
      end: { alignContent: "flex-end" } as SystemStyleObject,
      center: { alignContent: "center" } as SystemStyleObject,
      between: { alignContent: "space-between" } as SystemStyleObject,
      around: { alignContent: "space-around" } as SystemStyleObject,
      evenly: { alignContent: "space-evenly" } as SystemStyleObject,
    },
    alignSelf: {
      auto: { alignSelf: "auto" } as SystemStyleObject,
      start: { alignSelf: "flex-start" } as SystemStyleObject,
      end: { alignSelf: "flex-end" } as SystemStyleObject,
      center: { alignSelf: "center" } as SystemStyleObject,
      stretch: { alignSelf: "stretch" } as SystemStyleObject,
      baseline: { alignSelf: "baseline" } as SystemStyleObject,
    },
    justifyItems: {
      start: { justifyItems: "start" } as SystemStyleObject,
      end: { justifyItems: "end" } as SystemStyleObject,
      center: { justifyItems: "center" } as SystemStyleObject,
      stretch: { justifyItems: "stretch" } as SystemStyleObject,
    },
    justifyContent: {
      start: { justifyContent: "flex-start" } as SystemStyleObject,
      end: { justifyContent: "flex-end" } as SystemStyleObject,
      center: { justifyContent: "center" } as SystemStyleObject,
      between: { justifyContent: "space-between" } as SystemStyleObject,
      around: { justifyContent: "space-around" } as SystemStyleObject,
      evenly: { justifyContent: "space-evenly" } as SystemStyleObject,
    },
    justifySelf: {
      auto: { justifySelf: "auto" } as SystemStyleObject,
      start: { justifySelf: "start" } as SystemStyleObject,
      end: { justifySelf: "end" } as SystemStyleObject,
      center: { justifySelf: "center" } as SystemStyleObject,
      stretch: { justifySelf: "stretch" } as SystemStyleObject,
    },
    placeItems: {
      start: { placeItems: "start" } as SystemStyleObject,
      end: { placeItems: "end" } as SystemStyleObject,
      center: { placeItems: "center" } as SystemStyleObject,
      stretch: { placeItems: "stretch" } as SystemStyleObject,
    },
    placeContent: {
      start: { placeContent: "start" } as SystemStyleObject,
      end: { placeContent: "end" } as SystemStyleObject,
      center: { placeContent: "center" } as SystemStyleObject,
      between: { placeContent: "space-between" } as SystemStyleObject,
      around: { placeContent: "space-around" } as SystemStyleObject,
      evenly: { placeContent: "space-evenly" } as SystemStyleObject,
      stretch: { placeContent: "stretch" } as SystemStyleObject,
    },
    placeSelf: {
      auto: { placeSelf: "auto" } as SystemStyleObject,
      start: { placeSelf: "start" } as SystemStyleObject,
      end: { placeSelf: "end" } as SystemStyleObject,
      center: { placeSelf: "center" } as SystemStyleObject,
      stretch: { placeSelf: "stretch" } as SystemStyleObject,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Box styles
 * -----------------------------------------------------------------------------------------------*/

/**
 * Box styles inherited by all Hope UI components.
 */
export const boxStyles = css({
  variants: {
    ...createBorderUtilityVariants(),
    ...createColorUtilityVariants(),
    ...createCommonFlexboxAndGridUtilityVariants(),
    ...createDisplayUtilityVariants(),
    ...createFlexboxUtilityVariants(),
    ...createGridUtilityVariants(),
    ...createOverflowUtilityVariants(),
    ...createPositionUtilityVariants(),
    ...createRadiiUtilityVariants(),
    ...createShadowUtilityVariants(),
    ...createSpaceUtilityVariants(),
    ...createSizeUtilityVariants(),
    ...createTypographyUtilityVariants(),
    ...createVerticalAlignUtilityVariants(),
  },
});

export type BoxVariants = VariantProps<typeof boxStyles>;

const boxPropKeys: Record<keyof BoxVariants, true> = {
  display: true,
  verticalAlign: true,
  overflow: true,
  overflowX: true,
  overflowY: true,
  color: true,
  bg: true,
  borderWidth: true,
  borderStyle: true,
  borderColor: true,
  borderRadius: true,
  fontFamily: true,
  fontSize: true,
  fontWeight: true,
  fontStyle: true,
  lineHeight: true,
  letterSpacing: true,
  textAlign: true,
  textTransform: true,
  lineClamp: true,
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
  gap: true,
  rowGap: true,
  columnGap: true,
  w: true,
  minW: true,
  maxW: true,
  h: true,
  minH: true,
  maxH: true,
  boxSize: true,
  boxShadow: true,
  position: true,
  zIndex: true,
  top: true,
  right: true,
  bottom: true,
  left: true,
  flex: true,
  flexDirection: true,
  flexWrap: true,
  grow: true,
  shrink: true,
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
  gridAutoFlow: true,
  gridAutoColumns: true,
  gridAutoRows: true,
  gridTemplateColumns: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  gridColumnEnd: true,
  gridTemplateRows: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridRowEnd: true,
};

/**
 * Array of boxStyles props that are commonly split with SolidJS `splitProps` method.
 */
export const boxPropNames = Object.keys(boxPropKeys) as Array<keyof BoxVariants>;
