import { SystemStyleObject } from "@/theme";

export function createBorderUtilityVariants() {
  return {
    borderWidth: {
      0: { borderWidth: "0" } as SystemStyleObject,
      1: { borderWidth: "1px" } as SystemStyleObject,
      2: { borderWidth: "2px" } as SystemStyleObject,
      4: { borderWidth: "4px" } as SystemStyleObject,
      8: { borderWidth: "8px" } as SystemStyleObject,
    },
    borderStyle: {
      solid: { borderStyle: "solid" } as SystemStyleObject,
      dashed: { borderStyle: "dashed" } as SystemStyleObject,
      dotted: { borderStyle: "dotted" } as SystemStyleObject,
      double: { borderStyle: "double" } as SystemStyleObject,
      hidden: { borderStyle: "hidden" } as SystemStyleObject,
      none: { borderStyle: "none" } as SystemStyleObject,
    },
  };
}
