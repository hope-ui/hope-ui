import { SystemStyleObject, theme } from "@/theme";

import { UtilityVariant } from "../types";

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

export function createSpaceUtilityVariants(): SpaceUtilityVariants {
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
