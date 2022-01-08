import { createStitches, defaultThemeMap } from "@stitches/core";

import { media } from "./media";
import { defaultTheme } from "./theme";
import { utils } from "./utils";

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
  theme: defaultTheme,
  media,
  utils
});
