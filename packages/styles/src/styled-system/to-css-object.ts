/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/styled-system/src/css.ts
 */

import { isObject, runIfFn } from "@hope-ui/utils";

import { CSSObject } from "../stitches.config";
import { BaseSystemStyleProps, PseudoSelectorProps, SystemStyleObject, Theme } from "../types";
import { PSEUDO_SELECTORS_MAP, SHORTHANDS_MAP } from "./property-map";
import { resolveTokenValue } from "./resolve-token-value";

/** Return a CSSObject from a system style object. */
export function toCSSObject(systemStyleObject: SystemStyleObject, theme: Theme): CSSObject {
  let computedStyles: CSSObject = {};

  if (!theme.__breakpoints) {
    return computedStyles;
  }

  const { isResponsive, toArrayValue, media: medias } = theme.__breakpoints;

  for (let key in systemStyleObject) {
    /**
     * allows the user to pass functional values.
     * boxShadow: vars => `0 2px 2px ${vars.colors.primary["500"]}`
     */
    let value = runIfFn(systemStyleObject[key], theme.vars);

    if (value == null) {
      continue;
    }

    /**
     * Expands an array or object syntax responsive style.
     * // { mx: [1, 2] }
     * // or
     * // { mx: { base: 1, sm: 2 } }
     * // => { mx: 1, "@media(min-width:<sm>)": { mx: 2 } }
     */
    if (Array.isArray(value) || (isObject(value) && isResponsive(value))) {
      let values = Array.isArray(value) ? value : toArrayValue(value);
      values = values.slice(0, medias.length);

      for (let index = 0; index < values.length; index++) {
        const media = medias[index];
        const val = values[index];

        if (media) {
          if (val == null) {
            computedStyles[media] ??= {};
          } else {
            computedStyles[media] = Object.assign(
              {},
              computedStyles[media],
              toCSSObject({ [key]: val }, theme)
            );
          }
        } else {
          computedStyles = Object.assign(
            {},
            computedStyles,
            toCSSObject({ ...systemStyleObject, [key]: val }, theme)
          );
        }
      }

      continue;
    }

    /**
     * converts pseudo shorthands to valid selector.
     * "_hover" => "&:hover"
     */
    if (key.startsWith("_")) {
      const pseudoSelector = PSEUDO_SELECTORS_MAP.get(key as keyof PseudoSelectorProps);

      if (pseudoSelector == null) {
        continue;
      }

      key = pseudoSelector;
    }

    /**
     * run recursively until all css objects are resolved,
     * aka pseudo selectors and media queries.
     */
    if (isObject(value)) {
      computedStyles[key] = Object.assign(
        {},
        computedStyles[key],
        toCSSObject(value as any, theme)
      );
      continue;
    }

    /**
     * converts style props shorthands to valid css properties.
     * "mx" => ["marginLeft", "marginRight"]
     */
    const propertyNames = SHORTHANDS_MAP.get(key as keyof BaseSystemStyleProps) ?? [key];

    /**
     * apply same value to each css properties.
     * { mx: 4 } => { marginLeft: "1rem", "marginRight: "1rem" }
     */
    for (const propertyName of propertyNames) {
      const scale = theme.themeMap[propertyName];

      if (scale != null) {
        value = resolveTokenValue(value as any, scale, theme.vars);
      }

      computedStyles[propertyName] = value;
    }
  }

  return computedStyles;
}
