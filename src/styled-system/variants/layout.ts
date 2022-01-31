import { SystemStyleObject } from "@/theme";

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
      none: { display: "none" } as SystemStyleObject,
      inline: { display: "inline" } as SystemStyleObject,
      block: { display: "block" } as SystemStyleObject,
      "inline-block": { display: "inline-block" } as SystemStyleObject,
      flex: { display: "flex" } as SystemStyleObject,
      "inline-flex": { display: "inline-flex" } as SystemStyleObject,
      grid: { display: "grid" } as SystemStyleObject,
      "inline-grid": { display: "inline-grid" } as SystemStyleObject,
    },
    verticalAlign: {
      baseline: { verticalAlign: "baseline" } as SystemStyleObject,
      top: { verticalAlign: "top" } as SystemStyleObject,
      middle: { verticalAlign: "middle" } as SystemStyleObject,
      bottom: { verticalAlign: "bottom" } as SystemStyleObject,
      "text-top": { verticalAlign: "text-top" } as SystemStyleObject,
      "text-bottom": { verticalAlign: "text-bottom" } as SystemStyleObject,
      sub: { verticalAlign: "sub" } as SystemStyleObject,
      super: { verticalAlign: "super" } as SystemStyleObject,
    },
    ...overflowValues.reduce(
      (acc, val) => ({
        overflow: { ...acc.overflow, [val]: { overflow: val } as SystemStyleObject },
        overflowX: { ...acc.overflowX, [val]: { overflowX: val } as SystemStyleObject },
        overflowY: { ...acc.overflowY, [val]: { overflowY: val } as SystemStyleObject },
      }),
      {} as OverflowUtilityVariants
    ),
  };
}
