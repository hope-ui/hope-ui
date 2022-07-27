import { Accessor, createContext, createMemo, JSX, mergeProps, useContext } from "solid-js";

import type { CSSObject, HopeTheme, HopeThemeOverride } from "../types";
import { mergeThemeWithFunctions } from "../utils/mergeTheme";
import { DEFAULT_THEME } from "./defaultTheme";

export interface HopeProviderStyles {
  classNames: Record<string, string>;
  styles:
    | Record<string, CSSObject>
    | ((theme: HopeTheme, params: any) => Record<string, CSSObject>);
}

interface HopeProviderContextValue {
  theme: Accessor<HopeTheme>;
}

const HopeProviderContext = createContext<HopeProviderContextValue>({
  theme: () => DEFAULT_THEME,
});

export function useHopeTheme() {
  return useContext(HopeProviderContext).theme;
}

export function useHopeProviderStyles(component?: string | string[]) {
  const theme = useHopeTheme();

  const getStyles = (name?: string): HopeProviderStyles => {
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
  const theme = useHopeTheme();

  const themeProps = createMemo(() => theme().components[component]?.defaultProps);

  return mergeProps(defaultProps, themeProps, props);
}

export interface HopeProviderProps {
  theme?: HopeThemeOverride;
  children?: JSX.Element;
  inherit?: boolean;
}

export function HopeProvider(props: HopeProviderProps) {
  const ctx = useContext(HopeProviderContext);

  const theme = createMemo(() => {
    const themeOverride = props.inherit ? { ...ctx.theme(), ...props.theme } : props.theme;
    return mergeThemeWithFunctions(DEFAULT_THEME, themeOverride);
  });

  return (
    <HopeProviderContext.Provider value={{ theme }}>{props.children}</HopeProviderContext.Provider>
  );
}
