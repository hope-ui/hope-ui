import { createStitches, defaultThemeMap } from "@stitches/core";
import type { CSS } from "@stitches/core";

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

/**
 * Style interface based on the stitches configuration, leveraging the given media and style map.
 */
export type SystemStyleObject = CSS<typeof config>;
