import { baseTheme } from "@/theme/stitches.config";
import { SizeToken, ThemeStyleObject } from "@/theme/types";

import { UtilityVariant } from "../types";

type SizesVariant = UtilityVariant<SizeToken>;

interface SizeUtilityVariants {
  w: SizesVariant;
  minW: SizesVariant;
  maxW: SizesVariant;
  h: SizesVariant;
  minH: SizesVariant;
  maxH: SizesVariant;
  boxSize: SizesVariant;
}

export function createSizeUtilityVariants(): SizeUtilityVariants {
  return Object.keys(baseTheme.sizes).reduce(
    (acc, key) => ({
      w: { ...acc.w, [key]: { w: `$${key}` } as ThemeStyleObject },
      minW: { ...acc.minW, [key]: { minW: `$${key}` } as ThemeStyleObject },
      maxW: { ...acc.maxW, [key]: { maxW: `$${key}` } as ThemeStyleObject },
      h: { ...acc.h, [key]: { h: `$${key}` } as ThemeStyleObject },
      minH: { ...acc.minH, [key]: { minH: `$${key}` } as ThemeStyleObject },
      maxH: { ...acc.maxH, [key]: { maxH: `$${key}` } as ThemeStyleObject },
      boxSize: { ...acc.boxSize, [key]: { boxSize: `$${key}` } as ThemeStyleObject },
    }),
    {} as SizeUtilityVariants
  );
}
