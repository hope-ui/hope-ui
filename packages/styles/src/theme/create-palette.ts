/*!
 * Original code by MUI
 * MIT Licensed, Copyright (c) 2014 Call-Em-All.
 *
 * Credits to the MUI team:
 * https://github.com/mui/material-ui/blob/master/packages/mui-joy/src/styles/extendTheme.ts
 */

import { PaletteRange, PaletteScale } from "../types";
import { rgbColorChannel } from "../utils/rgb";

/** Utility function to create color palettes. */
export function createPalette(scale: PaletteScale): PaletteRange {
  return {
    ...scale,
    mainChannel: rgbColorChannel(scale["500"]),
    lightChannel: rgbColorChannel(scale["100"]),
    darkChannel: rgbColorChannel(scale["900"]),
  };
}
