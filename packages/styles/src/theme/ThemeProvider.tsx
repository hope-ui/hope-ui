import { Accessor, createContext, createMemo, mergeProps, ParentProps, useContext } from "solid-js";

import type { CSSObject, HopeTheme, HopeThemeOverride } from "../types";
import { mergeThemeWithFunctions } from "../utils/mergeTheme";
import { DEFAULT_THEME } from "./defaultTheme";

export interface ThemeProviderStyles {
  classNames: Record<string, string>;
  styles:
    | Record<string, CSSObject>
    | ((theme: HopeTheme, params: any) => Record<string, CSSObject>);
}

interface ThemeProviderContextType {
  theme: Accessor<HopeTheme>;
}

const ThemeProviderContext = createContext<ThemeProviderContextType>({
  theme: () => DEFAULT_THEME,
});

export function useTheme() {
  return useContext(ThemeProviderContext).theme;
}

export function useThemeProviderStyles(component?: string | string[]) {
  const theme = useTheme();

  const getStyles = (name?: string): ThemeProviderStyles => {
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
  theme?: HopeThemeOverride;
  inherit?: boolean;
}

export function ThemeProvider(props: ThemeProviderProps) {
  const ctx = useContext(ThemeProviderContext);

  const theme = createMemo(() => {
    const themeOverride = props.inherit ? mergeProps(ctx.theme, props.theme) : props.theme;
    return mergeThemeWithFunctions(DEFAULT_THEME, themeOverride);
  });

  return (
    <ThemeProviderContext.Provider value={{ theme }}>
      {props.children}
    </ThemeProviderContext.Provider>
  );
}
