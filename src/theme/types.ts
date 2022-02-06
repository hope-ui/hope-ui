import { Accessor } from "solid-js";

import { ThemeableAlertOptions } from "@/components/alert/alert";
import { ThemeableButtonOptions } from "@/components/button/button";
import { ThemeableIconButtonOptions } from "@/components/icon-button/icon-button";
import { ThemeableInputOptions } from "@/components/input/input";
import { ThemeableTagOptions } from "@/components/tag/tag";
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
export interface ComponentStyle<Props> {
  /**
   * Style object for base or default style
   */
  baseStyle?: SystemStyleObject;

  /**
   * Default component props values.
   */
  defaultProps?: Props;
}

export interface ComponentsStyles {
  Alert?: ComponentStyle<ThemeableAlertOptions>;
  Button?: ComponentStyle<ThemeableButtonOptions>;
  IconButton?: ComponentStyle<ThemeableIconButtonOptions>;
  Input?: ComponentStyle<ThemeableInputOptions>;
  Heading?: ComponentStyle<void>;
  Text?: ComponentStyle<void>;
  Tag?: ComponentStyle<ThemeableTagOptions>;
}

/**
 * Hope UI theme override configuration.
 */
export interface HopeThemeConfig<T extends ThemeConfig> {
  initialColorMode?: ColorMode;
  lightTheme?: T;
  darkTheme?: T;
  components?: ComponentsStyles;
}

export interface HopeContextValue<T extends HopeTheme = HopeTheme> {
  theme: Accessor<T>;
  components: ComponentsStyles;
  colorMode: Accessor<ColorMode>;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;
}
