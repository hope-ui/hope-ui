import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSX,
  PropsWithChildren,
  useContext,
} from "solid-js";

import { ColorMode } from "@/theme/types";
import { noop } from "@/utils/function";

const COLOR_MODE_KEY = "hope-ui-color-mode";

const colorModeClassNames = {
  light: "hope-ui-light",
  dark: "hope-ui-dark",
};

/**
 * Get the default color mode based on system preference or from local storage.
 * @param initialValue Initial color mode value, if not `system` it will be the fallback color mode.
 * @returns The default color mode to use.
 */
function getDefaultColorMode(initialValue: ColorMode) {
  const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const systemPreference = isSystemDark ? "dark" : "light";

  let persistedPreference: ColorMode = systemPreference;

  try {
    persistedPreference = localStorage.getItem(COLOR_MODE_KEY) as ColorMode;
  } catch (error) {
    console.warn(
      "[Hope UI]: localStorage is not available. Color mode persistence might not work as expected"
    );
  }

  if (persistedPreference) {
    return persistedPreference;
  } else if (initialValue === "system") {
    return systemPreference;
  } else {
    return initialValue;
  }
}

export interface ColorModeContextValue {
  colorMode: Accessor<ColorMode>;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextValue>();

export type ColorModeProviderProps = PropsWithChildren<{
  initialColorMode: ColorMode;
}>;

export function ColorModeProvider(props: ColorModeProviderProps) {
  // eslint-disable-next-line solid/reactivity
  const defaultColorMode = getDefaultColorMode(props.initialColorMode);

  const [colorMode, rawSetColorMode] = createSignal(defaultColorMode);

  const setColorMode = (value: ColorMode) => {
    rawSetColorMode(value);

    try {
      localStorage.setItem(COLOR_MODE_KEY, value);
    } catch (error) {
      console.warn(
        "[Hope UI]: localStorage is not available. Color mode persistence might not work as expected"
      );
    }
  };

  const toggleColorMode = () => {
    setColorMode(colorMode() === "light" ? "dark" : "light");
  };

  const context: ColorModeContextValue = {
    colorMode,
    setColorMode,
    toggleColorMode,
  };

  createEffect(() => {
    const isDark = colorMode() === "dark";

    // Add proper Hope UI class when color mode change
    document.body.classList.add(isDark ? colorModeClassNames.dark : colorModeClassNames.light);
    document.body.classList.remove(isDark ? colorModeClassNames.light : colorModeClassNames.dark);
  });

  return <ColorModeContext.Provider value={context}>{props.children}</ColorModeContext.Provider>;
}

/**
 * Locks the color mode to `light` without any way to change it.
 */
export function LightMode(props: { children?: JSX.Element }) {
  const [colorMode] = createSignal<ColorMode>("light");

  const context: ColorModeContextValue = {
    colorMode,
    setColorMode: noop,
    toggleColorMode: noop,
  };

  return <ColorModeContext.Provider value={context}>{props.children}</ColorModeContext.Provider>;
}

/**
 * Locks the color mode to `dark` without any way to change it.
 */
export function DarkMode(props: { children?: JSX.Element }) {
  const [colorMode] = createSignal<ColorMode>("dark");

  const context: ColorModeContextValue = {
    colorMode,
    setColorMode: noop,
    toggleColorMode: noop,
  };

  return <ColorModeContext.Provider value={context}>{props.children}</ColorModeContext.Provider>;
}

/**
 * Custom hook that reads from `ColorModeProvider` context
 * Returns the color mode and function to toggle it
 */
export function useColorMode() {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error("[Hope UI]: useColorMode must be used within a ColorModeProvider");
  }

  return context;
}

/**
 * Change value based on color mode.
 *
 * @param light the light mode value
 * @param dark the dark mode value
 * @return A derived signal based on the color mode.
 */
export function useColorModeValue<TLight = unknown, TDark = unknown>(light: TLight, dark: TDark) {
  const { colorMode } = useColorMode();
  return () => {
    return colorMode() === "dark" ? dark : light;
  };
}
