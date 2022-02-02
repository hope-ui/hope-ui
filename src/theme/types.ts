import { theme } from "@/styled-system/stitches.config";

/**
 * Hope UI - Stitches theme interface.
 */
export type HopeTheme = typeof theme;

/**
 * Stitches theme config interface.
 */
export type ThemeConfig = {
  [Scale in keyof HopeTheme]?: {
    [Token in keyof HopeTheme[Scale]]?: boolean | number | string;
  };
} & {
  [scale in string]: {
    [token in number | string]: boolean | number | string;
  };
};

export type ColorMode = "light" | "dark" | "system";

/**
 * Hope UI theme override configuration.
 */
export interface HopeThemeConfig {
  initialColorMode?: ColorMode;
  lightTheme?: ThemeConfig;
  darkTheme?: ThemeConfig;
}
