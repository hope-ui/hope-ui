import { defineTokens } from "@pandacss/dev";
import { aspectRatios } from "./aspect-ratios";
import { blurs } from "./blurs";
import { colors } from "./colors";
import { durations } from "./durations";
import { easings } from "./easings";
import { animations } from "./keyframes";
import { radii } from "./radii";
import { shadows } from "./shadows";
import { sizes } from "./sizes";
import { spacing } from "./spacing";
import { fontSizes, fonts, fontWeights, letterSpacings, lineHeights } from "./typography";

/**
 * Barrel for the raw-token layer. Aggregates every non-semantic token into one `Tokens` object
 * (the way preset-panda's `tokens.ts` does) — all Tailwind v4 values, owned outright (no
 * preset-panda). Each category lives in its own file; this file composes them and re-exports the
 * preset's other theme inputs (`textStyles`, `keyframes`, `breakpoints`, `conditions`) so the base
 * barrel imports everything from one place.
 */
export const tokens = defineTokens({
  colors,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  spacing,
  sizes,
  radii,
  shadows,
  blurs,
  easings,
  durations,
  aspectRatios,
  animations,
});

export { breakpoints } from "./breakpoints";
export { conditions } from "./conditions";
export { keyframes } from "./keyframes";
export { textStyles } from "./typography";
