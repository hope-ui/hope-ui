import { ThemeableButtonOptions } from "@/components/Button/Button";
import { ThemeableIconButtonOptions } from "@/components/IconButton/IconButton";

import { ThemeableTextOptions } from "..";
import { defaulThemeTokens } from "../stitches/tokens";
import { SystemStyleObject, SystemTokens } from "../stitches/types";

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
  defaultProps?: Props;
}

/**
 * Theme configuration for all Hope UI components.
 */
export interface ComponentThemes {
  Button?: ComponentThemeConfig<ThemeableButtonOptions>;
  IconButton?: ComponentThemeConfig<ThemeableIconButtonOptions>;
  Heading?: ComponentThemeConfig<ThemeableTextOptions>;
  Text?: ComponentThemeConfig<ThemeableTextOptions>;
}

/**
 * The Hope UI theme interface.
 */
export interface HopeTheme {
  tokens: SystemTokens;
  components: ComponentThemes;
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
  components?: ComponentThemes;
}

export type HopeXPosition = "left" | "right";

export type HopeYPosition = "top" | "bottom";
