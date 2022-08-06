import { isFunction } from "@hope-ui/utils";
import mergeWith from "lodash.mergewith";
import { createMemo } from "solid-js";

import { useTheme, useThemeStyles } from "./theme/theme-provider";
import type {
  GetStaticClass,
  PartialStyles,
  Styles,
  StylesObject,
  SystemStyleObject,
  Theme,
  UseStylesOptions,
  UseStylesReturn,
} from "./types";
import { getComponentPartClass } from "./utils/get-component-part-class";

function extractStyles<ComponentParts extends string, StylesParams>(
  styles: PartialStyles<ComponentParts, StylesParams> | undefined,
  theme: Theme,
  params: StylesParams,
  getStaticClass: GetStaticClass<ComponentParts>
): Partial<StylesObject<ComponentParts>> {
  if (isFunction(styles)) {
    return styles(theme, params ?? ({} as StylesParams), getStaticClass);
  }

  return styles ?? {};
}

interface CreateStylesOptions<ComponentParts extends string, StylesParams> {
  /** The name of the component, used for retrieving theme styles and generating static classNames. */
  component: string;

  /** The styles object to be processed by `stitches`. */
  styles: Styles<ComponentParts, StylesParams>;

  /** The default styles params to use, if not provided by the component. */
  defaultStylesParams?: StylesParams;
}

/** Create a `useStyles` primitive to use inside a component. */
export function createStyles<ComponentParts extends string = string, StylesParams = void>(
  options: CreateStylesOptions<ComponentParts, StylesParams>
) {
  const { component, styles, defaultStylesParams = {} as StylesParams } = options;

  const getStaticClass: GetStaticClass<ComponentParts> = part => {
    return getComponentPartClass(component, part);
  };

  const extractBaseStyles = typeof styles === "function" ? styles : () => styles;

  function useStyles(
    options: UseStylesOptions<ComponentParts, StylesParams>
  ): UseStylesReturn<ComponentParts> {
    const theme = useTheme();
    const themeStyles = useThemeStyles(component);

    const styles = createMemo(() => {
      const { styles, unstyled, ...stylesParams } = options;

      const params = {
        ...defaultStylesParams,
        ...stylesParams,
      };

      const baseStyleObject = extractBaseStyles(theme(), params, getStaticClass);
      const themeStyleObject = extractStyles(themeStyles(), theme(), params, getStaticClass);
      const propStyleObject = extractStyles(styles, theme(), params, getStaticClass);

      return Object.fromEntries(
        Object.keys(baseStyleObject).map(key => {
          const mergedStyleObject = mergeWith(
            {},
            !unstyled ? baseStyleObject[key as ComponentParts] : {},
            themeStyleObject[key] ?? {},
            propStyleObject[key as ComponentParts] ?? {}
          );

          return [key, mergedStyleObject];
        })
      ) as Record<ComponentParts, SystemStyleObject>;
    });

    return { styles, getStaticClass };
  }

  return useStyles;
}
