import { createStitches, defaultThemeMap } from "@stitches/core";

import { media } from "./media";
import { commonColors, lightColors } from "./tokens/colors";
import { radii } from "./tokens/radii";
import { shadows } from "./tokens/shadows";
import { sizes } from "./tokens/sizes";
import { space } from "./tokens/space";
import { fonts, fontSizes, fontWeights, letterSpacings, lineHeights } from "./tokens/typography";
import { zIndices } from "./tokens/zIndices";
import { utils } from "./utils";

export const { config, createTheme, css, getCssText, globalCss, keyframes, theme } = createStitches(
  {
    prefix: "hope",
    themeMap: defaultThemeMap,
    theme: {
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
    },
    media,
    utils,
  }
);
