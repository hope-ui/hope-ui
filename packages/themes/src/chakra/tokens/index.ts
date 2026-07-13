import type { ThemeTokenOverride } from "../../base/contracts";
import { colors } from "./colors";

/**
 * chakra's raw-token override — the preset's `theme.extend.tokens` input. Chakra only re-values
 * `colors`; `satisfies ThemeTokenOverride` guards the category level (a foreign category would fail
 * `tsc`), while `./colors.ts` guards the palette level.
 */
export const tokens = { colors } satisfies ThemeTokenOverride;

export { semanticTokens } from "./semantic-tokens";
