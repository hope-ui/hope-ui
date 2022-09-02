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

const IMPORTANT_REGEX = /!(important)?$/;

function isImportant(value: string) {
  return IMPORTANT_REGEX.test(value);
}

function withoutImportant(value: string) {
  return value.replace(IMPORTANT_REGEX, "").trim();
}

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

  const tokenStr = String(token);

  const rawToken = withoutImportant(tokenStr);

  let resolvedValue;

  if (scale === "colors") {
    resolvedValue = resolveColorTokenValue(rawToken, vars);
  } else if (UNITLESS_SCALES.includes(scale)) {
    resolvedValue = vars[scale][rawToken] ?? rawToken;
  } else {
    resolvedValue = vars[scale][rawToken] ?? px(rawToken);
  }

  return isImportant(tokenStr) ? `${resolvedValue} !important` : resolvedValue;
}
