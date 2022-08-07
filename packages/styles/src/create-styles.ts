import { isFunction } from "@hope-ui/utils";
import mergeWith from "lodash.mergewith";
import { createMemo, createUniqueId } from "solid-js";

import { useTheme, useThemeStyles } from "./theme/theme-provider";
import type {
  GetClass,
  PartialStylesInterpolation,
  StylesInterpolation,
  StylesObject,
  SystemStyleObject,
  Theme,
  UseStylesOptions,
  UseStylesReturn,
} from "./types";

function extractStyles<ComponentParts extends string, StylesParams extends Record<string, any>>(
  styles: PartialStylesInterpolation<ComponentParts, StylesParams> | undefined,
  theme: Theme,
  params: StylesParams,
  getClass: GetClass<ComponentParts>
): Partial<StylesObject<ComponentParts>> {
  if (isFunction(styles)) {
    return styles(theme, params ?? ({} as StylesParams), getClass);
  }

  return styles ?? {};
}

/** Create a `useStyles` primitive to use inside a component. */
export function createStyles<
  ComponentParts extends string = string,
  StylesParams extends Record<string, any> = any
>(styles: StylesInterpolation<ComponentParts, StylesParams>) {
  const uniqueId = createUniqueId();

  const getClass: GetClass<ComponentParts> = part => {
    return `__hope-${uniqueId}-${part}`;
  };

  const extractBaseStyles = typeof styles === "function" ? styles : () => styles;

  function useStyles(
    options?: UseStylesOptions<ComponentParts, StylesParams>,
    themeKey?: string
  ): UseStylesReturn<ComponentParts> {
    const theme = useTheme();
    const themeStyles = useThemeStyles(themeKey);

    const styles = createMemo(() => {
      const { styles, unstyled, ...stylesParams } = options ?? {};

      const params = stylesParams as StylesParams;

      const baseStyleObject = extractBaseStyles(theme(), params, getClass);
      const themeStyleObject = extractStyles(themeStyles(), theme(), params, getClass);
      const propStyleObject = extractStyles(styles, theme(), params, getClass);

      const parts = Object.keys(baseStyleObject) as ComponentParts[];

      return Object.fromEntries(
        parts.map(key => {
          const mergedStyleObject = mergeWith(
            {},
            !unstyled ? baseStyleObject[key] : {},
            themeStyleObject[key] ?? {},
            propStyleObject[key] ?? {}
          );

          return [key, mergedStyleObject];
        })
      ) as Record<ComponentParts, SystemStyleObject>;
    });

    return { styles, getClass };
  }

  return useStyles;
}
