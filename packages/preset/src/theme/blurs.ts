import { defineTokens } from "@pandacss/dev";

/** Tailwind v4 blurs (`--blur-*`). */
export const blurs = defineTokens.blurs({
  xs: { value: "4px" },
  sm: { value: "8px" },
  md: { value: "12px" },
  lg: { value: "16px" },
  xl: { value: "24px" },
  "2xl": { value: "40px" },
  "3xl": { value: "64px" },
});
