import { css, cx } from "@emotion/css";
import { Accessor, createMemo, createUniqueId } from "solid-js";

import { ThemeStylesObject, useTheme, useThemeStyles } from "../theme/theme-provider";
import type { CSSObject, Theme } from "../types";
import { mergeClassNames } from "../utils/merge-class-names";

type StylesPartial<Key extends string, VariantProps> =
  | Partial<Record<Key, CSSObject>>
  | ((theme: Theme, variants: VariantProps) => Partial<Record<Key, CSSObject>>);

export interface UseStylesOptions<Key extends string, VariantProps> {
  /** The name of the component/parts, used to retrieve theme styles and for static classNames generation. */
  name: string | string[];

  /** The classNames applied to each parts of the component. */
  classNames?: Accessor<Partial<Record<Key, string>> | undefined>;

  /** The styles applied to each parts of the component, will be parsed by `emotion` and added to the head. */
  styles?: Accessor<StylesPartial<Key, VariantProps> | undefined>;

  /** Whether the base styles should be applied or not. */
  unstyled?: Accessor<boolean | undefined>;
}

/**
 * Create a function that combines a name and an id to create a unique className,
 * in order to be used as ref in `createStyles`.
 */
function createGetRef(id: string) {
  return (refName: string) => `__hope-ref-${id}-${refName}`;
}

function getStyles<Key extends string, VariantProps>(
  styles: ThemeStylesObject[] | StylesPartial<Key, VariantProps> | undefined,
  theme: Theme,
  variants: VariantProps
): CSSObject {
  const extractStyles = (stylesPartial?: StylesPartial<Key, VariantProps> | undefined) => {
    if (typeof stylesPartial === "function") {
      return stylesPartial(theme, variants ?? ({} as VariantProps));
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

export function createStyles<Key extends string = string, VariantProps = void>(
  input:
    | ((
        theme: Theme,
        variants: VariantProps,
        getRef: (refName: string) => string
      ) => Record<Key, CSSObject>)
    | Record<Key, CSSObject>
) {
  const getRef = createGetRef(createUniqueId());

  const getCssObject = typeof input === "function" ? input : () => input;

  function useStyles(variants: VariantProps, options?: UseStylesOptions<Key, VariantProps>) {
    const theme = useTheme();
    const themeStyles = useThemeStyles(options?.name);

    const classes = createMemo(() => {
      const createStylesCSSObject = getCssObject(theme(), variants, getRef) as Record<
        string,
        CSSObject
      >;

      const themeCSSObject = getStyles(themeStyles(), theme(), variants);
      const componentCSSObject = getStyles(options?.styles?.(), theme(), variants);

      const baseClassNames = Object.fromEntries(
        Object.keys(createStylesCSSObject).map(key => {
          const { ref, ...baseCSSObject } = createStylesCSSObject[key];

          const mergedStyles = cx(
            !options?.unstyled?.() ? css(baseCSSObject) : undefined,
            themeCSSObject[key] ? css(themeCSSObject[key]) : undefined,
            componentCSSObject[key] ? css(componentCSSObject[key]) : undefined,
            ref // static className used as selector ref
          );

          return [key, mergedStyles];
        })
      ) as Record<Key, string>;

      return mergeClassNames({
        baseClassNames: baseClassNames,
        themeStyles: themeStyles(),
        classNames: options?.classNames?.(),
        name: options?.name,
      });
    });

    return classes;
  }

  return useStyles;
}
