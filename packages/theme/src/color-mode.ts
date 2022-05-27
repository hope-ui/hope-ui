import { __DEV__ } from "@hope-ui/utils";
import { isServer } from "solid-js/web";

export type ColorMode = "light" | "dark" | "system";

const hasLocalStorageSupport = () => typeof Storage !== "undefined";

const COLOR_MODE_STORAGE_KEY = "hope-ui-color-mode";

const DARK_MODE_CLASS_NAME = "hope-ui-dark";

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
    if (isServer) {
      return "light";
    }

    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return isSystemDark ? "dark" : "light";
  } else {
    return fallbackValue;
  }
}

/**
 * Toggle the dark theme class from `document.body` based on color mode.
 */
export function toggleBodyDarkModeClass(colorMode: ColorMode) {
  if (isServer) {
    return;
  }

  if (colorMode === "dark") {
    document.body.classList.add(DARK_MODE_CLASS_NAME);
  } else {
    document.body.classList.remove(DARK_MODE_CLASS_NAME);
  }
}
