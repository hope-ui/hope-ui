import { AddStitchesTokenPrefix } from "../stitches.config";

export const shadows = {
  xs: "0 0 0 1px rgb(0 0 0 / 0.05)",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  lg: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  xl: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  "2xl": "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "3xl": "0 25px 50px -12px rgb(0 0 0 / 0.23)",
  inner: "inset 0 3px 6px 0 rgb(0 0 0 / 0.3)",
  none: "none",
};

export type ShadowTokens = AddStitchesTokenPrefix<keyof typeof shadows>;