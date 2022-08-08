import {
  Accessor,
  createContext,
  createMemo,
  mergeProps,
  onMount,
  ParentProps,
  useContext,
} from "solid-js";

import type { PartialStylesInterpolation, Theme } from "../types";
import { ThemeOverride } from "../types";
import { mergeTheme } from "../utils/merge-theme";
import { cssVariables } from "./css-variables";
import { DEFAULT_THEME } from "./default-theme";
import { globalStyles } from "./global-styles";

const ThemeContext = createContext<Accessor<Theme>>(() => DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeStyles(component?: string): Accessor<PartialStylesInterpolation<any, any>> {
  const theme = useTheme();

  return createMemo(() => {
    if (component == null) {
      return {};
    }

    return theme().components[component]?.styles ?? {};
  });
}

/**
 * Merge component props, theme's default props and fallback/default props into a single props object.
 * @param component The component to look at for default props in the theme.
 * @param defaultProps The fallback/default props.
 * @param props The component props.
 */
export function useComponentDefaultProps<T extends Record<string, any>>(
  component: string,
  defaultProps: Partial<T>,
  props: T
): T {
  const theme = useTheme();

  const themeProps = () => theme().components[component]?.defaultProps ?? {};

  return mergeProps(defaultProps, themeProps, props);
}

export interface ThemeProviderProps extends ParentProps {
  /** The custom theme to use. */
  theme?: ThemeOverride;

  /** Whether Hope UI theme tokens should be added as css variables to `:root`. */
  withCSSVariables?: boolean;

  /** Whether Hope UI global styles should be applied. */
  withGlobalStyles?: boolean;

  /** Whether the theme should inherit from its parent theme. */
  inherit?: boolean;
}

export function ThemeProvider(props: ThemeProviderProps) {
  const parentTheme = useTheme();

  const theme = createMemo(() => {
    const themeOverride = props.inherit ? mergeProps(parentTheme, props.theme) : props.theme;
    return mergeTheme(DEFAULT_THEME, themeOverride);
  });

  onMount(() => {
    props.withGlobalStyles && globalStyles(theme());
    props.withCSSVariables && cssVariables(theme());
  });

  return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}
