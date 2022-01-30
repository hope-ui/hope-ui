import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  PropsWithChildren,
  useContext,
} from "solid-js";

import {
  getDefaultColorMode,
  saveColorModeToLocalStorage,
  syncBodyColorModeClassName,
} from "@/color-mode/colorMode.utils";
import { ColorMode } from "@/theme/types";

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
    saveColorModeToLocalStorage(value);
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
    syncBodyColorModeClassName(colorMode() === "dark");
  });

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
export function useColorModeValue<T = unknown>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return () => (colorMode() === "dark" ? dark : light);
}
