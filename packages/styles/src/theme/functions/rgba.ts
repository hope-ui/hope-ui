import { toRgba } from "../../utils/to-rgba";

export function rgba(hexOrRgbColor: string, alpha: number) {
  if (hexOrRgbColor == null || hexOrRgbColor == "" || alpha > 1 || alpha < 0) {
    return "rgba(0, 0, 0, 1)";
  }

  const { r, g, b } = toRgba(hexOrRgbColor);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
