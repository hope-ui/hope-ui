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

/** Utility function to create reversed color palettes. */
export function createReversePalette(scale: PaletteScale): PaletteRange {
  const scaleReversed = reverseScale(scale);

  return {
    ...scaleReversed,
    mainChannel: rgbColorChannel(scaleReversed["400"]),
    lightChannel: rgbColorChannel(scaleReversed["800"]),
    darkChannel: rgbColorChannel(scaleReversed["50"]),
  };
}

/** Reverse a palette scale. 50 -> 900...900 -> 50. */
export function reverseScale(scale: PaletteScale): PaletteScale {
  const keys = Object.keys(scale) as unknown as Array<keyof PaletteScale>;
  const keysReversed = keys.slice().reverse() as unknown as Array<keyof PaletteScale>;

  const scaleReversed = { ...scale };

  for (let i = 0; i < keys.length; i++) {
    scaleReversed[keys[i]] = scaleReversed[keysReversed[i]];
  }

  return scaleReversed;
}
