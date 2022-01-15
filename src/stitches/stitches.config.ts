import { createStitches, CSS, defaultThemeMap } from "@stitches/core";

import { media } from "./media";
import { defaultThemeTokens } from "./tokens";
import { utils } from "./utils";

export const {
  css: createStyles,
  globalCss: createGlobalStyles,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  prefix: "hope",
  themeMap: defaultThemeMap,
  theme: defaultThemeTokens,
  media,
  utils,
});

export type StitchesTheme = typeof theme;

/**
 * Style interface based on the stitches theme configuration.
 */
export type SystemStyleObject = CSS<typeof config>;

/**
 * Takes in an existing TKey and adds a the Stitches token prefix `$` to it, if TKey extends the type string or number.
 * If not, never is returned instead as a type.
 * */
export type AddStitchesTokenPrefix<TKey> = TKey extends string | number ? `$${TKey}` : never;
