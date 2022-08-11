/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/styled-system/src/create-theme-vars/create-theme-vars.ts
 */

import { flatten, unflatten } from "@hope-ui/utils";

import { ThemeCSSVariables, ThemeScales, ThemeVars } from "../types";
import { cssVar } from "../utils/css-var";

/**
 * Use `__` as token separator because it's not a regex keyword.
 * We can't use `.` as separator,
 * because the unflatten process will also unflatten token value like `0.5` (ex: in space scale).
 */
const FLATTEN_SEPARATOR = "__";

/**
 * Convert a token name to a css variable.
 *
 * @example
 * tokenToCssVar('colors__primary__500', 'hope')
 * => {
 *   variable: '--hope-colors-primary-500',
 *   reference: 'var(--hope-colors-primary-500)'
 * }
 */
function tokenToCssVar(regex: RegExp, token: string | number, prefix?: string) {
  return cssVar(String(token).replace(regex, "-"), undefined, prefix);
}

/**
 * Create theme css variables.
 *
 * @return
 * - cssVarsValues - The css variables to be injected in `:root`.
 * - vars - An object with the same shape as `scales` but with css variables reference as value.
 *
 * @example
 * createThemeVars(scales, 'hope')
 * => {
 *   cssVarsValues: {
 *     '--hope-colors-primary-500' : '#fff',
 *   },
 *   vars: {
 *     colors: {
 *       primary: {
 *         500: 'var(--hope-colors-primary-500)'
 *       }
 *     }
 *   }
 * }
 */
export function createThemeVars(scales: ThemeScales, cssVarPrefix?: string) {
  const rootVars: Record<string, any> = {};
  const darkVars: Record<string, any> = {};

  const varsReference: Record<string, any> = {};

  // split colors because it has light and dark values.
  const { colors, ...otherScales } = scales;

  // hack to have the word `colors` in the tokens.
  const lightColors = { colors: colors.light };
  const darkColors = { colors: colors.dark };

  const flatLightColorsTokens = flatten(lightColors, FLATTEN_SEPARATOR);
  const flatDarkColorsTokens = flatten(darkColors, FLATTEN_SEPARATOR);
  const flatOtherTokens = flatten(otherScales, FLATTEN_SEPARATOR);

  // Replace both separator and `.`, because it's not a valid character in css variable name.
  const regex = new RegExp(`(${FLATTEN_SEPARATOR}|\\.)`, "g");

  for (const [token, value] of Object.entries(flatLightColorsTokens)) {
    const { variable, reference } = tokenToCssVar(regex, token, cssVarPrefix);
    rootVars[variable] = value;
    varsReference[token] = reference;
  }

  for (const [token, value] of Object.entries(flatDarkColorsTokens)) {
    const { variable } = tokenToCssVar(regex, token, cssVarPrefix);
    darkVars[variable] = value;
    // No need to add to `varsReference` since light colors vars already be added.
  }

  for (const [token, value] of Object.entries(flatOtherTokens)) {
    const { variable, reference } = tokenToCssVar(regex, token, cssVarPrefix);
    rootVars[variable] = value;
    varsReference[token] = reference;
  }

  // TODO: find more performant solution than flatten => unflatten.
  const vars = unflatten(varsReference, FLATTEN_SEPARATOR) as ThemeVars;

  const cssVarsValues: ThemeCSSVariables = {
    root: rootVars,
    dark: darkVars,
  };

  return { cssVarsValues, vars };
}
