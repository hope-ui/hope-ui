import { baseTheme } from "@/theme/stitches.config";
import { SpaceToken, ThemeStyleObject } from "@/theme/types";

import { UtilityVariant } from "../types";

type SpaceVariant = UtilityVariant<SpaceToken>;
type SpaceVariantWithAuto = UtilityVariant<SpaceToken | "auto">;

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

export function createSpaceUtilityVariants(): SpaceUtilityVariants {
  const spaceUtilities = Object.keys(baseTheme.space).reduce(
    (acc, key) => ({
      m: { ...acc.m, [key]: { m: `$${key}` } as ThemeStyleObject },
      mx: { ...acc.mx, [key]: { mx: `$${key}` } as ThemeStyleObject },
      my: { ...acc.my, [key]: { my: `$${key}` } as ThemeStyleObject },
      mt: { ...acc.mt, [key]: { mt: `$${key}` } as ThemeStyleObject },
      mr: { ...acc.mr, [key]: { mr: `$${key}` } as ThemeStyleObject },
      mb: { ...acc.mb, [key]: { mb: `$${key}` } as ThemeStyleObject },
      ml: { ...acc.ml, [key]: { ml: `$${key}` } as ThemeStyleObject },

      p: { ...acc.p, [key]: { p: `$${key}` } as ThemeStyleObject },
      px: { ...acc.px, [key]: { px: `$${key}` } as ThemeStyleObject },
      py: { ...acc.py, [key]: { py: `$${key}` } as ThemeStyleObject },
      pt: { ...acc.pt, [key]: { pt: `$${key}` } as ThemeStyleObject },
      pr: { ...acc.pr, [key]: { pr: `$${key}` } as ThemeStyleObject },
      pb: { ...acc.pb, [key]: { pb: `$${key}` } as ThemeStyleObject },
      pl: { ...acc.pl, [key]: { pl: `$${key}` } as ThemeStyleObject },

      top: { ...acc.top, [key]: { top: `$${key}` } as ThemeStyleObject },
      right: { ...acc.right, [key]: { right: `$${key}` } as ThemeStyleObject },
      bottom: { ...acc.bottom, [key]: { bottom: `$${key}` } as ThemeStyleObject },
      left: { ...acc.left, [key]: { left: `$${key}` } as ThemeStyleObject },

      gap: { ...acc.gap, [key]: { gap: `$${key}` } as ThemeStyleObject },
      rowGap: { ...acc.rowGap, [key]: { rowGap: `$${key}` } as ThemeStyleObject },
      columnGap: { ...acc.columnGap, [key]: { columnGap: `$${key}` } as ThemeStyleObject },
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
    spaceUtilities[item].auto = { [item]: "auto" } as ThemeStyleObject;
  });

  return spaceUtilities;
}
