import { isObject, runIfFn } from "@hope-ui/utils";
import mergeWith from "lodash.mergewith";

import { CSSObject, Theme, ThemeBase, ThemeColor } from "../types";
import { ThemeScale } from "../types/theme";
import { Shade } from "../types/token";
import { px } from "../utils/breakpoint";
import { expandResponsive } from "./expand-responsive";
import { PseudoSelectorProps, pseudoSelectors } from "./props/pseudos";
import { SHORTHAND_MAP } from "./shorthand-map";
import { stylePropNames, SystemStyleObject, SystemStyleProps } from "./system";

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

/** Take a props object and return only the keys that match a style prop. */
export function getUsedSystemStylePropNames(props: Record<string | number, any>) {
  return Object.keys(props).filter(key => key in stylePropNames) as Array<keyof SystemStyleProps>;
}

/** Return a CSSObject from a system style object. */
export function toCSSObject(systemStyleObject: SystemStyleObject, theme: Theme): CSSObject {
  const computedStyles: CSSObject = {};

  const styles = expandResponsive(systemStyleObject)(theme);

  for (let key in styles) {
    const valueOrFn = styles[key];

    /**
     * allows the user to pass functional values
     * boxShadow: theme => `0 2px 2px ${theme.colors.red}`
     */
    let value = runIfFn(valueOrFn, theme);

    if (value == null) {
      continue;
    }

    /**
     * converts pseudo shorthands to valid selector
     * "_hover" => "&:hover"
     */
    if (key.startsWith("_")) {
      key = pseudoSelectors[key as keyof PseudoSelectorProps];
    }

    if (key == null) {
      continue;
    }

    if (isObject(value)) {
      computedStyles[key] = computedStyles[key] ?? {};
      computedStyles[key] = mergeWith({}, computedStyles[key], toCSSObject(value, theme));
      continue;
    }

    const longhandKeys = SHORTHAND_MAP[key as keyof SystemStyleProps] ?? [key];

    longhandKeys.forEach(key => {
      const scale = theme.themeMap[key];

      if (scale != null) {
        value = resolveTokenValue(value, scale, theme);
      }

      computedStyles[key] = value;
    });
  }

  return computedStyles;
}
