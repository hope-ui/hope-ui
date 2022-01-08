import { createStitches, defaultThemeMap } from "@stitches/core";

import { media } from "./media";
import { utils } from "./utils";
import {
  borderStyles,
  borderWidths,
  radii,
  colors,
  shadows,
  sizes,
  space,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  zIndices
} from "./theme";

export const {
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config
} = createStitches({
  prefix: "uipiece",
  themeMap: defaultThemeMap,
  theme: {
    colors,
    space,
    sizes,
    fontSizes,
    fonts,
    fontWeights,
    lineHeights,
    letterSpacings,
    borderWidths,
    borderStyles,
    radii,
    shadows,
    zIndices,
    transitions: {}
  },
  media,
  utils
});
