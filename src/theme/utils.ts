import merge from "lodash.merge";
import { isServer } from "solid-js/web";

import { createTheme, theme } from "@/styled-system/stitches.config";
import { baseDarkThemeTokens } from "@/styled-system/tokens";
import { __DEV__ } from "@/utils/assertion";
import { mockBody } from "@/utils/object";

import { ColorMode, HopeTheme, ThemeConfig } from "./types";

/**
 * Theme CSS class name added to `document.body` based on color mode.
 */
const classNames = {
  light: "hope-ui-light",
  dark: "hope-ui-dark",
};

/**
 * [Internal]
 * Create new stitches dark or light theme.
 * @return a merged theme object containing the base stitches theme and the overrided values.
 */
export function extendBaseTheme(themeConfig: ThemeConfig, isDark: boolean): HopeTheme {
  const className = isDark ? classNames.dark : classNames.light;

  // If dark theme, we need to add base dark theme tokens which is not present in the base theme.
  const finalConfig = isDark ? merge({}, baseDarkThemeTokens, themeConfig) : themeConfig;

  const customTheme = createTheme(className, finalConfig);

  return merge({}, theme, customTheme);
}

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
 * @param fallbackValue Fallback color mode value, if `system` it will be the system color mode.
 * @returns The default color mode to use.
 */
export function getDefaultColorMode(fallbackValue: ColorMode) {
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

  body.classList.add(isDark ? classNames.dark : classNames.light);
  body.classList.remove(isDark ? classNames.light : classNames.dark);
}
