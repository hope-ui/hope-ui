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
  fontSize: Property.FontSize<FontSizeTokens> | number;
  fontWeight: Property.FontWeight | FontWeightTokens;
  lineHeight: Property.LineHeight<LineHeightTokens>;
  letterSpacing: Property.LetterSpacing<LetterSpacingTokens>;
  textAlign: Property.TextAlign;
  fontStyle: Property.FontStyle;
  textTransform: Property.TextTransform;
  textDecoration: Property.TextDecoration;
}>;
