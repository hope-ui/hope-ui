import { createContext, createMemo, mergeProps, ParentProps, useContext } from "solid-js";

import type { RecipeConfigInterpolation, Theme } from "../types";
import { ThemeOverride } from "../types";
import { createDefaultColors } from "./create-default-colors";
import { DEFAULT_THEME } from "./default-theme";
import { injectCSSVars } from "./inject-css-vars";
import { injectGlobalStyles } from "./inject-global-styles";
import { mergeTheme } from "./merge-theme";

const ThemeContext = createContext<Theme>(DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeStyles(component?: string) {
  const theme = useTheme();

  return createMemo(() => {
    if (component == null) {
      return undefined;
    }

    return theme.components[component]?.styles as
      | RecipeConfigInterpolation<any, any, any>
      | undefined;
  });
}

/**
 * Merge default, theme and component props into a single props object.
 * @param name The name of the component to look for in the theme.
 * @param defaultProps The default props, will be overridden by theme and component props.
 * @param props The component `props` object.
 * @example
 * // mergedProps = defaultProps <== themeProps <== props
 */
export function mergeThemeProps<T extends Record<string, any>>(
  name: string,
  defaultProps: Partial<T>,
  props: T
): T {
  const theme = useTheme();

  const themeProps = () => theme.components[name]?.defaultProps ?? {};

  return mergeProps(defaultProps, themeProps, props);
}

export interface ThemeProviderProps extends ParentProps {
  /** The custom theme to use. */
  theme?: Theme;

  /** Whether Hope UI global styles should be applied. */
  withGlobalStyles?: boolean;
}

export function ThemeProvider(props: ThemeProviderProps) {
  // We don't care about reactivity here since theme is not intended to be dynamic, it should be set once.
  const theme = props.theme ?? DEFAULT_THEME;

  injectCSSVars(theme);
  props.withGlobalStyles && injectGlobalStyles(theme);

  return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}

export function extendTheme(themeOverride: ThemeOverride): Theme {
  let finalDefaultTheme = DEFAULT_THEME;

  // Need to recreate colors if user has set a custom css var prefix,
  // so global variants css variables reference is correct.
  if (themeOverride.cssVarPrefix != null) {
    finalDefaultTheme = {
      ...DEFAULT_THEME,
      colors: createDefaultColors(themeOverride.cssVarPrefix),
    };
  }

  return mergeTheme(finalDefaultTheme, themeOverride);
}
