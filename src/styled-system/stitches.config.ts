import { createStitches, defaultThemeMap } from "@stitches/core";

import { media } from "./media";
import { utils } from "./stitches-utils";
import { baseThemeTokens } from "./tokens";

export const { config, createTheme, css, getCssText, globalCss, keyframes, theme } = createStitches(
  {
    prefix: "hope",
    themeMap: defaultThemeMap,
    theme: baseThemeTokens,
    media,
    utils,
  }
);