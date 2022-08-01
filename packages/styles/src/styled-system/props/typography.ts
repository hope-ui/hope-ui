import { Property } from "csstype";

import {
  KeysOf,
  ThemeFontFamily,
  ThemeFontSize,
  ThemeFontWeight,
  ThemeLetterSpacing,
  ThemeLineHeight,
} from "../../types";
import { ResponsiveProps } from "./responsive-value";

export type TypographyProps = ResponsiveProps<{
  /** The CSS `font-family` property. */
  fontFamily: Property.FontFamily | ThemeFontFamily;

  /** The CSS `font-size` property. */
  fontSize: Property.FontSize<ThemeFontSize> | number;

  /** The CSS `font-weight` property. */
  fontWeight: Property.FontWeight | ThemeFontWeight | number;

  /** The CSS `line-height` property. */
  lineHeight: Property.LineHeight<ThemeLineHeight> | string | number;

  /** The CSS `letter-spacing` property. */
  letterSpacing: Property.LetterSpacing<ThemeLetterSpacing> | string | number;

  /** The CSS `text-align` property. */
  textAlign: Property.TextAlign;

  /** The CSS `font-style` property. */
  fontStyle: Property.FontStyle;

  /** The CSS `text-transform` property. */
  textTransform: Property.TextTransform;

  /** The CSS `text-decoration` property. */
  textDecoration: Property.TextDecoration;
}>;

export const typographyPropNames: KeysOf<TypographyProps> = {
  fontFamily: true,
  fontSize: true,
  fontWeight: true,
  lineHeight: true,
  letterSpacing: true,
  textAlign: true,
  fontStyle: true,
  textTransform: true,
  textDecoration: true,
};
