import { sizes } from "./tokens/sizes";

export const media = {
  sm: `(min-width: ${sizes["2xl"]})`,
  md: `(min-width: ${sizes["3xl"]})`,
  lg: `(min-width: ${sizes["4xl"]})`,
  xl: `(min-width: ${sizes["5xl"]})`,
  "2xl": `(min-width: ${sizes["6xl"]})`,
  dark: "(prefers-color-scheme: dark)",
  light: "(prefers-color-scheme: light)",
};
