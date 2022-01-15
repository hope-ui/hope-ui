import { AddStitchesTokenPrefix } from "../stitches.config";

export const borderWidths = {
  none: 0,
  1: "1px",
  2: "2px",
  4: "4px",
  8: "8px",
};

export type BorderWidthTokens = AddStitchesTokenPrefix<keyof typeof borderWidths>;
