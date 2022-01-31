import { SystemStyleObject, theme } from "@/theme";

import { UtilityVariant } from "../types";

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

export function createSizeUtilityVariants(): SizeUtilityVariants {
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
