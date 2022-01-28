import { CSS } from "@stitches/core";

import { ThemeableButtonOptions } from "@/components/Button/Button";
import { ThemeableHeadingOptions } from "@/components/Heading/Heading";
import { ThemeableIconButtonOptions } from "@/components/IconButton/IconButton";

import { config, theme } from "./stitches.config";
import { defaulThemeTokens } from "./tokens";

/**
 * Design tokens interface based on the stitches theme.
 */
export type SystemTokens = typeof theme;

/**
 * Media at-rules interface based on the stitches media.
 */
export type SystemMedia = typeof config.media;

/**
 * Style interface based on the stitches configuration.
 */
export type SystemStyleObject = CSS<typeof config>;

/**
 * Theme configuration for Hope UI component.
 */
export interface ComponentThemeConfig<Props> {
  /**
   * Base style passed to the component.
   */
  //baseStyle?: SystemStyleObject;
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
  Heading?: ComponentThemeConfig<ThemeableHeadingOptions>;
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
