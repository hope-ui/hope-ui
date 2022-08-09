import { isFunction } from "@hope-ui/utils";
import mergeWith from "lodash.mergewith";
import { createMemo, createUniqueId } from "solid-js";

import { useTheme, useThemeStyles } from "./theme/theme-provider";
import type {
  GetStaticClass,
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
  getStaticClass: GetStaticClass
): Partial<StylesObject<ComponentParts>> {
  if (isFunction(styles)) {
    return styles(theme, params ?? ({} as StylesParams), getStaticClass);
  }

  return styles ?? {};
}

/** Create a `useStyles` primitive to use inside a component. */
export function createStyles<ComponentParts extends string = string, StylesParams = void>(
  styles: StylesInterpolation<ComponentParts, StylesParams>
) {
  const uniqueId = createUniqueId();

  const getStaticClass: GetStaticClass = suffix => `hope-${uniqueId}-${suffix}`;

  const extractBaseStyles = typeof styles === "function" ? styles : () => styles;

  function useStyles(
    params: StylesParams,
    options?: UseStylesOptions<ComponentParts, StylesParams>
  ): UseStylesReturn<ComponentParts> {
    const theme = useTheme();
    const themeStyles = useThemeStyles(options?.name);

    const styles = createMemo(() => {
      const { styles, unstyled } = options ?? {};

      const baseStyleObject = extractBaseStyles(theme(), params, getStaticClass);
      const themeStyleObject = extractStyles(themeStyles(), theme(), params, getStaticClass);
      const propStyleObject = extractStyles(styles?.(), theme(), params, getStaticClass);

      const parts = Object.keys(baseStyleObject) as ComponentParts[];

      return Object.fromEntries(
        parts.map(key => {
          const mergedStyleObject = mergeWith(
            {},
            !unstyled?.() ? baseStyleObject[key] : {},
            themeStyleObject[key] ?? {},
            propStyleObject[key] ?? {}
          );

          return [key, mergedStyleObject];
        })
      ) as Record<ComponentParts, SystemStyleObject>;
    });

    return { styles, getStaticClass };
  }

  return useStyles;
}
