import { ThemeStyleObject } from "@/theme/types";

export function createBorderUtilityVariants() {
  return {
    borderWidth: {
      0: { borderWidth: "0" } as ThemeStyleObject,
      1: { borderWidth: "1px" } as ThemeStyleObject,
      2: { borderWidth: "2px" } as ThemeStyleObject,
      4: { borderWidth: "4px" } as ThemeStyleObject,
      8: { borderWidth: "8px" } as ThemeStyleObject,
    },
    borderStyle: {
      solid: { borderStyle: "solid" } as ThemeStyleObject,
      dashed: { borderStyle: "dashed" } as ThemeStyleObject,
      dotted: { borderStyle: "dotted" } as ThemeStyleObject,
      double: { borderStyle: "double" } as ThemeStyleObject,
      hidden: { borderStyle: "hidden" } as ThemeStyleObject,
      none: { borderStyle: "none" } as ThemeStyleObject,
    },
  };
}
