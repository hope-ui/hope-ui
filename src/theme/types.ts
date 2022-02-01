import { CSS } from "@stitches/core";

import { ThemeableButtonOptions } from "@/components/Button/Button";
import { ThemeableHeadingOptions } from "@/components/Heading/Heading";
import { ThemeableIconButtonOptions } from "@/components/IconButton/IconButton";
import { ThemeableTagOptions } from "@/components/Tag/Tag";

import { config, theme } from "./stitches.config";

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
 * Style interface based on the stitches configuration.
 */
export type ThemeStyleObject = CSS<typeof config>;

/**
 * Hope UI theme `colors` value type.
 */
export type ColorToken = keyof HopeTheme["colors"];

/**
 * Hope UI theme `space` value type.
 */
export type SpaceToken = keyof HopeTheme["space"];

/**
 * Hope UI theme `sizes` value type.
 */
export type SizeToken = keyof HopeTheme["sizes"];

/**
 * Hope UI theme `fonts` value type.
 */
export type FontToken = keyof HopeTheme["fonts"];

/**
 * Hope UI theme `fontSizes` value type.
 */
export type FontSizeToken = keyof HopeTheme["fontSizes"];

/**
 * Hope UI theme `fontWeights` value type.
 */
export type FontWeightToken = keyof HopeTheme["fontWeights"];

/**
 * Hope UI theme `letterSpacings` value type.
 */
export type LetterSpacingToken = keyof HopeTheme["letterSpacings"];

/**
 * Hope UI theme `lineHeights` value type.
 */
export type LineHeightToken = keyof HopeTheme["lineHeights"];

/**
 * Hope UI theme `radii` value type.
 */
export type RadiiToken = keyof HopeTheme["radii"];

/**
 * Hope UI theme `shadows` value type.
 */
export type ShadowToken = keyof HopeTheme["shadows"];

/**
 * Hope UI theme `zIndices` value type.
 */
export type ZIndiceToken = keyof HopeTheme["zIndices"];

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
export interface ComponentConfig<Props> {
  //baseStyle?: SystemStyleObject;
  defaultProps?: Props;
}

/**
 * Theme configuration for all Hope UI components.
 */
export interface ComponentConfigs {
  Button?: ComponentConfig<ThemeableButtonOptions>;
  IconButton?: ComponentConfig<ThemeableIconButtonOptions>;
  Heading?: ComponentConfig<ThemeableHeadingOptions>;
  Tag?: ComponentConfig<ThemeableTagOptions>;
}

/**
 * Hope UI theme context interface.
 */
export interface HopeThemeContext {
  initialColorMode: ColorMode;
  lightTheme: HopeTheme;
  darkTheme: HopeTheme;
  components: ComponentConfigs;
}

/**
 * The Hope UI theme override interface.
 */
export interface HopeThemeContextConfig {
  initialColorMode?: ColorMode;
  lightTheme?: ThemeConfig;
  darkTheme?: ThemeConfig;
  components?: ComponentConfigs;
}
