import { CSS } from "@stitches/core";

import { ThemeableButtonOptions } from "@/components/Button/Button";
import { ThemeableHeadingOptions } from "@/components/Heading/Heading";
import { ThemeableIconButtonOptions } from "@/components/IconButton/IconButton";
import { ThemeableTagOptions } from "@/components/Tag/Tag";

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
 * Hope UI color mode.
 */
export type ColorMode = "light" | "dark" | "system";

/**
 * Hope UI x-position.
 */
export type XPosition = "left" | "right";

/**
 * Hope UI y-position.
 */
export type YPosition = "top" | "bottom";

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
  Tag?: ComponentThemeConfig<ThemeableTagOptions>;
}

/**
 * The Hope UI theme interface.
 */
export interface HopeTheme {
  initialColorMode: ColorMode;
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
   * Override default color mode.
   */
  initialColorMode?: ColorMode;

  /**
   * Override Hope UI design tokens.
   */
  tokens?: ThemeTokensOverride;
  /**
   * Custom Hope UI components themes configs.
   */
  components?: ComponentThemes;
}

/**
 * Hope UI theme `colors` value type.
 */
export type ColorToken = keyof SystemTokens["colors"];

/**
 * Hope UI theme `space` value type.
 */
export type SpaceToken = keyof SystemTokens["space"];

/**
 * Hope UI theme `sizes` value type.
 */
export type SizeToken = keyof SystemTokens["sizes"];

/**
 * Hope UI theme `fonts` value type.
 */
export type FontToken = keyof SystemTokens["fonts"];

/**
 * Hope UI theme `fontSizes` value type.
 */
export type FontSizeToken = keyof SystemTokens["fontSizes"];

/**
 * Hope UI theme `fontWeights` value type.
 */
export type FontWeightToken = keyof SystemTokens["fontWeights"];

/**
 * Hope UI theme `letterSpacings` value type.
 */
export type LetterSpacingToken = keyof SystemTokens["letterSpacings"];

/**
 * Hope UI theme `lineHeights` value type.
 */
export type LineHeightToken = keyof SystemTokens["lineHeights"];

/**
 * Hope UI theme `radii` value type.
 */
export type RadiiToken = keyof SystemTokens["radii"];

/**
 * Hope UI theme `shadows` value type.
 */
export type ShadowToken = keyof SystemTokens["shadows"];

/**
 * Hope UI theme `zIndices` value type.
 */
export type ZIndiceToken = keyof SystemTokens["zIndices"];
