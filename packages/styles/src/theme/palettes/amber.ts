import { PaletteRangeGenerator, PaletteScale } from "../../types";
import { createGetCssVar } from "../../utils/css-var";
import { generatePaletteChannel } from "../../utils/generate-palette-channel";

const scale: PaletteScale = {
  50: "#fffbeb",
  100: "#fef3c7",
  200: "#fde68a",
  300: "#fcd34d",
  400: "#fbbf24",
  500: "#f59e0b",
  600: "#d97706",
  700: "#b45309",
  800: "#92400e",
  900: "#78350f",
};

const common = {
  ...scale,
  ...generatePaletteChannel(scale),
};

export const amberPalette: PaletteRangeGenerator = (palette, cssVarPrefix) => {
  const getCssVar = createGetCssVar(cssVarPrefix);

  return {
    ...common,

    // global variant - solid
    solidText: getCssVar(`colors-${palette}-900`),
    solidBackground: getCssVar(`colors-${palette}-300`),
    solidBorder: getCssVar(`colors-${palette}-300`),

    solidHoverText: getCssVar(`colors-${palette}-900`),
    solidHoverBackground: getCssVar(`colors-${palette}-400`),
    solidHoverBorder: getCssVar(`colors-${palette}-400`),

    solidActiveText: getCssVar(`colors-${palette}-900`),
    solidActiveBackground: getCssVar(`colors-${palette}-500`),
    solidActiveBorder: getCssVar(`colors-${palette}-500`),

    solidDisabledText: getCssVar("colors-common-white"),
    solidDisabledBackground: getCssVar("colors-neutral-200"),
    solidDisabledBorder: getCssVar("colors-neutral-200"),

    // global variant - soft
    softText: getCssVar(`colors-${palette}-900`),
    softBackground: getCssVar(`colors-${palette}-100`),
    softBorder: getCssVar(`colors-${palette}-100`),

    softHoverText: getCssVar(`colors-${palette}-900`),
    softHoverBackground: getCssVar(`colors-${palette}-200`),
    softHoverBorder: getCssVar(`colors-${palette}-200`),

    softActiveText: getCssVar(`colors-${palette}-900`),
    softActiveBackground: getCssVar(`colors-${palette}-300`),
    softActiveBorder: getCssVar(`colors-${palette}-300`),

    softDisabledText: getCssVar(`colors-neutral-300`),
    softDisabledBackground: getCssVar(`colors-neutral-50`),
    softDisabledBorder: getCssVar(`colors-neutral-50`),

    // global variant - outlined
    outlinedText: getCssVar(`colors-${palette}-900`),
    outlinedBackground: "transparent",
    outlinedBorder: getCssVar(`colors-${palette}-300`),

    outlinedHoverText: getCssVar(`colors-${palette}-900`),
    outlinedHoverBackground: getCssVar(`colors-${palette}-50`),
    outlinedHoverBorder: getCssVar(`colors-${palette}-400`),

    outlinedActiveText: getCssVar(`colors-${palette}-900`),
    outlinedActiveBackground: getCssVar(`colors-${palette}-100`),
    outlinedActiveBorder: getCssVar(`colors-${palette}-400`),

    outlinedDisabledText: getCssVar(`colors-neutral-100`),
    outlinedDisabledBackground: "transparent",
    outlinedDisabledBorder: getCssVar(`colors-neutral-100`),

    // global variant - plain
    plainText: getCssVar(`colors-${palette}-900`),
    plainBackground: "transparent",
    plainBorder: "transparent",

    plainHoverText: getCssVar(`colors-${palette}-900`),
    plainHoverBackground: getCssVar(`colors-${palette}-50`),
    plainHoverBorder: getCssVar(`colors-${palette}-50`),

    plainActiveText: getCssVar(`colors-${palette}-900`),
    plainActiveBackground: getCssVar(`colors-${palette}-100`),
    plainActiveBorder: getCssVar(`colors-${palette}-100`),

    plainDisabledText: getCssVar(`colors-neutral-200`),
    plainDisabledBackground: "transparent",
    plainDisabledBorder: "transparent",

    // global variant - override text
    overrideTextPrimary: getCssVar(`colors-${palette}-700`),
    overrideTextSecondary: getCssVar(`colors-${palette}-500`),
    overrideTextTertiary: getCssVar(`colors-${palette}-400`),
  };
};
