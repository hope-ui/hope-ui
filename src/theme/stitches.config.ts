import { createStitches, defaultThemeMap } from "@stitches/core";

import { media } from "./media";
import { darkColors, lightColors } from "./tokens/colors";
import { radii } from "./tokens/radii";
import { shadows } from "./tokens/shadows";
import { sizes } from "./tokens/sizes";
import { space } from "./tokens/space";
import { fonts, fontSizes, fontWeights, letterSpacings, lineHeights } from "./tokens/typography";
import { zIndices } from "./tokens/zIndices";
import { HopeTheme } from "./types";
import { utils } from "./utils";

export const {
  config,
  createTheme,
  css,
  getCssText,
  globalCss,
  keyframes,
  theme: baseTheme,
} = createStitches({
  prefix: "hope",
  themeMap: defaultThemeMap,
  theme: {
    colors: lightColors,
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
  },
  media,
  utils,
});

/**
 * Theme CSS class name added to `document.body` based on color mode.
 */
export const themeClassNames = {
  light: "hope-ui-light",
  dark: "hope-ui-dark",
};

export function createDefaultTheme(): HopeTheme {
  const lightTheme = createTheme(themeClassNames.light);
  const darkTheme = createTheme(themeClassNames.dark, { colors: darkColors });

  return {
    initialColorMode: "light",
    light: lightTheme,
    dark: darkTheme,
    components: {},
  };
}
