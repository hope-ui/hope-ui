import { CSS } from "@stitches/core";

import { config, theme } from "./stitches.config";
import { colors } from "./tokens/colors";
import { radii } from "./tokens/radii";
import { shadows } from "./tokens/shadows";
import { sizes } from "./tokens/sizes";
import { space } from "./tokens/space";
import { fonts, fontSizes, fontWeights, letterSpacings, lineHeights } from "./tokens/typography";
import { zIndices } from "./tokens/zIndices";

/**
 * Design tokens interface based on the stitches configuration.
 */
export type SystemTokens = typeof theme;

/**
 * Media at-rules interface based on the stitches configuration.
 */
export type SystemMedia = typeof config.media;

/**
 * Style interface based on the stitches configuration.
 */
export type SystemStyleObject = CSS<typeof config>;

/**
 * Takes in an existing TKey and adds a the Stitches token prefix `$` to it, if TKey extends the type string or number.
 * If not, never is returned instead as a type.
 * */
export type AddStitchesTokenPrefix<TKey> = TKey extends string | number ? `$${TKey}` : never;

/**
 * All available token value for the Color scale.
 * */
export type ColorTokens = AddStitchesTokenPrefix<keyof typeof colors>;

/**
 * All available token value for the Radii scale.
 * */
export type RadiiTokens = AddStitchesTokenPrefix<keyof typeof radii>;

/**
 * All available token value for the Shadow scale.
 * */
export type ShadowTokens = AddStitchesTokenPrefix<keyof typeof shadows>;

/**
 * All available token value for the Size scale.
 * */
export type SizeTokens = AddStitchesTokenPrefix<keyof typeof sizes>;

/**
 * All available token value for the Space scale.
 * */
export type SpaceTokens = AddStitchesTokenPrefix<keyof typeof space>;

/**
 * All available token value for the Font scale.
 * */
export type FontTokens = AddStitchesTokenPrefix<keyof typeof fonts>;

/**
 * All available token value for the Font size scale.
 * */
export type FontSizeTokens = AddStitchesTokenPrefix<keyof typeof fontSizes>;

/**
 * All available token value for the Font weight scale.
 * */
export type FontWeightTokens = AddStitchesTokenPrefix<keyof typeof fontWeights>;

/**
 * All available token value for the Line height scale.
 * */
export type LineHeightTokens = AddStitchesTokenPrefix<keyof typeof lineHeights>;

/**
 * All available token value for the Letter spacing scale.
 * */
export type LetterSpacingTokens = AddStitchesTokenPrefix<keyof typeof letterSpacings>;

/**
 * All available token value for the Z indices scale.
 * */
export type ZIndiceTokens = AddStitchesTokenPrefix<keyof typeof zIndices>;
