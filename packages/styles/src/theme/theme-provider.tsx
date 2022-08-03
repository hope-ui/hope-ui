import { Accessor, createContext, createMemo, mergeProps, ParentProps, useContext } from "solid-js";

import type { ComponentTheme, Theme } from "../types";
import { ThemeOverride } from "../types";
import { mergeTheme } from "../utils/merge-theme";
import { DEFAULT_THEME } from "./default-theme";

const ThemeContext = createContext<Accessor<Theme>>(() => DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

export function useComponentTheme(component?: string): Accessor<ComponentTheme | null> {
  const theme = useTheme();

  return createMemo(() => {
    if (component == null) {
      return null;
    }

    return theme().components[component] ?? null;
  });
}

export function useComponentDefaultProps<T extends Record<string, any>>(
  component: string,
  defaultProps: Partial<T>,
  props: T
): T {
  const themeProps = () => useComponentTheme(component)()?.defaultProps ?? {};

  return mergeProps(defaultProps, themeProps, props);
}

export interface ThemeProviderProps extends ParentProps {
  theme?: ThemeOverride;
  inherit?: boolean;
}

export function ThemeProvider(props: ThemeProviderProps) {
  const parentTheme = useTheme();

  const theme = createMemo(() => {
    const themeOverride = props.inherit ? mergeProps(parentTheme, props.theme) : props.theme;
    return mergeTheme(DEFAULT_THEME, themeOverride);
  });

  return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}
