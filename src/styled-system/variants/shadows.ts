import { SystemStyleObject, theme } from "@/theme";

import { UtilityVariant } from "../types";

export function createShadowUtilityVariants() {
  return {
    boxShadow: Object.keys(theme.shadows).reduce(
      (acc, key) => ({ ...acc, [key]: { boxShadow: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.shadows>
    ),
  };
}
