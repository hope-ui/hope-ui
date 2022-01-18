import { CSS } from "@stitches/core";

import { stitches } from "@/stitches/stitches.config";

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
 * The `css` prop allow you to override styles easily.
 * It’s like the style attribute, but it supports tokens, media queries, nesting and token-aware values.
 */
export type CSSProp = { css?: SystemStyleObject };
