import { theme } from "@/theme/stitches.config";
import { ColorToken, ThemeStyleObject } from "@/theme/types";

import { UtilityVariant } from "../types";

type ColorsVariant = UtilityVariant<ColorToken>;

interface ColorUtilityVariants {
  color: ColorsVariant;
  bg: ColorsVariant;
  borderColor: ColorsVariant;
}

export function createColorUtilityVariants(): ColorUtilityVariants {
  return Object.keys(theme.colors).reduce(
    (acc, key) => ({
      color: { ...acc.color, [key]: { color: `$${key}` } as ThemeStyleObject },
      bg: { ...acc.bg, [key]: { bg: `$${key}` } as ThemeStyleObject },
      borderColor: { ...acc.borderColor, [key]: { borderColor: `$${key}` } as ThemeStyleObject },
    }),
    {} as ColorUtilityVariants
  );
}
