import { CSS } from "@stitches/core";

import { stitches } from "./stitches.config";
import { colors } from "./tokens/colors";
import { radii } from "./tokens/radii";
import { shadows } from "./tokens/shadows";
import { sizes } from "./tokens/sizes";
import { space } from "./tokens/space";

/**
 * Design tokens interface based on the stitches configuration.
 */
export type SystemTokens = typeof stitches.theme;

/**
 * Media at-rules interface based on the stitches configuration.
 */
export type SystemMedia = typeof stitches.config.media;

/**
 * Style interface based on the stitches configuration.
 */
export type SystemStyleObject = CSS<typeof stitches.config>;

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
