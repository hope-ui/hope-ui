import { VariantProps } from "@stitches/core";

import { css, theme } from "./stitches.config";
import { SystemStyleObject } from "./types";

type UtilityVariant<T extends string | number | symbol> = Record<T, SystemStyleObject>;

type ColorsVariant = UtilityVariant<keyof typeof theme.colors>;
type RadiiVariant = UtilityVariant<keyof typeof theme.radii>;
type ShadowsVariant = UtilityVariant<keyof typeof theme.shadows>;
export type SpaceVariant = UtilityVariant<keyof typeof theme.space>;
type SizesVariant = UtilityVariant<keyof typeof theme.sizes>;

interface ColorUtilityVariants {
  color: ColorsVariant;
  bg: ColorsVariant;
  borderColor: ColorsVariant;
}

function createColorVariants(): ColorUtilityVariants {
  return Object.keys(theme.colors).reduce(
    (acc, key) => ({
      color: { ...acc.color, [key]: { color: `$${key}` } as SystemStyleObject },
      bg: { ...acc.bg, [key]: { bg: `$${key}` } as SystemStyleObject },
      borderColor: { ...acc.borderColor, [key]: { borderColor: `$${key}` } as SystemStyleObject },
    }),
    {} as ColorUtilityVariants
  );
}

interface BorderUtilityVariants {
  border: UtilityVariant<string | number>;
  borderStyle: UtilityVariant<string | number>;
}

function createBorderVariants(): BorderUtilityVariants {
  return {
    border: {
      0: { borderWidth: "0" },
      1: { borderWidth: "1px" },
      2: { borderWidth: "2px" },
      4: { borderWidth: "4px" },
      8: { borderWidth: "8px" },
    },
    borderStyle: {
      solid: { borderStyle: "solid" },
      dashed: { borderStyle: "dashed" },
      dotted: { borderStyle: "dotted" },
      double: { borderStyle: "double" },
      hidden: { borderStyle: "hidden" },
      none: { borderStyle: "none" },
    },
  };
}

interface RadiiUtilityVariants {
  borderRadius: RadiiVariant;
}

function createRadiiVariants(): RadiiUtilityVariants {
  return Object.keys(theme.radii).reduce(
    (acc, key) => ({
      borderRadius: {
        ...acc.borderRadius,
        [key]: { borderRadius: `$${key}` } as SystemStyleObject,
      },
    }),
    {} as RadiiUtilityVariants
  );
}

interface ShadowUtilityVariants {
  boxShadow: ShadowsVariant;
}

function createShadowVariants(): ShadowUtilityVariants {
  return Object.keys(theme.shadows).reduce(
    (acc, key) => ({
      boxShadow: { ...acc.boxShadow, [key]: { boxShadow: `$${key}` } as SystemStyleObject },
    }),
    {} as ShadowUtilityVariants
  );
}

interface SpaceUtilityVariants {
  // Margin
  m: SpaceVariant;
  mx: SpaceVariant;
  my: SpaceVariant;
  mt: SpaceVariant;
  mr: SpaceVariant;
  mb: SpaceVariant;
  ml: SpaceVariant;

  // Padding
  p: SpaceVariant;
  px: SpaceVariant;
  py: SpaceVariant;
  pt: SpaceVariant;
  pr: SpaceVariant;
  pb: SpaceVariant;
  pl: SpaceVariant;
}

function createSpaceVariants(): SpaceUtilityVariants {
  return Object.keys(theme.space).reduce(
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
    }),
    {} as SpaceUtilityVariants
  );
}

interface SizeUtilityVariants {
  w: SizesVariant;
  minW: SizesVariant;
  maxW: SizesVariant;
  h: SizesVariant;
  minH: SizesVariant;
  maxH: SizesVariant;
  boxSize: SizesVariant;
}

function createSizeVariants(): SizeUtilityVariants {
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

interface FlexboxAndGridItemUtilityVariants {
  flex: UtilityVariant<string | number>;
  grow: UtilityVariant<string | number>;
  shrink: UtilityVariant<string | number>;
  order: UtilityVariant<string | number>;
  alignSelf: UtilityVariant<string | number>;
  justifySelf: UtilityVariant<string | number>;
  placeSelf: UtilityVariant<string | number>;
}

/**
 * Variant that apply to a child of a Flex or Grid container.
 */
function createFlexboxAndGridItemVariants(): FlexboxAndGridItemUtilityVariants {
  return {
    flex: {
      1: { flex: "1 1 0%" },
      auto: { flex: "1 1 auto" },
      initial: { flex: "0 1 auto" },
      none: { flex: "none" },
    },
    grow: {
      true: { flexGrow: "1" },
      false: { flexGrow: "0" },
    },
    shrink: {
      true: { flexShrink: "1" },
      false: { flexShrink: "0" },
    },
    order: {
      first: { order: "-9999" },
      last: { order: "9999" },
    },
    alignSelf: {
      auto: { alignSelf: "auto" },
      start: { alignSelf: "flex-start" },
      end: { alignSelf: "flex-end" },
      center: { alignSelf: "center" },
      stretch: { alignSelf: "stretch" },
      baseline: { alignSelf: "baseline" },
    },
    justifySelf: {
      auto: { justifySelf: "auto" },
      start: { justifySelf: "start" },
      end: { justifySelf: "end" },
      center: { justifySelf: "center" },
      stretch: { justifySelf: "stretch" },
    },
    placeSelf: {
      auto: { placeSelf: "auto" },
      start: { placeSelf: "start" },
      end: { placeSelf: "end" },
      center: { placeSelf: "center" },
      stretch: { placeSelf: "stretch" },
    },
  };
}

/**
 * Utility styles inherited by all Hope UI components.
 */
export const utilityStyles = css({
  variants: {
    ...createColorVariants(),
    ...createBorderVariants(),
    ...createRadiiVariants(),
    ...createShadowVariants(),
    ...createSpaceVariants(),
    ...createSizeVariants(),
    ...createFlexboxAndGridItemVariants(),
  },
});

export type UtilityVariants = VariantProps<typeof utilityStyles>;

/**
 * Array of utilityStyles props that are commonly splited with SolidJS `splitProps` method.
 */
export const utilityStyleProps: Array<keyof UtilityVariants> = [
  // Color
  "color",
  "bg",
  "borderColor",

  // Border
  "border",
  "borderStyle",

  // Radii
  "borderRadius",

  // Shadows
  "boxShadow",

  // Space
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",

  // Size
  "w",
  "minW",
  "maxW",
  "h",
  "minH",
  "maxH",
  "boxSize",

  // Flexbox and Grid
  "flex",
  "grow",
  "shrink",
  "order",
  "alignSelf",
  "justifySelf",
  "placeSelf",
];
