/* eslint-disable solid/reactivity */
import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  PropsWithChildren,
  useContext,
} from "solid-js";

import { resetStyles } from "./reset";
import { ColorMode, HopeTheme, HopeThemeConfig } from "./types";
import {
  extendBaseTheme,
  getDefaultColorMode,
  saveColorModeToLocalStorage,
  syncBodyColorModeClassName,
} from "./utils";

interface HopeContextValue {
  theme: Accessor<HopeTheme>;
  colorMode: Accessor<ColorMode>;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;
}

export const HopeContext = createContext<HopeContextValue>();

export type HopeProviderProps = PropsWithChildren<{
  theme?: HopeThemeConfig;
}>;

export function HopeProvider(props: HopeProviderProps) {
  // Create themes
  const lightTheme = extendBaseTheme(props.theme?.lightTheme ?? {}, false);
  const darkTheme = extendBaseTheme(props.theme?.darkTheme ?? {}, true);

  // Get default context values
  const defaultColorMode = getDefaultColorMode(props.theme?.initialColorMode ?? "light");
  const defaultTheme = defaultColorMode === "dark" ? darkTheme : lightTheme;

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
    theme,
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

export function useTheme() {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: useTheme must be used within a HopeProvider");
  }

  return context.theme;
}

/**
 * Custom hook that reads from `HopeProvider` context
 * Returns the color mode and function to toggle it
 */
export function useColorMode() {
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
export function useColorModeValue<T = unknown>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return () => (colorMode() === "dark" ? dark : light);
}
