import { createStitches, defaultThemeMap } from "@stitches/core";

import { baseMedia } from "./media";
import { utils } from "./stitches-utils";
import { baseThemeTokens } from "./tokens";

export const {
  theme: baseTheme,
  css,
  globalCss,
  config,
  createTheme,
  getCssText,
  keyframes,
} = createStitches({
  prefix: "hope",
  themeMap: defaultThemeMap,
  theme: baseThemeTokens,
  media: baseMedia,
  utils,
});
