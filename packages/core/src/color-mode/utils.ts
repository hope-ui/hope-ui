import { isServer } from "solid-js/web";

import { DARK_THEME_CLASS, LIGHT_THEME_CLASS } from "../theme";
import { __DEV__ } from "../utils/assertion";
import { ColorMode, RawColorMode } from "./types";

const COLOR_MODE_STORAGE_KEY = "hope-color-mode";

function getColorModeFromLocalStorage() {
  if (isServer) {
    return null;
  }

  try {
    return localStorage.getItem(COLOR_MODE_STORAGE_KEY) as RawColorMode | null;
  } catch (error) {
    if (__DEV__) {
      console.log(error);
    }

    return null;
  }
}

export function removeColorModeFromLocalStorage() {
  if (isServer) {
    return;
  }

  try {
    return localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
  } catch (error) {
    if (__DEV__) {
      console.log(error);
    }
  }
}

export function saveColorModeToLocalStorage(value: RawColorMode) {
  if (isServer) {
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

/** Get the color mode based on system preference. */
export function getSystemColorMode(): RawColorMode {
  if (isServer) {
    return "light";
  }

  const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return isSystemDark ? "dark" : "light";
}

/** Get the initial color mode based on theme value or system preference. */
export function getInitialColorMode(fallbackColorMode: ColorMode = "system"): RawColorMode {
  const preferredColorMode = getColorModeFromLocalStorage();

  if (preferredColorMode) {
    return preferredColorMode;
  }

  if (fallbackColorMode === "system") {
    return getSystemColorMode();
  }

  return fallbackColorMode;
}

/** Toggle the dark mode class from `document` based on color mode. */
export function toggleDocumentDarkModeClass(colorMode: RawColorMode) {
  if (isServer) {
    return;
  }

  if (colorMode === "dark") {
    document.documentElement.classList.add(DARK_THEME_CLASS);
    document.documentElement.classList.remove(LIGHT_THEME_CLASS);
  } else {
    document.documentElement.classList.add(LIGHT_THEME_CLASS);
    document.documentElement.classList.remove(DARK_THEME_CLASS);
  }
}
