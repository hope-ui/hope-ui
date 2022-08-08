import { Shade, Theme, ThemeColor, ThemeScale } from "../types";
import { px } from "../utils/breakpoint";

/** Get a color value from theme if the token exist, return the token otherwise. */
function resolveColorTokenValue(token: string, theme: Theme) {
  const parts = token.split(".");

  if (parts.length !== 2) {
    return token;
  }

  const [color, shade] = parts as [ThemeColor, Shade];

  return theme.colors[color]?.[shade] ?? token;
}

/** Get a value from theme if the token exist, return the token otherwise. */
export function resolveTokenValue(
  token: string | number | null | undefined,
  scale: keyof ThemeScale,
  theme: Theme
) {
  if (token == null) {
    return undefined;
  }

  if (scale === "colors") {
    return resolveColorTokenValue(String(token), theme);
  }

  if (scale === "fontSizes" || scale === "space" || scale === "sizes" || scale === "radii") {
    return theme[scale][String(token)] ?? px(token);
  }

  return theme[scale][String(token)] ?? token;
}
