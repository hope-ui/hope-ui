import { PaletteChannel, PaletteScale } from "../../types";
import { rgbColorChannel } from "../../utils";

export function generatePaletteChannel(scale: PaletteScale): PaletteChannel {
  return {
    mainChannel: rgbColorChannel(scale["500"]),
    lightChannel: rgbColorChannel(scale["100"]),
    darkChannel: rgbColorChannel(scale["900"]),
  };
}
