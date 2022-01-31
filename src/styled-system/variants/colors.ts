import { SystemStyleObject, theme } from "@/theme";

import { UtilityVariant } from "../types";

type ColorsVariant = UtilityVariant<keyof typeof theme.colors>;

interface ColorUtilityVariants {
  color: ColorsVariant;
  bg: ColorsVariant;
  borderColor: ColorsVariant;
}

export function createColorUtilityVariants(): ColorUtilityVariants {
  return Object.keys(theme.colors).reduce(
    (acc, key) => ({
      color: { ...acc.color, [key]: { color: `$${key}` } as SystemStyleObject },
      bg: { ...acc.bg, [key]: { bg: `$${key}` } as SystemStyleObject },
      borderColor: { ...acc.borderColor, [key]: { borderColor: `$${key}` } as SystemStyleObject },
    }),
    {} as ColorUtilityVariants
  );
}
