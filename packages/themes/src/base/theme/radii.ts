import { defineTokens } from "@pandacss/dev";

/**
 * Tailwind v4 radii (`--radius-*`). Note: hope's shadcn "nova" look originally used a
 * 0.625rem base — swap this block for that if you want the nova radius back.
 */
export const radii = defineTokens.radii({
  none: { value: "0px" },
  xs: { value: "0.125rem" },
  sm: { value: "0.25rem" },
  md: { value: "0.375rem" },
  lg: { value: "0.5rem" },
  xl: { value: "0.75rem" },
  "2xl": { value: "1rem" },
  "3xl": { value: "1.5rem" },
  "4xl": { value: "2rem" },
  full: { value: "9999px" },
});
