import { VariantProps } from "@stitches/core";

import { css, theme } from "./stitches.config";
import { SystemStyleObject } from "./types";

type ColorsVariant = Record<keyof typeof theme.colors, SystemStyleObject>;
type RadiiVariant = Record<keyof typeof theme.radii, SystemStyleObject>;
type ShadowsVariant = Record<keyof typeof theme.shadows, SystemStyleObject>;
type SpaceVariant = Record<keyof typeof theme.space, SystemStyleObject>;
type SizesVariant = Record<keyof typeof theme.sizes, SystemStyleObject>;

interface ColorUtilityVariants {
  color: ColorsVariant;
  bg: ColorsVariant;
}

interface RadiiUtilityVariants {
  rounded: RadiiVariant;
}

interface ShadowUtilityVariants {
  shadow: ShadowsVariant;
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

interface SizeUtilityVariants {
  w: SizesVariant;
  minW: SizesVariant;
  maxW: SizesVariant;
  h: SizesVariant;
  minH: SizesVariant;
  maxH: SizesVariant;
  boxSize: SizesVariant;
}

function createColorVariants(): ColorUtilityVariants {
  return Object.keys(theme.colors).reduce(
    (acc, key) => ({
      color: { ...acc.color, [key]: { color: `$${key}` } as SystemStyleObject },
      bg: { ...acc.bg, [key]: { bg: `$${key}` } as SystemStyleObject },
    }),
    {} as ColorUtilityVariants
  );
}

function createRadiiVariants(): RadiiUtilityVariants {
  return Object.keys(theme.radii).reduce(
    (acc, key) => ({
      rounded: { ...acc.rounded, [key]: { borderRadius: `$${key}` } as SystemStyleObject },
    }),
    {} as RadiiUtilityVariants
  );
}

function createShadowVariants(): ShadowUtilityVariants {
  return Object.keys(theme.shadows).reduce(
    (acc, key) => ({
      shadow: { ...acc.shadow, [key]: { boxShadow: `$${key}` } as SystemStyleObject },
    }),
    {} as ShadowUtilityVariants
  );
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

/**
 * Utility styles inherited by all Hope UI components.
 */
export const utilityStyles = css({
  variants: {
    ...createColorVariants(),
    ...createRadiiVariants(),
    ...createShadowVariants(),
    ...createSpaceVariants(),
    ...createSizeVariants(),
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

  // Radii
  "rounded",

  // Shadows
  "shadow",

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
];
