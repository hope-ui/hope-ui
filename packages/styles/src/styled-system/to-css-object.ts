import { isObject, runIfFn } from "@hope-ui/utils";
import mergeWith from "lodash.mergewith";

import { CSSObject } from "../stitches.config";
import { BaseSystemStyleProps, PseudoSelectorProps, SystemStyleObject, Theme } from "../types";
import { expandResponsive } from "./expand-responsive";
import { PSEUDO_SELECTORS_MAP, SHORTHANDS_MAP } from "./property-map";
import { resolveTokenValue } from "./resolve-token-value";

/** Return a CSSObject from a system style object. */
export function toCSSObject(systemStyleObject: SystemStyleObject, theme: Theme): CSSObject {
  const computedStyles: CSSObject = {};

  const styles = expandResponsive(systemStyleObject)(theme);

  for (let propertyName in styles) {
    const valueOrFn = styles[propertyName];

    /**
     * allows the user to pass functional values.
     * boxShadow: theme => `0 2px 2px ${theme.colors.red["500"]}`
     */
    let value = runIfFn(valueOrFn, theme);

    if (value == null) {
      continue;
    }

    /**
     * converts pseudo shorthands to valid selector.
     * "_hover" => "&:hover"
     */
    if (propertyName.startsWith("_")) {
      propertyName = PSEUDO_SELECTORS_MAP[propertyName as keyof PseudoSelectorProps];
    }

    if (propertyName == null) {
      continue;
    }

    /**
     * run recursively until all css objects are resolved,
     * aka pseudo selectors and media queries.
     */
    if (isObject(value)) {
      computedStyles[propertyName] = computedStyles[propertyName] ?? {};
      computedStyles[propertyName] = mergeWith(
        {},
        computedStyles[propertyName],
        toCSSObject(value, theme)
      );
      continue;
    }

    /**
     * converts style props shorthands to valid css properties.
     * "mx" => ["marginLeft", "marginRight"]
     */
    const propertyNames = SHORTHANDS_MAP[propertyName as keyof BaseSystemStyleProps] ?? [
      propertyName,
    ];

    /**
     * apply same value to each css properties.
     * { mx: 4 } => { marginLeft: "1rem", "marginRight: "1rem" }
     */
    propertyNames.forEach(propertyName => {
      const scale = theme.themeMap[propertyName];

      if (scale != null) {
        value = resolveTokenValue(value, scale, theme);
      }

      computedStyles[propertyName] = value;
    });
  }

  return computedStyles;
}
