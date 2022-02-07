/* eslint-disable solid/reactivity */
import { createContext, createEffect, createSignal, PropsWithChildren, useContext } from "solid-js";

import { ThemeConfig } from ".";
import { resetStyles } from "./reset";
import { ColorMode, HopeContextValue, HopeThemeConfig } from "./types";
import {
  extendBaseTheme,
  getDefaultColorMode,
  saveColorModeToLocalStorage,
  syncBodyColorModeClassName,
} from "./utils";

export const HopeContext = createContext<HopeContextValue>();

export type HopeProviderProps<T extends ThemeConfig> = PropsWithChildren<{
  theme?: HopeThemeConfig<T>;
}>;

export function HopeProvider<T extends ThemeConfig>(props: HopeProviderProps<T>) {
  // Create themes
  const lightTheme = extendBaseTheme("light", props.theme?.lightTheme ?? {});
  const darkTheme = extendBaseTheme("dark", props.theme?.darkTheme ?? {});

  // Get default context values
  const defaultColorMode = getDefaultColorMode(props.theme?.initialColorMode ?? "light");
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

  const context: HopeContextValue<typeof lightTheme> = {
    theme,
    components: props.theme?.components ?? {},
    colorMode,
    setColorMode,
    toggleColorMode,
  };

  createEffect(() => {
    // When color mode changes, switch theme and update `document.body` theme class.
    const isDark = colorMode() === "dark";

    setTheme(isDark ? darkTheme : lightTheme);
    syncBodyColorModeClassName(isDark);
  });

  // Apply css reset
  resetStyles();

  return <HopeContext.Provider value={context}>{props.children}</HopeContext.Provider>;
}

/**
 * Custom hook that reads from `HopeProvider` context
 * Returns the current used theme and components configs.
 */
export function useTheme(): Pick<HopeContextValue, "theme" | "components"> {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: useTheme must be used within a HopeProvider");
  }

  return {
    theme: context.theme,
    components: context.components,
  };
}

/**
 * Custom hook that reads from `HopeProvider` context
 * Returns the color mode and function to toggle it
 */
export function useColorMode(): Pick<
  HopeContextValue,
  "colorMode" | "setColorMode" | "toggleColorMode"
> {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: useColorMode must be used within a HopeProvider");
  }

  return {
    colorMode: context.colorMode,
    setColorMode: context.setColorMode,
    toggleColorMode: context.toggleColorMode,
  };
}

/**
 * Change value based on color mode.
 *
 * @param light the light mode value
 * @param dark the dark mode value
 * @return A derived signal based on the color mode.
 */
export function useColorModeValue<T = any>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return () => (colorMode() === "dark" ? dark : light);
}
