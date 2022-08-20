/*!
 * Original code by MUI
 * MIT Licensed, Copyright (c) 2014 Call-Em-All.
 *
 * Credits to the MUI team:
 * https://github.com/mui/material-ui/blob/master/packages/mui-joy/src/styles/extendTheme.ts
 */

import { PaletteGeneratorTuple, PaletteRangeGenerator, PaletteScale } from "../../types";
import { createGetCssVar } from "../../utils";
import { generatePaletteChannel } from "./generate-palette-channel";

/** Utility function to create palette for medium colors. */
export function createMediumPalette(scale: PaletteScale): PaletteGeneratorTuple {
  const common = {
    ...scale,
    ...generatePaletteChannel(scale),
  };

  const light: PaletteRangeGenerator = (color, cssVarPrefix) => {
    const getCssVar = createGetCssVar(cssVarPrefix);

    return {
      ...common,

      // global variant - solid
      solidText: "#ffffff",
      solidBg: getCssVar(`colors-${color}-600`),
      solidBorder: getCssVar(`colors-${color}-600`),

      solidHoverText: "#ffffff",
      solidHoverBg: getCssVar(`colors-${color}-700`),
      solidHoverBorder: getCssVar(`colors-${color}-700`),

      solidActiveText: "#ffffff",
      solidActiveBg: getCssVar(`colors-${color}-800`),
      solidActiveBorder: getCssVar(`colors-${color}-800`),

      solidDisabledText: "#ffffff",
      solidDisabledBg: getCssVar(`colors-${color}-200`),
      solidDisabledBorder: getCssVar(`colors-${color}-200`),

      // global variant - soft
      softText: getCssVar(`colors-${color}-800`),
      softBg: getCssVar(`colors-${color}-100`),
      softBorder: getCssVar(`colors-${color}-100`),

      softHoverText: getCssVar(`colors-${color}-800`),
      softHoverBg: getCssVar(`colors-${color}-200`),
      softHoverBorder: getCssVar(`colors-${color}-200`),

      softActiveText: getCssVar(`colors-${color}-900`),
      softActiveBg: getCssVar(`colors-${color}-300`),
      softActiveBorder: getCssVar(`colors-${color}-300`),

      softDisabledText: getCssVar(`colors-${color}-300`),
      softDisabledBg: getCssVar(`colors-${color}-50`),
      softDisabledBorder: getCssVar(`colors-${color}-50`),

      // global variant - outlined
      outlinedText: getCssVar(`colors-${color}-700`),
      outlinedBg: "transparent",
      outlinedBorder: getCssVar(`colors-${color}-300`),

      outlinedHoverText: getCssVar(`colors-${color}-700`),
      outlinedHoverBg: getCssVar(`colors-${color}-50`),
      outlinedHoverBorder: getCssVar(`colors-${color}-400`),

      outlinedActiveText: getCssVar(`colors-${color}-700`),
      outlinedActiveBg: getCssVar(`colors-${color}-100`),
      outlinedActiveBorder: getCssVar(`colors-${color}-400`),

      outlinedDisabledText: getCssVar(`colors-${color}-200`),
      outlinedDisabledBg: "transparent",
      outlinedDisabledBorder: getCssVar(`colors-${color}-100`),

      // global variant - plain
      plainText: getCssVar(`colors-${color}-700`),
      plainBg: "transparent",
      plainBorder: "transparent",

      plainHoverText: getCssVar(`colors-${color}-700`),
      plainHoverBg: getCssVar(`colors-${color}-50`),
      plainHoverBorder: getCssVar(`colors-${color}-50`),

      plainActiveText: getCssVar(`colors-${color}-700`),
      plainActiveBg: getCssVar(`colors-${color}-100`),
      plainActiveBorder: getCssVar(`colors-${color}-100`),

      plainDisabledText: getCssVar(`colors-${color}-200`),
      plainDisabledBg: "transparent",
      plainDisabledBorder: "transparent",

      // global variant - override text
      overrideTextPrimary: getCssVar(`colors-${color}-900`),
      overrideTextSecondary: getCssVar(`colors-${color}-800`),
      overrideTextTertiary: getCssVar(`colors-${color}-700`),
    };
  };

  const dark: PaletteRangeGenerator = (color, cssVarPrefix) => {
    const getCssVar = createGetCssVar(cssVarPrefix);

    return {
      ...common,

      // global variant - solid
      solidText: "#ffffff",
      solidBg: getCssVar(`colors-${color}-700`),
      solidBorder: getCssVar(`colors-${color}-700`),

      solidHoverText: "#ffffff",
      solidHoverBg: getCssVar(`colors-${color}-800`),
      solidHoverBorder: getCssVar(`colors-${color}-800`),

      solidActiveText: "#ffffff",
      solidActiveBg: getCssVar(`colors-${color}-900`),
      solidActiveBorder: getCssVar(`colors-${color}-900`),

      solidDisabledText: getCssVar(`colors-${color}-900`),
      solidDisabledBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.5)`,
      solidDisabledBorder: "transparent",

      // global variant - soft
      softText: getCssVar(`colors-${color}-300`),
      softBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.6)`,
      softBorder: "transparent",

      softHoverText: getCssVar(`colors-${color}-300`),
      softHoverBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.7)`,
      softHoverBorder: "transparent",

      softActiveText: getCssVar(`colors-${color}-300`),
      softActiveBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.8)`,
      softActiveBorder: "transparent",

      softDisabledText: getCssVar(`colors-${color}-900`),
      softDisabledBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.3)`,
      softDisabledBorder: "transparent",

      // global variant - outlined
      outlinedText: getCssVar(`colors-${color}-200`),
      outlinedBg: "transparent",
      outlinedBorder: getCssVar(`colors-${color}-800`),

      outlinedHoverText: getCssVar(`colors-${color}-200`),
      outlinedHoverBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.1)`,
      outlinedHoverBorder: getCssVar(`colors-${color}-700`),

      outlinedActiveText: getCssVar(`colors-${color}-200`),
      outlinedActiveBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.2)`,
      outlinedActiveBorder: getCssVar(`colors-${color}-700`),

      outlinedDisabledText: getCssVar(`colors-${color}-900`),
      outlinedDisabledBg: "transparent",
      outlinedDisabledBorder: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.6)`,

      // global variant - plain
      plainText: getCssVar(`colors-${color}-200`),
      plainBg: "transparent",
      plainBorder: "transparent",

      plainHoverText: getCssVar(`colors-${color}-200`),
      plainHoverBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.1)`,
      plainHoverBorder: "transparent",

      plainActiveText: getCssVar(`colors-${color}-200`),
      plainActiveBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.2)`,
      plainActiveBorder: "transparent",

      plainDisabledText: getCssVar(`colors-${color}-900`),
      plainDisabledBg: "transparent",
      plainDisabledBorder: "transparent",

      // global variant - override text
      overrideTextPrimary: getCssVar(`colors-${color}-200`),
      overrideTextSecondary: getCssVar(`colors-${color}-400`),
      overrideTextTertiary: getCssVar(`colors-${color}-500`),
    };
  };

  return [light, dark];
}
