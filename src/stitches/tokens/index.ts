import { borderStyles } from "./borderStyles";
import { borderWidths } from "./borderWidths";
import { colors } from "./colors";
import { radii } from "./radii";
import { shadows } from "./shadows";
import { sizes } from "./sizes";
import { space } from "./space";
import { transitions } from "./transitions";
import { fonts, fontSizes, fontWeights, letterSpacings, lineHeights } from "./typography";
import { zIndices } from "./zIndices";

/**
 * The default Hope UI design tokens.
 */
export const defaultThemeTokens = {
  colors,
  space,
  sizes,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  borderWidths,
  borderStyles,
  radii,
  shadows,
  zIndices,
  transitions,
};

export type DefaultThemeTokens = typeof defaultThemeTokens;
