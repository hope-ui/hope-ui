import { css, cx } from "@emotion/css";
import { createMemo, createUniqueId } from "solid-js";

import { ThemeProviderStyles, useTheme, useThemeProviderStyles } from "../theme/ThemeProvider";
import type { CSSObject, HopeTheme } from "../types";
import { mergeClassNames } from "../utils/mergeClassNames";

type StylesPartial<Key extends string> =
  | Partial<Record<Key, CSSObject>>
  | ((theme: HopeTheme, params: Record<string, any>) => Partial<Record<Key, CSSObject>>);

export interface UseStylesOptions<Key extends string> {
  name: string | string[];
  classNames?: Partial<Record<Key, string>>;
  styles?: StylesPartial<Key>;
  unstyled?: boolean;
}

/**
 * Create a function that combines a name and an id to create a unique className,
 * in order to be used as ref in `createStyles`.
 */
function createGetRef(id: string) {
  return (refName: string) => `__hope-ref-${id}-${refName}`;
}

function getStyles<Key extends string>(
  styles: UseStylesOptions<Key>["styles"] | ThemeProviderStyles[],
  theme: HopeTheme,
  params: Record<string, any>
): CSSObject {
  const extractStyles = (stylesPartial: UseStylesOptions<Key>["styles"]) => {
    if (typeof stylesPartial === "function") {
      return stylesPartial(theme, params ?? {});
    }

    return stylesPartial ?? {};
  };

  if (Array.isArray(styles)) {
    return styles
      .map(item => extractStyles(item.styles))
      .reduce<Record<string, CSSObject>>((acc, item: Record<string, CSSObject>) => {
        Object.keys(item).forEach(key => {
          if (!acc[key]) {
            acc[key] = { ...item[key] };
          } else {
            acc[key] = { ...acc[key], ...item[key] };
          }
        });
        return acc;
      }, {});
  }

  return extractStyles(styles);
}

type GetCSSObject<Key extends string, Params> = (
  theme: HopeTheme,
  params: Params,
  getRef: (refName: string) => string
) => Record<Key, CSSObject>;

export function createStyles<Key extends string = string, Params = void>(
  input: GetCSSObject<Key, Params> | Record<Key, CSSObject>
) {
  const getRef = createGetRef(createUniqueId());

  const getCssObject = typeof input === "function" ? input : () => input;

  function useStyles(params: Params, options?: UseStylesOptions<Key>) {
    const theme = useTheme();
    const contextStyles = useThemeProviderStyles(options?.name);

    const classes = createMemo(() => {
      const cssObject = getCssObject(theme(), params, getRef) as Record<string, CSSObject>;

      const componentStyles = getStyles(options?.styles, theme(), params);
      const providerStyles = getStyles(contextStyles(), theme(), params);

      const baseClasses = Object.fromEntries(
        Object.keys(cssObject).map(key => {
          const { ref, ...baseStyles } = cssObject[key];

          const mergedStyles = cx(
            { [css(baseStyles)]: !options?.unstyled },
            css(providerStyles[key]),
            css(componentStyles[key]),
            ref // static className used as selector ref
          );

          return [key, mergedStyles];
        })
      ) as Record<Key, string>;

      return mergeClassNames({
        cx,
        classes: baseClasses,
        themeStyles: contextStyles(),
        classNames: options?.classNames,
        name: options?.name,
      });
    });

    return { classes, cx, theme };
  }

  return useStyles;
}
