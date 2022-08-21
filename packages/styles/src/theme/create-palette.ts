/*!
 * Original code by MUI
 * MIT Licensed, Copyright (c) 2014 Call-Em-All.
 *
 * Credits to the MUI team:
 * https://github.com/mui/material-ui/blob/master/packages/mui-joy/src/styles/extendTheme.ts
 */

import { PaletteGeneratorTuple, PaletteRangeGenerator, PaletteScale } from "../types";
import { createGetCssVar, rgbColorChannel } from "../utils";

/** Utility function to create color palettes. */
export function createPalette(scale: PaletteScale, isGray = false): PaletteGeneratorTuple {
  const common = {
    ...scale,
    mainChannel: rgbColorChannel(scale["500"]),
    lightChannel: rgbColorChannel(scale["100"]),
    darkChannel: rgbColorChannel(scale["900"]),
  };

  const light: PaletteRangeGenerator = (color, cssVarPrefix) => {
    const getCssVar = createGetCssVar(cssVarPrefix);

    return {
      ...common,
      overrideTextPrimary: getCssVar(`colors-${color}-${isGray ? "800" : "900"}`),
      overrideTextSecondary: getCssVar(`colors-${color}-${isGray ? "600" : "800"}`),
      overrideTextTertiary: getCssVar(`colors-${color}-${isGray ? "500" : "700"}`),
    };
  };

  const dark: PaletteRangeGenerator = (color, cssVarPrefix) => {
    const getCssVar = createGetCssVar(cssVarPrefix);

    return {
      ...common,
      overrideTextPrimary: getCssVar(`colors-${color}-${isGray ? "100" : "200"}`),
      overrideTextSecondary: getCssVar(`colors-${color}-${isGray ? "300" : "400"}`),
      overrideTextTertiary: getCssVar(`colors-${color}-${isGray ? "400" : "500"}`),
    };
  };

  return [light, dark];
}

/** Utility function to create "gray based" color palettes. */
export function createGrayPalette(scale: PaletteScale): PaletteGeneratorTuple {
  return createPalette(scale, true);
}
