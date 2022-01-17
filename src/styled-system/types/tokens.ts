import { borderStyles } from "../tokens/borderStyles";
import { borderWidths } from "../tokens/borderWidths";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";
import { shadows } from "../tokens/shadows";
import { sizes } from "../tokens/sizes";
import { space } from "../tokens/space";
import { transitions } from "../tokens/transitions";
import { fonts, fontSizes, fontWeights, letterSpacings, lineHeights } from "../tokens/typography";
import { zIndices } from "../tokens/zIndices";
import { AddStitchesTokenPrefix } from "./stitches";

export type BorderStyleTokens = AddStitchesTokenPrefix<keyof typeof borderStyles>;

export type BorderWidthTokens = AddStitchesTokenPrefix<keyof typeof borderWidths>;

export type ColorTokens = AddStitchesTokenPrefix<keyof typeof colors>;

export type RadiiTokens = AddStitchesTokenPrefix<keyof typeof radii>;

export type ShadowTokens = AddStitchesTokenPrefix<keyof typeof shadows>;

export type SizeTokens = AddStitchesTokenPrefix<keyof typeof sizes>;

export type SpaceTokens = AddStitchesTokenPrefix<keyof typeof space>;

export type TransitionTokens = AddStitchesTokenPrefix<keyof typeof transitions>;

export type FontTokens = AddStitchesTokenPrefix<keyof typeof fonts>;

export type FontSizeTokens = AddStitchesTokenPrefix<keyof typeof fontSizes>;

export type FontWeightTokens = AddStitchesTokenPrefix<keyof typeof fontWeights>;

export type LineHeightTokens = AddStitchesTokenPrefix<keyof typeof lineHeights>;

export type LetterSpacingTokens = AddStitchesTokenPrefix<keyof typeof letterSpacings>;

export type ZIndiceTokens = AddStitchesTokenPrefix<keyof typeof zIndices>;
