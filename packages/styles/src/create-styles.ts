import { isFunction } from "@hope-ui/utils";
import mergeWith from "lodash.mergewith";
import { createMemo } from "solid-js";

import { useTheme, useThemeStyles } from "./theme/theme-provider";
import type { Styles, SystemStyleObject, Theme, UseStylesReturn } from "./types";
import { ThemeBase } from "./types";
import { getComponentStyleNameClass } from "./utils/get-component-style-name-class";

type UseStylesOptions<StylesNames extends string, StylesParams> = Partial<StylesParams> & {
  /**
   * Styles that will be merged with the "base styles" created by the `createStyles()` call.
   * Mostly used to override/add additional styles.
   */
  styles?: Styles<StylesNames, StylesParams>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
};

function extractStyles<StylesParams>(
  styles: Styles<string, StylesParams> | undefined,
  theme: Theme,
  params: StylesParams
): Partial<Record<string, SystemStyleObject>> {
  if (isFunction(styles)) {
    return styles(theme, params ?? ({} as StylesParams));
  }

  return styles ?? {};
}

interface CreateStylesOptions<StylesNames extends string, StylesParams> {
  /** The name of the component, used for retrieving theme styles and generating static classNames. */
  componentName: string;

  /** The styles object to be processed by `stitches`. */
  styles:
    | ((
        theme: ThemeBase,
        params: StylesParams,
        getStaticClass: (styleName: StylesNames) => string
      ) => Record<StylesNames, SystemStyleObject>)
    | Record<StylesNames, SystemStyleObject>;

  /** The default styles params to use, if not provided by the component. */
  defaultStylesParams?: StylesParams;
}

/** Create a `useStyles` primitive to use inside a component. */
export function createStyles<StylesNames extends string = string, StylesParams = void>(
  options: CreateStylesOptions<StylesNames, StylesParams>
) {
  const { componentName, styles, defaultStylesParams = {} as StylesParams } = options;

  const getStaticClass = (styleName: StylesNames) => {
    return getComponentStyleNameClass(componentName, styleName);
  };

  const extractBaseStyles = typeof styles === "function" ? styles : () => styles;

  function useStyles(
    options: UseStylesOptions<StylesNames, StylesParams>
  ): UseStylesReturn<StylesNames> {
    const theme = useTheme();
    const themeStyles = useThemeStyles(componentName);

    const styles = createMemo(() => {
      const { styles, unstyled, ...stylesParams } = options;

      const params = {
        ...defaultStylesParams,
        ...stylesParams,
      };

      const baseStyleObject = extractBaseStyles(theme(), params, getStaticClass);
      const themeStyleObject = extractStyles(themeStyles(), theme(), params);
      const propStyleObject = extractStyles(styles, theme(), params);

      return Object.fromEntries(
        Object.keys(baseStyleObject).map(key => {
          const mergedStyleObject = mergeWith(
            {},
            !unstyled ? baseStyleObject[key as StylesNames] : {},
            themeStyleObject[key] ?? {},
            propStyleObject[key] ?? {}
          );

          return [key, mergedStyleObject];
        })
      ) as Record<StylesNames, SystemStyleObject>;
    });

    return { styles, getStaticClass };
  }

  return useStyles;
}
