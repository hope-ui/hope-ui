import { Property } from "csstype";

import {
  FontScaleValue,
  FontSizeScaleValue,
  FontWeightScaleValue,
  KeysOf,
  LetterSpacingScaleValue,
  LineHeightScaleValue,
} from "../types";

/**
 * Types for typography related CSS properties
 */
export type TypographyProps = Partial<{
  /**
   * The CSS `font-family` property
   */
  fontFamily: Property.FontFamily | FontScaleValue;

  /**
   * The CSS `font-size` property
   */
  fontSize: Property.FontSize<FontSizeScaleValue> | number;

  /**
   * The CSS `font-weight` property
   */
  fontWeight: Property.FontWeight | FontWeightScaleValue | number;

  /**
   * The CSS `line-height` property
   */
  lineHeight: Property.LineHeight<LineHeightScaleValue> | string | number;

  /**
   * The CSS `letter-spacing` property
   */
  letterSpacing: Property.LetterSpacing<LetterSpacingScaleValue> | string | number;

  /**
   * The CSS `text-align` property
   */
  textAlign: Property.TextAlign;

  /**
   * The CSS `font-style` property
   */
  fontStyle: Property.FontStyle;

  /**
   * The CSS `text-transform` property
   */
  textTransform: Property.TextTransform;

  /**
   * The CSS `text-decoration` property
   */
  textDecoration: Property.TextDecoration;

  /**
   * Utility to visually truncating text after a fixed number of lines.
   */
  noOfLines: number | string;
}>;

/**
 * Style prop names used in typography properties
 */
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
  noOfLines: true,
};
