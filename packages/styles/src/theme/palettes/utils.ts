import { PaletteChannel, PaletteRangeGenerator, PaletteScale } from "../../types";
import { rgbColorChannel } from "../../utils/rgb-color-channel";

/** [light, dark]. */
export type PaletteGeneratorTuple = [PaletteRangeGenerator, PaletteRangeGenerator];

export function generatePaletteChannel(scale: PaletteScale): PaletteChannel {
  return {
    mainChannel: rgbColorChannel(scale["500"]),
    lightChannel: rgbColorChannel(scale["100"]),
    darkChannel: rgbColorChannel(scale["900"]),
  };
}
