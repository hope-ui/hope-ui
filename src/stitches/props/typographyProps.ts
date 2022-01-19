import { Property } from "csstype";

import {
  FontSizeTokens,
  FontTokens,
  FontWeightTokens,
  LetterSpacingTokens,
  LineHeightTokens,
} from "../types";

/**
 * Utility props for typography
 */
export type TypographyProps = Partial<{
  /**
   * The CSS `font-family` property
   */
  fontFamily: Property.FontFamily | FontTokens;

  /**
   * The CSS `font-size` property
   */
  fontSize: Property.FontSize<FontSizeTokens> | number;

  /**
   * The CSS `font-weight` property
   */
  fontWeight: Property.FontWeight | FontWeightTokens | number;

  /**
   * Shorthand for truncating text
   */
  lineClamp: number;

  /**
   * The CSS `line-height` property
   */
  lineHeight: Property.LineHeight<LineHeightTokens> | number;

  /**
   * The CSS `letter-spacing` property
   */
  letterSpacing: Property.LetterSpacing<LetterSpacingTokens> | number;

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
}>;
