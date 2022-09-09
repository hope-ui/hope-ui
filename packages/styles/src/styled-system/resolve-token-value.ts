/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/7d7e04d53d871e324debe0a2cb3ff44d7dbf3bca/packages/components/styled-system/src/utils/create-transform.ts
 */

import { delve, isNumber } from "@hope-ui/utils";

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

  // if the value is not found in the scale root,
  // maybe it's a dot-notated path like "neutral.500" so ty to access it via `delve`
  let resolvedValue = (vars[scale] as any)[rawToken] ?? delve(vars[scale], rawToken);

  if (resolvedValue == null) {
    resolvedValue = UNITLESS_SCALES.includes(scale) ? rawToken : px(rawToken);
  }

  return isImportant(tokenStr) ? `${resolvedValue} !important` : resolvedValue;
}
