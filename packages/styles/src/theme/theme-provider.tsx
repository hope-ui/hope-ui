import { Accessor, createContext, createMemo, mergeProps, ParentProps, useContext } from "solid-js";

import type { Styles, Theme } from "../types";
import { ThemeOverride } from "../types";
import { mergeTheme } from "../utils/merge-theme";
import { DEFAULT_THEME } from "./default-theme";

const ThemeContext = createContext<Accessor<Theme>>(() => DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeStyles(componentName?: string): Accessor<Styles<string, any>> {
  const theme = useTheme();

  return createMemo(() => {
    if (componentName == null) {
      return {};
    }

    return theme().components[componentName]?.styles ?? {};
  });
}

export function useComponentDefaultProps<T extends Record<string, any>>(
  componentName: string,
  defaultProps: Partial<T>,
  props: T
): T {
  const theme = useTheme();

  const themeProps = () => theme().components[componentName]?.defaultProps ?? {};

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
