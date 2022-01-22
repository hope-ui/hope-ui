import { sizes } from "./tokens/sizes";

export const media = {
  sm: `(min-width: ${sizes["2xl"]})`,
  md: `(min-width: ${sizes["3xl"]})`,
  lg: `(min-width: ${sizes["5xl"]})`,
  xl: `(min-width: ${sizes["7xl"]})`,
  "2xl": `(min-width: ${sizes["8xl"]})`,
  "reduce-motion": "(prefers-reduced-motion: reduce)",
  light: "(prefers-color-scheme: light)",
  dark: "(prefers-color-scheme: dark)",
};
