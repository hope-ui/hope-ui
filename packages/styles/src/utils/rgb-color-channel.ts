import { toRgba } from "./to-rgba";

export function rgbColorChannel(hexOrRgb: string): string {
  const { r, g, b } = toRgba(hexOrRgb);

  return `${r} ${g} ${b}`;
}
