import { theme } from "@/theme/stitches.config";
import { ShadowToken, ThemeStyleObject } from "@/theme/types";

import { UtilityVariant } from "../types";

export function createShadowUtilityVariants() {
  return {
    boxShadow: Object.keys(theme.shadows).reduce(
      (acc, key) => ({ ...acc, [key]: { boxShadow: `$${key}` } as ThemeStyleObject }),
      {} as UtilityVariant<ShadowToken>
    ),
  };
}
