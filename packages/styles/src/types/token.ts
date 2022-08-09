import { Prefixed } from "./prefixed";

export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type ThemeColorPalette = Record<Shade, string>;

export type ThemeColor =
  | "whiteAlpha"
  | "blackAlpha"
  | "primary"
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | (string & {});

export type ThemeColorShade = Prefixed<ThemeColor, Prefixed<".", Shade>>;

export type ThemeFontFamily = "sans" | "serif" | "mono" | (string & {});

export type ThemeFontSize =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl"
  | (string & {});

export type ThemeFontWeight =
  | "hairline"
  | "thin"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black"
  | (string & {});

export type ThemeLineHeight =
  | "normal"
  | "none"
  | "shorter"
  | "short"
  | "base"
  | "tall"
  | "taller"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | (string & {});

export type ThemeLetterSpacing =
  | "tighter"
  | "tight"
  | "normal"
  | "wide"
  | "wider"
  | "widest"
  | (string & {});

export type ThemeSpace =
  | "px"
  | "0.5"
  | "1"
  | "1.5"
  | "2"
  | "2.5"
  | "3"
  | "3.5"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "12"
  | "14"
  | "16"
  | "20"
  | "24"
  | "28"
  | "32"
  | "36"
  | "40"
  | "44"
  | "48"
  | "52"
  | "56"
  | "60"
  | "64"
  | "72"
  | "80"
  | "96"
  | (string & {});

export type ThemeSize =
  | ThemeSpace
  | "prose"
  | "max"
  | "min"
  | "full"
  | "screenW"
  | "screenH"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | (string & {});

export type ThemeRadii =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "full"
  | (string & {});

export type ThemeShadow =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "inner"
  | (string & {});

export type ThemeBreakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl" | (string & {});

export type ThemeZIndice =
  | "hide"
  | "auto"
  | "base"
  | "docked"
  | "sticky"
  | "banner"
  | "overlay"
  | "modal"
  | "dropdown"
  | "popover"
  | "tooltip"
  | "skipLink"
  | "toast"
  | (string & {});
