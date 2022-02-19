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
  themeMap: {
    ...defaultThemeMap,
    borderWidth: "sizes",
    borderTopWidth: "sizes",
    borderRightWidth: "sizes",
    borderBottomWidth: "sizes",
    borderLeftWidth: "sizes",
  },
  theme: baseThemeTokens,
  media: baseMedia,
  utils,
});
