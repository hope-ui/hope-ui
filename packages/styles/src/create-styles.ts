import { isFunction } from "@hope-ui/utils";
import mergeWith from "lodash.mergewith";
import { Accessor, createMemo } from "solid-js";

import { useTheme, useThemeStyles } from "./theme/theme-provider";
import type { Styles, SystemStyleObject, Theme } from "./types";
import { ThemeBase } from "./types";
import { getComponentPartClassName } from "./utils/get-component-part-class-name";

interface UseStylesOptions<ComponentParts extends string, StyleParams> {
  /**
   * Styles that will be merged with the "base styles" created by the `createStyles()` call.
   * Mostly used to override/add additional styles.
   */
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

interface CreateStylesOptions<ComponentParts extends string, StyleParams = void> {
  /** The theme provided by the closest `ThemeProviderContext`. */
  theme: ThemeBase;

  /** Params passed by the component using to the result of `createStyles`. */
  params: StyleParams;

  /**
   * Return a css className for a given component part.
   * @example
   * // selector("leftIcon") => "hope-button__left-icon"
   */
  selector: (part: ComponentParts) => string;
}

interface UseStylesReturn<ComponentParts extends string>
  extends Pick<CreateStylesOptions<ComponentParts>, "selector"> {
  /** Accessor for the styles objects merged with theme and prop styles. */
  styles: Accessor<Record<ComponentParts, SystemStyleObject>>;
}

/**
 * Create a styles primitive to use inside a component.
 *
 * @param name The name of the component, used for retrieving theme styles and generating static classNames.
 * @param styles The styles object to be processed by `stitches`.
 */
export function createStyles<ComponentParts extends string = string, StyleParams = void>(
  name: string,
  styles:
    | ((
        options: CreateStylesOptions<ComponentParts, StyleParams>
      ) => Record<ComponentParts, SystemStyleObject>)
    | Record<ComponentParts, SystemStyleObject>
) {
  const selector = (part: ComponentParts) => {
    return getComponentPartClassName(name, part);
  };

  const extractBaseStyles = typeof styles === "function" ? styles : () => styles;

  function useStyles(
    params: StyleParams,
    options?: UseStylesOptions<ComponentParts, StyleParams>
  ): UseStylesReturn<ComponentParts> {
    const theme = useTheme();
    const themeStyles = useThemeStyles(name);

    const styles = createMemo(() => {
      const baseStyleObject = extractBaseStyles({
        theme: theme(),
        params,
        selector,
      }) as Record<string, SystemStyleObject>;

      const themeStyleObject = extractStyles(themeStyles(), theme(), params);
      const propStyleObject = extractStyles(options?.styles?.(), theme(), params);

      return Object.fromEntries(
        Object.keys(baseStyleObject).map(key => {
          const mergedStyleObject = mergeWith(
            {},
            options?.unstyled?.() ? {} : baseStyleObject[key],
            themeStyleObject[key] ?? {},
            propStyleObject[key] ?? {}
          );

          return [key, mergedStyleObject];
        })
      ) as Record<ComponentParts, SystemStyleObject>;
    });

    return { styles, selector };
  }

  return useStyles;
}
