import merge from "lodash.merge";

import { baseTheme, createTheme, css } from "@/styled-system/stitches.config";
import { baseDarkThemeTokens } from "@/styled-system/tokens";

import { colorModeClassNames } from "./color-mode";
import { StitchesThemeConfig } from "./types";

/**
 * Create new stitches dark or light theme.
 * @return a merged theme object containing the base stitches theme and the override values.
 *
 * @internal
 */
export function extendBaseTheme<T extends StitchesThemeConfig>(type: "light" | "dark", themeConfig: T) {
  const isDark = type === "dark";

  const className = isDark ? colorModeClassNames.dark : colorModeClassNames.light;

  // If dark theme, we need to add base dark theme tokens which is not present in the base theme.
  const finalConfig = isDark ? merge({}, baseDarkThemeTokens, themeConfig) : themeConfig;

  const customTheme = createTheme(className, finalConfig);

  return merge({}, baseTheme, customTheme);
}

/**
 * Return the css variable associated with the given token if exists, or the token itself otherwise.
 *
 * @example
 * "$primary9" -> "var(--hope-colors-primary9)"
 * "tomato" -> "tomato"
 */
export function colorTokenToCssVar(token: string): string {
  if (!token.startsWith("$")) {
    return token;
  }

  return `var(--hope-colors-${token.substring(1)})`;
}

/**
 * Visually hide an element without hiding it from screen readers.
 */
export const visuallyHiddenStyles = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
});
