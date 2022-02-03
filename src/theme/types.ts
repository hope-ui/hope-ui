import { Accessor } from "solid-js";

import { theme } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system/types";

export type ColorMode = "light" | "dark" | "system";

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

/**
 * Theme configuration for Hope UI component.
 */
export interface ComponentConfig<Props> {
  baseStyle?: SystemStyleObject;
  defaultProps?: Props;
}

/**
 * Theme configuration for all Hope UI components.
 */
export interface ComponentsConfigs {
  // Button?: ComponentConfig<ThemeableButtonOptions>;
  // IconButton?: ComponentConfig<ThemeableIconButtonOptions>;
  Heading?: ComponentConfig<void>;
  // Tag?: ComponentConfig<ThemeableTagOptions>;
}

/**
 * Hope UI theme override configuration.
 */
export interface HopeThemeConfig {
  initialColorMode?: ColorMode;
  lightTheme?: ThemeConfig;
  darkTheme?: ThemeConfig;
  components?: ComponentsConfigs;
}

export interface HopeContextValue {
  theme: Accessor<HopeTheme>;
  components: ComponentsConfigs;
  colorMode: Accessor<ColorMode>;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;
}
