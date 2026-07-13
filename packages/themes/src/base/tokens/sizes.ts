import { defineTokens } from "@pandacss/dev";
import type { SizesContract } from "../contracts";
import { spacing } from "./spacing";

/**
 * Sizes back width/height/min/max: the spacing scale + fractions + intrinsic keywords +
 * the breakpoint widths (for `maxW="lg"` etc.) + the prose measure.
 */
export const sizes = defineTokens.sizes({
  ...spacing,
  "1/2": { value: "50%" },
  "1/3": { value: "33.333333%" },
  "2/3": { value: "66.666667%" },
  "1/4": { value: "25%" },
  "2/4": { value: "50%" },
  "3/4": { value: "75%" },
  "1/5": { value: "20%" },
  "2/5": { value: "40%" },
  "3/5": { value: "60%" },
  "4/5": { value: "80%" },
  "1/6": { value: "16.666667%" },
  "5/6": { value: "83.333333%" },
  "1/12": { value: "8.333333%" },
  "5/12": { value: "41.666667%" },
  "7/12": { value: "58.333333%" },
  "11/12": { value: "91.666667%" },
  full: { value: "100%" },
  min: { value: "min-content" },
  max: { value: "max-content" },
  fit: { value: "fit-content" },
  prose: { value: "65ch" },
  sm: { value: "40rem" },
  md: { value: "48rem" },
  lg: { value: "64rem" },
  xl: { value: "80rem" },
  "2xl": { value: "96rem" },
} satisfies SizesContract);
