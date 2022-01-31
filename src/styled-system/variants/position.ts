import { baseTheme } from "@/theme/stitches.config";
import { ThemeStyleObject, ZIndiceToken } from "@/theme/types";

import { UtilityVariant } from "../types";

export function createPositionUtilityVariants() {
  return {
    position: {
      static: { position: "static" } as ThemeStyleObject,
      fixed: { position: "fixed" } as ThemeStyleObject,
      absolute: { position: "absolute" } as ThemeStyleObject,
      relative: { position: "relative" } as ThemeStyleObject,
      sticky: { position: "sticky" } as ThemeStyleObject,
    },
    zIndex: Object.keys(baseTheme.zIndices).reduce(
      (acc, key) => ({ ...acc, [key]: { zIndex: `$${key}` } as ThemeStyleObject }),
      {} as UtilityVariant<ZIndiceToken>
    ),
  };
}
