import { AddStitchesTokenPrefix } from "../stitches.config";

export const borderStyles = {
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
  double: "double",
  hidden: "hidden",
  none: "none",
};

export type BorderStyleTokens = AddStitchesTokenPrefix<keyof typeof borderStyles>;
