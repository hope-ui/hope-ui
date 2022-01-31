import { baseTheme } from "@/theme/stitches.config";
import { RadiiToken, ThemeStyleObject } from "@/theme/types";

import { UtilityVariant } from "../types";

export function createRadiiUtilityVariants() {
  return {
    borderRadius: Object.keys(baseTheme.radii).reduce(
      (acc, key) => ({ ...acc, [key]: { borderRadius: `$${key}` } as ThemeStyleObject }),
      {} as UtilityVariant<RadiiToken>
    ),
  };
}
