import { useContext } from "solid-js";
import { isServer } from "solid-js/web";

import { __DEV__ } from "@/utils/assertion";
import { mockBody } from "@/utils/object";

import { HopeContext } from "./provider";
import { ColorMode, HopeContextValue } from "./types";

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

const hasLocalStorageSupport = () => typeof Storage !== "undefined";

const COLOR_MODE_STORAGE_KEY = "hope-ui-color-mode";

/**
 * Theme CSS class name added to `document.body` based on color mode.
 */
export const colorModeClassNames = {
  light: "hope-ui-light",
  dark: "hope-ui-dark",
};

function getColorModeFromLocalStorage() {
  if (!hasLocalStorageSupport()) {
    return null;
  }

  try {
    return localStorage.getItem(COLOR_MODE_STORAGE_KEY) as ColorMode | null;
  } catch (error) {
    if (__DEV__) {
      console.log(error);
    }
    return null;
  }
}

export function saveColorModeToLocalStorage(value: ColorMode) {
  if (!hasLocalStorageSupport()) {
    return;
  }

  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, value);
  } catch (error) {
    if (__DEV__) {
      console.log(error);
    }
  }
}

/**
 * Get the default color mode based on system preference or from local storage.
 * @param fallbackValue Fallback color mode value, if `system` it will be the system color mode.
 * @returns The default color mode to use.
 */
export function getDefaultColorMode(fallbackValue: ColorMode): ColorMode {
  const persistedPreference = getColorModeFromLocalStorage();

  if (persistedPreference) {
    return persistedPreference;
  } else if (fallbackValue === "system") {
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return isSystemDark ? "dark" : "light";
  } else {
    return fallbackValue;
  }
}

/**
 * Function to add/remove class from `document.body` based on color mode.
 */
export function syncBodyColorModeClassName(isDark: boolean) {
  const body = isServer ? mockBody : document.body;

  body.classList.add(isDark ? colorModeClassNames.dark : colorModeClassNames.light);
  body.classList.remove(isDark ? colorModeClassNames.light : colorModeClassNames.dark);
}

/**
 * Function to set `document` [data-theme] attribute based on color mode.
 */
export function setDocumentColorModeDataTheme(colorMode: ColorMode) {
  document.documentElement.setAttribute("data-theme", colorMode);
}
