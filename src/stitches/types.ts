import { CSS } from "@stitches/core";

import { config, theme } from "./stitches.config";

/**
 * Design tokens interface based on the stitches theme.
 */
export type SystemTokens = typeof theme;

/**
 * Media at-rules interface based on the stitches media.
 */
export type SystemMedia = typeof config.media;

/**
 * Style interface based on the stitches configuration.
 */
export type SystemStyleObject = CSS<typeof config>;
