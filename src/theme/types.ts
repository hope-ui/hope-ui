import { CSS } from "@stitches/core";

import { ThemeableButtonOptions } from "@/components/Button/Button";
import { ThemeableHeadingOptions } from "@/components/Heading/Heading";
import { ThemeableIconButtonOptions } from "@/components/IconButton/IconButton";
import { ThemeableTagOptions } from "@/components/Tag/Tag";

import { baseTheme, config } from "./stitches.config";

/**
 * Hope UI design tokens based on the stitches theme.
 */
export type ThemeTokens = typeof baseTheme;

/**
 * Media at-rules interface based on the stitches media.
 */
export type ThemeMedia = typeof config.media;

/**
 * Style interface based on the stitches configuration.
 */
export type ThemeStyleObject = CSS<typeof config>;

/**
 * Hope UI theme `colors` value type.
 */
export type ColorToken = keyof ThemeTokens["colors"];

/**
 * Hope UI theme `space` value type.
 */
export type SpaceToken = keyof ThemeTokens["space"];

/**
 * Hope UI theme `sizes` value type.
 */
export type SizeToken = keyof ThemeTokens["sizes"];

/**
 * Hope UI theme `fonts` value type.
 */
export type FontToken = keyof ThemeTokens["fonts"];

/**
 * Hope UI theme `fontSizes` value type.
 */
export type FontSizeToken = keyof ThemeTokens["fontSizes"];

/**
 * Hope UI theme `fontWeights` value type.
 */
export type FontWeightToken = keyof ThemeTokens["fontWeights"];

/**
 * Hope UI theme `letterSpacings` value type.
 */
export type LetterSpacingToken = keyof ThemeTokens["letterSpacings"];

/**
 * Hope UI theme `lineHeights` value type.
 */
export type LineHeightToken = keyof ThemeTokens["lineHeights"];

/**
 * Hope UI theme `radii` value type.
 */
export type RadiiToken = keyof ThemeTokens["radii"];

/**
 * Hope UI theme `shadows` value type.
 */
export type ShadowToken = keyof ThemeTokens["shadows"];

/**
 * Hope UI theme `zIndices` value type.
 */
export type ZIndiceToken = keyof ThemeTokens["zIndices"];

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
export interface ComponentThemeConfigs {
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
  light: string;
  dark: string;
  components: ComponentThemeConfigs;
}

/**
 * The Hope UI theme tokens override interface.
 */
export type ThemeTokensOverride = {
  [Scale in keyof ThemeTokens]?: {
    [Token in keyof ThemeTokens[Scale]]?: boolean | number | string;
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
   * Override initial color mode.
   */
  initialColorMode?: ColorMode;

  /**
   * Override Hope UI light theme.
   */
  light?: ThemeTokensOverride;

  /**
   * Override Hope UI dark theme.
   */
  dark?: ThemeTokensOverride;

  /**
   * Override Hope UI components theme config.
   */
  components?: ComponentThemeConfigs;
}
