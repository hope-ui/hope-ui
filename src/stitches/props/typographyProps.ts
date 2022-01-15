import { Property } from "csstype";

import {
  FontSizeTokens,
  FontTokens,
  FontWeightTokens,
  LetterSpacingTokens,
  LineHeightTokens,
} from "../tokens/typography";

export type TypographyProps = Partial<{
  fontFamily: Property.FontFamily | FontTokens;
  fontSize: Property.FontSize<FontSizeTokens>;
  fontWeight: Property.FontWeight | FontWeightTokens;
  lineHeight: Property.LineHeight<LineHeightTokens>;
  letterSpacing: Property.LetterSpacing<LetterSpacingTokens>;
  textAlign: Property.TextAlign;
  fontStyle: Property.FontStyle;
  textTransform: Property.TextTransform;
  textDecoration: Property.TextDecoration;
}>;

export type TypographyPropsKeys = keyof TypographyProps;

/**
 * Array based on the `TypographyProps`.
 * Used to splitProps in SolidJS components
 */
export const typographyPropsKeys: TypographyPropsKeys[] = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "fontStyle",
  "textTransform",
  "textDecoration",
];
