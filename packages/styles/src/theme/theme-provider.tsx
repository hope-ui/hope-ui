import { Accessor, createContext, createMemo, mergeProps, ParentProps, useContext } from "solid-js";

import type { RecipeConfigInterpolation, Theme } from "../types";
import { ThemeOverride } from "../types";
import { mergeTheme } from "../utils/merge-theme";
import { cssVariables } from "./css-variables";
import { DEFAULT_THEME } from "./default-theme";
import { globalStyles } from "./global-styles";

const ThemeContext = createContext<Theme>(DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeStyles(
  component?: string
): Accessor<RecipeConfigInterpolation<any, any, any> | undefined> {
  const theme = useTheme();

  return createMemo(() => {
    if (component == null) {
      return;
    }

    return theme.components[component]?.styles;
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
export function mergeWithThemeProps<T extends Record<string, any>>(
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
  theme?: ThemeOverride;

  /** Whether Hope UI theme tokens should be added as css variables to `:root`. */
  withCSSVariables?: boolean;

  /** Whether Hope UI global styles should be applied. */
  withGlobalStyles?: boolean;
}

export function ThemeProvider(props: ThemeProviderProps) {
  // We don't care about reactivity here, theme is set once and isn't intended to be dynamic.
  const theme = mergeTheme(DEFAULT_THEME, props.theme);

  props.withGlobalStyles && globalStyles(theme);
  props.withCSSVariables && cssVariables(theme);

  return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}
