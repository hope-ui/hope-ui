import { defaulThemeTokens } from "@/stitches/tokens";

import { SystemTokens } from "./stitches";

/**
 * The Hope UI theme interface.
 */
export interface HopeTheme {
  tokens: SystemTokens;
}

/**
 * The Hope UI theme tokens override interface.
 */
export type ThemeTokensOverride = {
  [Scale in keyof typeof defaulThemeTokens]?: {
    [Token in keyof typeof defaulThemeTokens[Scale]]?: boolean | number | string;
  };
} & {
  [scale in string]: {
    [token in number | string]: boolean | number | string;
  };
};

/**
 * The Hope UI theme override interface.
 */
export type HopeThemeOverride = Pick<ThemeTokensOverride, "colors" | "fonts">;
