import { SystemStyleObject, theme } from "@/theme";

import { UtilityVariant } from "../types";

export function createRadiiUtilityVariants() {
  return {
    borderRadius: Object.keys(theme.radii).reduce(
      (acc, key) => ({ ...acc, [key]: { borderRadius: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.radii>
    ),
  };
}
