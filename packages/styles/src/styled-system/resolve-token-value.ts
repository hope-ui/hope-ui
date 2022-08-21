import { ThemeScales, ThemeVars } from "../types";
import { px } from "../utils/breakpoint";

const UNITLESS_SCALES: Array<keyof ThemeScales> = [
  "colors",
  "fonts",
  "fontWeights",
  "lineHeights",
  "shadows",
  "zIndices",
];

/** Get a color value from theme if the token exist, return the token otherwise. */
function resolveColorTokenValue(token: string, vars: ThemeVars) {
  const parts = token.split(".");

  if (parts.length !== 2) {
    return token;
  }

  // key is like "primary" | "text" | "common", etc...
  // value is like "500" | "solidText" | "divider", etc...
  const [key, value] = parts;

  return (vars.colors as any)[key]?.[value] ?? token;
}

/** Get a value from theme if the token exist, return the token otherwise. */
export function resolveTokenValue(
  token: string | number | null | undefined,
  scale: keyof ThemeScales,
  vars: ThemeVars
) {
  if (token == null) {
    return undefined;
  }

  if (scale === "colors") {
    return resolveColorTokenValue(String(token), vars);
  }

  if (UNITLESS_SCALES.includes(scale)) {
    return vars[scale][String(token)] ?? token;
  }

  return vars[scale][String(token)] ?? px(token);
}
