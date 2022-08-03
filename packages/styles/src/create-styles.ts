import { isFunction } from "@hope-ui/utils";
import mergeWith from "lodash.mergewith";
import { Accessor, createMemo } from "solid-js";

import { css } from "./stitches.config";
import { toCSSObject } from "./styled-system/to-css-object";
import { useComponentTheme, useTheme } from "./theme/theme-provider";
import type { ClassNames, Styles, SystemStyleObject, Theme } from "./types";
import { ThemeBase } from "./types";
import { getComponentPartClassName } from "./utils/get-component-part-class-name";
import { mergeClassNames } from "./utils/merge-class-names";

interface UseStylesOptions<ComponentParts extends string, StyleParams> {
  /** The classNames applied to each parts of the component. */
  classNames?: Accessor<ClassNames<ComponentParts> | undefined>;

  /** The styles applied to each parts of the component, will be parsed by `emotion` and added to the head. */
  styles?: Accessor<Styles<ComponentParts, StyleParams> | undefined>;

  /** Whether the base styles should be applied or not. */
  unstyled?: Accessor<boolean | undefined>;
}

function extractStyles<StyleParams>(
  styles: Styles<string, StyleParams> | undefined,
  theme: Theme,
  params: StyleParams
): Partial<Record<string, SystemStyleObject>> {
  if (isFunction(styles)) {
    return styles(theme, params ?? ({} as StyleParams));
  }

  return styles ?? {};
}

interface CreateStylesConfig<
  ComponentParts extends string,
  StyleParams extends Record<string, any>
> {
  /** The theme provided by the closest `ThemeProviderContext`. */
  theme: ThemeBase;

  /** Params to be passed to the result of `createStyles`. */
  params: StyleParams;

  /**
   * Return a css class selector for a given component part.
   * @example
   * // selector("leftIcon") => ".hope-button__left-icon"
   */
  selector: (part: ComponentParts) => string;
}

/**
 * Create a styles primitive to use inside a component.
 *
 * @param name The name of the component
 * @param styles The styles object to be processed by `stitches`.
 * @return A primitive to use inside the component to get the generated classNames.
 */
export function createStyles<
  ComponentParts extends string = string,
  StyleParams extends Record<string, any> = {}
>(
  name: string,
  styles:
    | ((
        config: CreateStylesConfig<ComponentParts, StyleParams>
      ) => Record<ComponentParts, SystemStyleObject>)
    | Record<ComponentParts, SystemStyleObject>
) {
  const selector = (part: ComponentParts) => {
    return `.${getComponentPartClassName(name, part)}`;
  };

  const extractBaseStyles = typeof styles === "function" ? styles : () => styles;

  function useStyles(params: StyleParams, options?: UseStylesOptions<ComponentParts, StyleParams>) {
    const theme = useTheme();
    const componentTheme = useComponentTheme(name);

    const classes = createMemo(() => {
      const baseStyles = extractBaseStyles({
        theme: theme(),
        params,
        selector,
      }) as Record<string, SystemStyleObject>;

      const themeStyles = extractStyles(componentTheme()?.styles, theme(), params);
      const propStyles = extractStyles(options?.styles?.(), theme(), params);

      const baseClassNames = Object.fromEntries(
        Object.keys(baseStyles).map(key => {
          const mergedStyles = mergeWith(
            {},
            !options?.unstyled?.() ? baseStyles[key] : {},
            themeStyles[key] ? themeStyles[key] : {},
            propStyles[key] ? propStyles[key] : {}
          );

          const cssComponent = css(toCSSObject(mergedStyles, theme()));

          return [key, cssComponent().className];
        })
      ) as Record<ComponentParts, string>;

      return mergeClassNames({
        name,
        baseClassNames,
        themeClassNames: componentTheme()?.classNames,
        propClassNames: options?.classNames?.(),
      });
    });

    return classes;
  }

  return useStyles;
}
