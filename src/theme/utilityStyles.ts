import { VariantProps } from "@stitches/core";

import { css, theme } from "./stitches.config";
import { SystemStyleObject } from "./types";

type SpaceVariant = Record<keyof typeof theme.space, SystemStyleObject>;
type SizesVariant = Record<keyof typeof theme.sizes, SystemStyleObject>;

interface SpacingUtilityVariants {
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

function createSpacingVariants(): SpacingUtilityVariants {
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
    {} as SpacingUtilityVariants
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

function createSizesVariants(): SizeUtilityVariants {
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
    ...createSpacingVariants(),
    ...createSizesVariants(),
  },
});

export type UtilityVariants = VariantProps<typeof utilityStyles>;
