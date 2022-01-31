import { SystemStyleObject, theme } from "@/theme";

import { UtilityVariant } from "../types";

export function createPositionUtilityVariants() {
  return {
    position: {
      static: { position: "static" } as SystemStyleObject,
      fixed: { position: "fixed" } as SystemStyleObject,
      absolute: { position: "absolute" } as SystemStyleObject,
      relative: { position: "relative" } as SystemStyleObject,
      sticky: { position: "sticky" } as SystemStyleObject,
    },
    zIndex: Object.keys(theme.zIndices).reduce(
      (acc, key) => ({ ...acc, [key]: { zIndex: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.zIndices>
    ),
  };
}
