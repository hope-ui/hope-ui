import { isServer } from "solid-js/web";

import { themeClassNames } from "@/theme/stitches.config";
import { ColorMode } from "@/theme/types";
import { __DEV__ } from "@/utils/assertion";
import { mockBody } from "@/utils/object";

const hasLocalStorageSupport = () => typeof Storage !== "undefined";

const COLOR_MODE_STORAGE_KEY = "hope-ui-color-mode";

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
 * @param initialValue Initial color mode value, if not `system` it will be the fallback color mode.
 * @returns The default color mode to use.
 */
export function getDefaultColorMode(initialValue: ColorMode) {
  const persistedPreference = getColorModeFromLocalStorage();

  if (persistedPreference) {
    return persistedPreference;
  } else if (initialValue === "system") {
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return isSystemDark ? "dark" : "light";
  } else {
    return initialValue;
  }
}

/**
 * Function to add/remove class from `body` based on color mode.
 */
export function syncBodyColorModeClassName(isDark: boolean) {
  const body = isServer ? mockBody : document.body;

  body.classList.add(isDark ? themeClassNames.dark : themeClassNames.light);
  body.classList.remove(isDark ? themeClassNames.light : themeClassNames.dark);
}
