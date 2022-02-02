import { commonColors, lightColors } from "./colors";
import { radii } from "./radii";
import { shadows } from "./shadows";
import { sizes } from "./sizes";
import { space } from "./space";
import { fonts, fontSizes, fontWeights, letterSpacings, lineHeights } from "./typography";
import { zIndices } from "./z-indices";

/**
 * Base stitches theme tokens - light mode
 */
export const baseThemeTokens = {
  colors: {
    ...commonColors,
    ...lightColors,
  },
  space,
  sizes,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  radii,
  shadows,
  zIndices,
};
