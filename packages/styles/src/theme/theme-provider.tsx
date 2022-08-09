import { Accessor, createContext, createMemo, mergeProps, ParentProps, useContext } from "solid-js";

import type { PartialStylesInterpolation, Theme } from "../types";
import { ThemeOverride } from "../types";
import { mergeTheme } from "../utils/merge-theme";
import { cssVariables } from "./css-variables";
import { DEFAULT_THEME } from "./default-theme";
import { globalStyles } from "./global-styles";

const ThemeContext = createContext<Theme>(DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeStyles(component?: string): Accessor<PartialStylesInterpolation<any, any>> {
  const theme = useTheme();

  return createMemo(() => {
    if (component == null) {
      return {};
    }

    return theme.components[component]?.styles ?? {};
  });
}

interface MergeWithThemePropsParams<T extends Record<string, any>> {
  /** The name of the component to look for in the theme. */
  name: string;

  /** The default props, will be overridden by theme and component props. */
  defaultProps: Partial<T>;

  /** The component `props` object. */
  props: T;
}

/**
 * Merge default, theme and component props into a single props object.
 * @example
 * // mergedProps = defaultProps <== themeProps <== props
 */
export function mergeThemeProps<T extends Record<string, any>>(
  params: MergeWithThemePropsParams<T>
): T {
  const theme = useTheme();

  const themeProps = () => theme.components[params.name]?.defaultProps ?? {};

  return mergeProps(params.defaultProps, themeProps, params.props);
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
