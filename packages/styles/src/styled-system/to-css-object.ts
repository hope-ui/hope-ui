import { isObject, runIfFn } from "@hope-ui/utils";
import mergeWith from "lodash.mergewith";

import { CSSObject, Theme, ThemeBase, ThemeColor } from "../types";
import { ThemeScale } from "../types/theme";
import { Shade } from "../types/token";
import { px } from "../utils/breakpoint";
import { expandResponsive } from "./expand-responsive";
import { BaseSystemStyleProps } from "./props/base";
import { PseudoSelectorProps } from "./props/pseudos";
import { SystemStyleObject } from "./system.types";
import { PSEUDO_SELECTORS_MAP, STYLE_PROPS_MAP } from "./system-map";

/** Get a color value from theme if the token exist, return the token otherwise. */
function resolveColorTokenValue(token: string, theme: ThemeBase) {
  const parts = token.split(".");

  if (parts.length !== 2) {
    return token;
  }

  const [color, shade] = parts as [ThemeColor, Shade];

  return theme.colors[color]?.[shade] ?? token;
}

/** Get a value from theme if the token exist, return the token otherwise. */
function resolveTokenValue(
  token: string | number | null | undefined,
  scale: keyof ThemeScale,
  theme: ThemeBase
) {
  if (token == null) {
    return undefined;
  }

  if (scale === "colors") {
    return resolveColorTokenValue(String(token), theme);
  }

  if (scale === "space" || scale === "sizes" || scale === "radii") {
    return theme[scale][String(token)] ?? px(token);
  }

  return theme[scale][String(token)] ?? token;
}

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
    const propertyNames = STYLE_PROPS_MAP[propertyName as keyof BaseSystemStyleProps] ?? [
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
