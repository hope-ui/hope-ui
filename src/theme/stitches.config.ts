import { createStitches, defaultThemeMap } from "@stitches/core";
import merge from "lodash.merge";

import { HopeTheme, ThemeConfig } from ".";
import { media } from "./media";
import { lightColors } from "./tokens/colors";
import { radii } from "./tokens/radii";
import { shadows } from "./tokens/shadows";
import { sizes } from "./tokens/sizes";
import { space } from "./tokens/space";
import { fonts, fontSizes, fontWeights, letterSpacings, lineHeights } from "./tokens/typography";
import { zIndices } from "./tokens/zIndices";
import { utils } from "./utils";

/**
 * Theme CSS class name added to `document.body` based on color mode.
 */
export const themeClassNames = {
  light: "hope-ui-light",
  dark: "hope-ui-dark",
};

export const { config, createTheme, css, getCssText, globalCss, keyframes, theme } = createStitches(
  {
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
  }
);

export function extendBaseTheme(themeClassName: string, themeConfig: ThemeConfig): HopeTheme {
  const customTheme = createTheme(themeClassName, themeConfig);
  return merge({}, theme, customTheme);
}
