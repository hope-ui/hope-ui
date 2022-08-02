import { clsx } from "clsx";

import { ThemeStylesObject } from "../theme/theme-provider";

interface MergeClassNamesParams<T extends Record<string, string>> {
  /** The base classNames. */
  baseClassNames: T;

  /** The styles provided by the closest `ThemeProviderContext`. */
  themeStyles: ThemeStylesObject[];

  /** The classNames provided to the component via props. */
  classNames?: Partial<T>;

  /** The name of the component/parts. */
  name?: string | string[];
}

export function mergeClassNames<T extends Record<string, string>>(
  params: MergeClassNamesParams<T>
) {
  const themeClassNames = params.themeStyles.reduce<Record<string, string>>((acc, item) => {
    Object.keys(item.classNames).forEach(key => {
      if (typeof acc[key] !== "string") {
        acc[key] = item.classNames[key];
      } else {
        acc[key] = `${acc[key]} ${item.classNames[key]}`;
      }
    });

    return acc;
  }, {});

  return Object.keys(params.baseClassNames).reduce((acc, key) => {
    let staticClass;

    if (Array.isArray(params.name)) {
      staticClass = params.name
        .filter(Boolean)
        .map(part => `hope-${part}-${key}`)
        .join(" ");
    } else {
      staticClass = params.name ? `hope-${params.name}-${key}` : null;
    }

    const mergedClassName = clsx(
      params.baseClassNames[key],
      themeClassNames[key],
      params.classNames?.[key],
      staticClass
    );

    return {
      ...acc,
      [key]: mergedClassName,
    };
  }, {}) as T;
}
