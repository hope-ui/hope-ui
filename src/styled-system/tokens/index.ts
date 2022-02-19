import { commonColors, darkColors, lightColors } from "./colors";
import { radii } from "./radii";
import { darkShadows, shadows } from "./shadows";
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

/**
 * Base stitches theme tokens - dark mode
 */
export const baseDarkThemeTokens = {
  colors: darkColors,
  shadows: darkShadows,
};
