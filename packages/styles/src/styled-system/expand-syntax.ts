/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/9de39921b983ad0eb2df7195e3b683c2e2e9e290/packages/components/styled-system/src/utils/expand-responsive.ts
 */

import { Dict, isObject, runIfFn } from "@hope-ui/utils";

import { Theme } from "../types";
import { isColorModeObjectLike } from "../utils";
import { DARK_PSEUDO_PROP } from "./property-map";

/**
 * Expands responsive array/object syntax and color mode syntax.
 *
 * @example
 * expandSyntax({
 *  mx: [1, 2],
 *  bg: { light: 'red', dark: 'blue' }
 * })
 * // or
 * expandSyntax({
 *  mx: { base: 1, sm: 2 } ,
 *  bg: { light: 'red', dark: 'blue' }
 * })
 *
 * // => {
 *  mx: 1,
 *  "@media(min-width:<sm>)": {
 *    mx: 2
 *  },
 *  bg: "red",
 *   _dark: {
 *     bg: "blue"
 *   }
 * }
 */
export const expandSyntax = (styles: Dict) => (theme: Theme) => {
  if (!theme.__breakpoints) {
    return styles;
  }

  const { isResponsive, toArrayValue, medias } = theme.__breakpoints;

  const computedStyles: Dict = {};

  for (const key in styles) {
    let value = runIfFn(styles[key], theme);

    if (value == null) {
      continue;
    }

    // try to expand color mode syntax and continue loop if successful.
    if (expandColorModeSyntax(key, value, computedStyles)) {
      continue;
    }

    // try converts the object responsive syntax to array syntax.
    value = isObject(value) && isResponsive(value) ? toArrayValue(value) : value;

    // not a responsive syntax = treat the value as is.
    if (!Array.isArray(value)) {
      computedStyles[key] = value;
      continue;
    }

    const queries = value.slice(0, medias.length).length;

    // try to expand responsive syntax.
    for (let index = 0; index < queries; index += 1) {
      const media = medias?.[index];

      if (!media) {
        // try to expand color mode syntax, if fail treat the value as is.
        if (!expandColorModeSyntax(key, value[index], computedStyles)) {
          computedStyles[key] = value[index];
        }
        continue;
      }

      computedStyles[media] = computedStyles[media] || {};

      if (value[index] == null) {
        continue;
      }

      // try to expand color mode syntax, if fail treat the value as is.
      if (!expandColorModeSyntax(key, value[index], computedStyles[media])) {
        computedStyles[media][key] = value[index];
      }
    }
  }

  return computedStyles;
};

/**
 * Expands color mode syntax into a `target` object.
 * WARNING: This function mutate the `target` object.
 *
 * @param key The key to expand into the `target` object.
 * @param value The value to expand.
 * @param target The target object in which to put the "expanded" value.
 * @return `true` if successful, `false` otherwise.
 */
function expandColorModeSyntax(key: any, value: any, target: Dict) {
  if (!isObject(value) || !isColorModeObjectLike(value)) {
    return false;
  }

  const { light, dark } = value;

  if (light != null) {
    target[key] = light;
  }

  target[DARK_PSEUDO_PROP] = target[DARK_PSEUDO_PROP] || {};

  if (dark != null) {
    target[DARK_PSEUDO_PROP][key] = dark;
  }

  return true;
}
