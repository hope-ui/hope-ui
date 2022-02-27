/* eslint-disable solid/reactivity */
import { createContext, createEffect, createSignal, PropsWithChildren, useContext } from "solid-js";

import { resetStyles } from "./reset";
import { ColorMode, ComponentsStyleConfigs, HopeContextValue, HopeThemeConfig } from "./types";
import {
  extendBaseTheme,
  getDefaultColorMode,
  saveColorModeToLocalStorage,
  setDocumentColorModeDataTheme,
  syncBodyColorModeClassName,
} from "./utils";

export const HopeContext = createContext<HopeContextValue>();

export type HopeProviderProps = PropsWithChildren<{
  config?: HopeThemeConfig;
}>;

export function HopeProvider(props: HopeProviderProps) {
  // Create themes
  const lightTheme = extendBaseTheme("light", props.config?.lightTheme ?? {});
  const darkTheme = extendBaseTheme("dark", props.config?.darkTheme ?? {});

  // Get default context values
  const defaultColorMode = getDefaultColorMode(props.config?.initialColorMode ?? "light");
  const defaultTheme = defaultColorMode === "dark" ? darkTheme : lightTheme;

  // Create context signals
  const [colorMode, rawSetColorMode] = createSignal(defaultColorMode);
  const [theme, setTheme] = createSignal(defaultTheme);

  const setColorMode = (value: ColorMode) => {
    rawSetColorMode(value);
    saveColorModeToLocalStorage(value);
  };

  const toggleColorMode = () => {
    setColorMode(colorMode() === "light" ? "dark" : "light");
  };

  const context: HopeContextValue = {
    components: props.config?.components ?? {},
    theme,
    colorMode,
    setColorMode,
    toggleColorMode,
  };

  createEffect(() => {
    // When color mode changes, switch theme and update `document.body` theme class.
    const isDark = colorMode() === "dark";

    setTheme(isDark ? darkTheme : lightTheme);
    setDocumentColorModeDataTheme(colorMode());
    syncBodyColorModeClassName(isDark);
  });

  // Apply css reset
  resetStyles();

  return <HopeContext.Provider value={context}>{props.children}</HopeContext.Provider>;
}

/**
 * Custom hook that reads from `HopeProvider` context
 * Returns an accessor for the current used theme.
 */
export function useTheme() {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: useTheme must be used within a HopeProvider");
  }

  return context.theme;
}

/**
 * Custom hook that reads from `HopeProvider` context
 * Returns an accessor for the theme based components style configs.
 */
export function useComponentStyleConfigs(): ComponentsStyleConfigs {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: useComponentStyleConfigs must be used within a HopeProvider");
  }

  return context.components;
}
