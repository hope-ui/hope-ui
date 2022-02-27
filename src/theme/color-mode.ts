import { useContext } from "solid-js";

import { HopeContext } from "./provider";
import { HopeContextValue } from "./types";

/**
 * Custom hook that reads from `HopeProvider` context
 * Returns an accessor for the color mode and function to toggle it
 */
export function useColorMode(): Pick<HopeContextValue, "colorMode" | "setColorMode" | "toggleColorMode"> {
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
