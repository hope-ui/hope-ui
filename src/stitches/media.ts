import { sizes } from "./tokens/sizes";

export const media = {
  sm: `(min-width: ${sizes.containerSm})`,
  md: `(min-width: ${sizes.containerMd})`,
  lg: `(min-width: ${sizes.containerLg})`,
  xl: `(min-width: ${sizes.containerXl})`,
  "2xl": `(min-width: ${sizes.container2xl})`,
  "reduce-motion": "(prefers-reduced-motion: reduce)",
  light: "(prefers-color-scheme: light)",
  dark: "(prefers-color-scheme: dark)",
};
