import { baseTheme } from "@/theme/stitches.config";
import { ShadowToken, ThemeStyleObject } from "@/theme/types";

import { UtilityVariant } from "../types";

export function createShadowUtilityVariants() {
  return {
    boxShadow: Object.keys(baseTheme.shadows).reduce(
      (acc, key) => ({ ...acc, [key]: { boxShadow: `$${key}` } as ThemeStyleObject }),
      {} as UtilityVariant<ShadowToken>
    ),
  };
}
