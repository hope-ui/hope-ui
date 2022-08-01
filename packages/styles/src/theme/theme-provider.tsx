import { Accessor, createContext, createMemo, mergeProps, ParentProps, useContext } from "solid-js";

import type { CSSObject, Theme, ThemeOverride } from "../types";
import { mergeThemeWithMetadata } from "../utils/merge-theme";
import { DEFAULT_THEME } from "./default-theme";

export interface ThemeStylesObject {
  classNames: Record<string, string>;
  styles: Record<string, CSSObject> | ((theme: Theme, variants: any) => Record<string, CSSObject>);
}

const ThemeContext = createContext<Accessor<Theme>>(() => DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeStyles(component?: string | string[]) {
  const theme = useTheme();

  const getStyles = (name?: string): ThemeStylesObject => {
    if (name == null) {
      return { styles: {}, classNames: {} };
    }

    const componentTheme = theme().components[name];

    return {
      styles: componentTheme?.styles ?? {},
      classNames: componentTheme?.classNames ?? {},
    };
  };

  return createMemo(() => {
    return Array.isArray(component) ? component.map(getStyles) : [getStyles(component)];
  });
}

export function useComponentDefaultProps<T extends Record<string, any>>(
  component: string,
  defaultProps: Partial<T>,
  props: T
): T {
  const theme = useTheme();

  const themeProps = createMemo(() => theme().components[component]?.defaultProps);

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
    return mergeThemeWithMetadata(DEFAULT_THEME, themeOverride);
  });

  return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}
