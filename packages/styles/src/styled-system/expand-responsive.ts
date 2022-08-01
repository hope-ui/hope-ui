import { Dict, isObject, runIfFn } from "@hope-ui/utils";
import { Theme } from "../types";

/**
 * Expands an array or object syntax responsive style.
 *
 * @example
 * expandResponsive({ mx: [1, 2] })
 * // or
 * expandResponsive({ mx: { base: 1, sm: 2 } })
 *
 * // => { mx: 1, "@media(min-width:<sm>)": { mx: 2 } }
 */
export const expandResponsive = (styles: Dict) => (theme: Theme) => {
  if (!theme.__breakpoints) {
    return styles;
  }

  const { isResponsive, toArrayValue, media: medias } = theme.__breakpoints;

  const computedStyles: Dict = {};

  for (const key in styles) {
    let value = runIfFn(styles[key], theme);

    if (value == null) continue;

    // converts the object responsive syntax to array syntax
    value = isObject(value) && isResponsive(value) ? toArrayValue(value) : value;

    if (!Array.isArray(value)) {
      computedStyles[key] = value;
      continue;
    }

    const queries = value.slice(0, medias.length).length;

    for (let index = 0; index < queries; index += 1) {
      const media = medias?.[index];

      if (!media) {
        computedStyles[key] = value[index];
        continue;
      }

      computedStyles[media] = computedStyles[media] || {};

      if (value[index] == null) {
        continue;
      }

      computedStyles[media][key] = value[index];
    }
  }

  return computedStyles;
};
