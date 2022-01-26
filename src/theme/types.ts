import { ThemeableButtonOptions } from "@/components/Button/Button";
import { ThemeableIconButtonOptions } from "@/components/IconButton/IconButton";
import { ThemeableTextOptions } from "..";

import { defaulThemeTokens } from "../stitches/tokens";
import { SystemStyleObject, SystemTokens } from "../stitches/types";

/**
 * Utility type to deeply apply the Partial type.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * Theme configuration for Hope UI component.
 */
export interface ComponentThemeConfig<Props> {
  /**
   * Base style passed to the component.
   */
  baseStyle?: SystemStyleObject;
  /**
   * Default props passed to the component.
   */
  defaultProps: Required<Props>;
}

/**
 * Theme configuration for all Hope UI components.
 */
export interface ComponentsThemes {
  Button: ComponentThemeConfig<ThemeableButtonOptions>;
  IconButton: ComponentThemeConfig<ThemeableIconButtonOptions>;
  Text: ComponentThemeConfig<ThemeableTextOptions>;
}

/**
 * The Hope UI theme interface.
 */
export interface HopeTheme {
  tokens: SystemTokens;
  components: ComponentsThemes;
}

/**
 * The Hope UI theme tokens override interface.
 */
export type ThemeTokensOverride = {
  [Scale in keyof typeof defaulThemeTokens]?: {
    [Token in keyof typeof defaulThemeTokens[Scale]]?: boolean | number | string;
  };
} & {
  [scale in string]: {
    [token in number | string]: boolean | number | string;
  };
};

/**
 * The Hope UI theme override interface.
 */
export interface HopeThemeOverride {
  /**
   * Override Hope UI design tokens.
   */
  tokens?: ThemeTokensOverride;
  /**
   * Custom Hope UI components themes configs.
   */
  components?: DeepPartial<ComponentsThemes>;
}

export type HopeXPosition = "left" | "right";

export type HopeYPosition = "top" | "bottom";
