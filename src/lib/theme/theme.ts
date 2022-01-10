import merge from "lodash.merge";

import { ThemableButtonOptions } from "../components/Button/Button";

export interface ThemableColor {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ThemableColorPalette {
  primary?: ThemableColor;
  dark?: ThemableColor;
  neutral?: ThemableColor;
  success?: ThemableColor;
  info?: ThemableColor;
  warning?: ThemableColor;
  danger?: ThemableColor;
}

export interface ThemableComponents {
  Button?: ThemableButtonOptions;
}

export interface Theme {
  colors?: ThemableColorPalette;
  components?: ThemableComponents;
}

const defaultColorPalette: Required<ThemableColorPalette> = {
  primary: {
    50: "#e7f5ff",
    100: "#d0ebff",
    200: "#a5d8ff",
    300: "#74c0fc",
    400: "#4dabf7",
    500: "#339af0",
    600: "#228be6",
    700: "#1c7ed6",
    800: "#1971c2",
    900: "#1864ab",
  },
  dark: {
    50: "#c1c2c5",
    100: "#a6a7ab",
    200: "#909296",
    300: "#5c5f66",
    400: "#373a40",
    500: "#2c2e33",
    600: "#25262b",
    700: "#1a1b1e",
    800: "#141517",
    900: "#101113",
  },
  neutral: {
    50: "#f8f9fa",
    100: "#f1f3f5",
    200: "#e9ecef",
    300: "#dee2e6",
    400: "#ced4da",
    500: "#adb5bd",
    600: "#868e96",
    700: "#495057",
    800: "#343a40",
    900: "#212529",
  },
  success: {
    50: "#ebfbee",
    100: "#d3f9d8",
    200: "#b2f2bb",
    300: "#8ce99a",
    400: "#69db7c",
    500: "#51cf66",
    600: "#40c057",
    700: "#37b24d",
    800: "#2f9e44",
    900: "#2b8a3e",
  },
  info: {
    50: "#e7f5ff",
    100: "#d0ebff",
    200: "#a5d8ff",
    300: "#74c0fc",
    400: "#4dabf7",
    500: "#339af0",
    600: "#228be6",
    700: "#1c7ed6",
    800: "#1971c2",
    900: "#1864ab",
  },
  warning: {
    50: "#fff9db",
    100: "#fff3bf",
    200: "#ffec99",
    300: "#ffe066",
    400: "#ffd43b",
    500: "#fcc419",
    600: "#fab005",
    700: "#f59f00",
    800: "#f08c00",
    900: "#e67700",
  },
  danger: {
    50: "#fff5f5",
    100: "#ffe3e3",
    200: "#ffc9c9",
    300: "#ffa8a8",
    400: "#ff8787",
    500: "#ff6b6b",
    600: "#fa5252",
    700: "#f03e3e",
    800: "#e03131",
    900: "#c92a2a",
  },
};

export const defaultTheme: Theme = {
  colors: defaultColorPalette,
};

export function extendTheme(themeOverride: Theme): Theme {
  return merge(defaultTheme, themeOverride);
}

export function setColorsCSSVariables(colors: ThemableColorPalette = defaultColorPalette) {
  const root = document.documentElement;

  for (const [colorKey, colorValue] of Object.entries(colors)) {
    for (const [key, value] of Object.entries(colorValue as ThemableColor)) {
      root.style.setProperty(`--ui-color-${colorKey}-${key}`, value);
    }
  }
}
