import { ThemeStyleObject } from "@/theme/types";

import { UtilityVariant } from "../types";

const overflowValues = ["auto", "hidden", "clip", "visible", "scroll"] as const;

type OverflowValue = typeof overflowValues[number];

interface OverflowUtilityVariants {
  overflow: UtilityVariant<OverflowValue>;
  overflowX: UtilityVariant<OverflowValue>;
  overflowY: UtilityVariant<OverflowValue>;
}

export function createLayoutUtilityVariants() {
  return {
    display: {
      none: { display: "none" } as ThemeStyleObject,
      inline: { display: "inline" } as ThemeStyleObject,
      block: { display: "block" } as ThemeStyleObject,
      "inline-block": { display: "inline-block" } as ThemeStyleObject,
      flex: { display: "flex" } as ThemeStyleObject,
      "inline-flex": { display: "inline-flex" } as ThemeStyleObject,
      grid: { display: "grid" } as ThemeStyleObject,
      "inline-grid": { display: "inline-grid" } as ThemeStyleObject,
    },
    verticalAlign: {
      baseline: { verticalAlign: "baseline" } as ThemeStyleObject,
      top: { verticalAlign: "top" } as ThemeStyleObject,
      middle: { verticalAlign: "middle" } as ThemeStyleObject,
      bottom: { verticalAlign: "bottom" } as ThemeStyleObject,
      "text-top": { verticalAlign: "text-top" } as ThemeStyleObject,
      "text-bottom": { verticalAlign: "text-bottom" } as ThemeStyleObject,
      sub: { verticalAlign: "sub" } as ThemeStyleObject,
      super: { verticalAlign: "super" } as ThemeStyleObject,
    },
    ...overflowValues.reduce(
      (acc, val) => ({
        overflow: { ...acc.overflow, [val]: { overflow: val } as ThemeStyleObject },
        overflowX: { ...acc.overflowX, [val]: { overflowX: val } as ThemeStyleObject },
        overflowY: { ...acc.overflowY, [val]: { overflowY: val } as ThemeStyleObject },
      }),
      {} as OverflowUtilityVariants
    ),
  };
}
