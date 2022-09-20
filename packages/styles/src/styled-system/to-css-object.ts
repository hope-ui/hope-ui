/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/styled-system/src/css.ts
 */

import { isEmptyObject, isObject, runIfFn } from "@hope-ui/utils";

import { CSSObject } from "../stitches.config";
import { BaseSystemStyleProps, PseudoSelectorProps, SystemStyleObject, Theme } from "../types";
import { isColorModeObjectLike } from "../utils";
import { expandResponsive } from "./expand-responsive";
import {
  DARK_PSEUDO_PROP,
  DARK_SELECTOR,
  PSEUDO_SELECTORS_MAP,
  SHORTHANDS_MAP,
} from "./property-map";
import { resolveTokenValue } from "./resolve-token-value";

/** Return a CSSObject from a system style object. */
export function toCSSObject(systemStyleObject: SystemStyleObject, theme: Theme): CSSObject {
  const computedStyles: CSSObject = {};

  const styles = expandResponsive(systemStyleObject)(theme);

  let darkSystemStyleObject: SystemStyleObject = {};

  for (let key in styles) {
    /**
     * allows the user to pass functional values.
     * boxShadow: theme => `0 2px 2px ${theme.vars.colors.primary["500"]}`
     */
    let value = runIfFn(styles[key], theme);

    if (value == null) {
      continue;
    }

    /**
     * Extract dark mode pseudo selector style.
     */
    if (key === DARK_PSEUDO_PROP && isObject(value)) {
      darkSystemStyleObject = Object.assign({}, darkSystemStyleObject, value);
      continue;
    }

    /**
     * Split `light/dark` values.
     * Assuming light a "first/default" interface.
     */
    if (isObject(value) && isColorModeObjectLike(value)) {
      const { light, dark } = value;

      value = light;

      if (dark != null) {
        darkSystemStyleObject[key] = dark;
      }
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

  if (!isEmptyObject(darkSystemStyleObject)) {
    computedStyles[DARK_SELECTOR] = Object.assign(
      {},
      computedStyles[DARK_SELECTOR],
      toCSSObject(darkSystemStyleObject, theme)
    );
  }

  // Sort in correct CSS order.
  return Object.keys(computedStyles)
    .sort((a, b) => {
      if (a.startsWith("@")) {
        // `a` is a css "@" query => a>b.
        return 1;
      } else if (b.startsWith("@")) {
        // `b` is a css "@" query => b>a.
        return -1;
      } else if (isObject(computedStyles[a])) {
        // `a` is a css selector => a>b.
        return 1;
      } else if (isObject(computedStyles[b])) {
        // `b` is a css selector => b>a.
        return -1;
      } else {
        // both are css rules => keep order.
        return 0;
      }
    })
    .reduce((acc, key) => {
      acc[key] = computedStyles[key];
      return acc;
    }, {} as any);

  //return computedStyles;
}
