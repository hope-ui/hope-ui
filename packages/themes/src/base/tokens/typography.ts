import { defineTextStyles, defineTokens } from "@pandacss/dev";
import type {
  FontSizesContract,
  FontsContract,
  FontWeightsContract,
  LetterSpacingsContract,
  LineHeightsContract,
  TextStylesContract,
} from "../contracts";

/**
 * Typography tokens — Tailwind v4 values, Panda-style naming (`md` = base 1rem).
 * `textStyles` pair each size with v4's per-size line-height. Each category is written
 * `satisfies <Category>Contract` to pin the key surface every theme shares (see
 * `../contracts/token-contract.ts`).
 */

export const fontSizes = defineTokens.fontSizes({
  "2xs": { value: "0.625rem" },
  xs: { value: "0.75rem" },
  sm: { value: "0.875rem" },
  md: { value: "1rem" },
  lg: { value: "1.125rem" },
  xl: { value: "1.25rem" },
  "2xl": { value: "1.5rem" },
  "3xl": { value: "1.875rem" },
  "4xl": { value: "2.25rem" },
  "5xl": { value: "3rem" },
  "6xl": { value: "3.75rem" },
  "7xl": { value: "4.5rem" },
  "8xl": { value: "6rem" },
  "9xl": { value: "8rem" },
} satisfies FontSizesContract);

export const fontWeights = defineTokens.fontWeights({
  thin: { value: "100" },
  extralight: { value: "200" },
  light: { value: "300" },
  normal: { value: "400" },
  medium: { value: "500" },
  semibold: { value: "600" },
  bold: { value: "700" },
  extrabold: { value: "800" },
  black: { value: "900" },
} satisfies FontWeightsContract);

export const letterSpacings = defineTokens.letterSpacings({
  tighter: { value: "-0.05em" },
  tight: { value: "-0.025em" },
  normal: { value: "0em" },
  wide: { value: "0.025em" },
  wider: { value: "0.05em" },
  widest: { value: "0.1em" },
} satisfies LetterSpacingsContract);

export const lineHeights = defineTokens.lineHeights({
  none: { value: "1" },
  tight: { value: "1.25" },
  snug: { value: "1.375" },
  normal: { value: "1.5" },
  relaxed: { value: "1.625" },
  loose: { value: "2" },
} satisfies LineHeightsContract);

// v4's default (system-UI) font stacks. `sans` doubles as the default body font; `heading`
// aliases it (same value) so themes that want a distinct display face (e.g. Chakra maps its
// `heading` role here) can override just that key. Kept font-neutral in `base` — no web font.
const sansStack = [
  "ui-sans-serif",
  "system-ui",
  "sans-serif",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
];

export const fonts = defineTokens.fonts({
  sans: { value: sansStack },
  heading: { value: sansStack },
  serif: {
    value: ["ui-serif", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
  },
  mono: {
    value: [
      "ui-monospace",
      "SFMono-Regular",
      "Menlo",
      "Monaco",
      "Consolas",
      '"Liberation Mono"',
      '"Courier New"',
      "monospace",
    ],
  },
} satisfies FontsContract);

// fontSize + line-height pairs, from v4's `--text-*--line-height`.
export const textStyles = defineTextStyles({
  xs: { value: { fontSize: "0.75rem", lineHeight: "calc(1 / 0.75)" } },
  sm: { value: { fontSize: "0.875rem", lineHeight: "calc(1.25 / 0.875)" } },
  md: { value: { fontSize: "1rem", lineHeight: "calc(1.5 / 1)" } },
  lg: { value: { fontSize: "1.125rem", lineHeight: "calc(1.75 / 1.125)" } },
  xl: { value: { fontSize: "1.25rem", lineHeight: "calc(1.75 / 1.25)" } },
  "2xl": { value: { fontSize: "1.5rem", lineHeight: "calc(2 / 1.5)" } },
  "3xl": { value: { fontSize: "1.875rem", lineHeight: "calc(2.25 / 1.875)" } },
  "4xl": { value: { fontSize: "2.25rem", lineHeight: "calc(2.5 / 2.25)" } },
  "5xl": { value: { fontSize: "3rem", lineHeight: "1" } },
  "6xl": { value: { fontSize: "3.75rem", lineHeight: "1" } },
  "7xl": { value: { fontSize: "4.5rem", lineHeight: "1" } },
  "8xl": { value: { fontSize: "6rem", lineHeight: "1" } },
  "9xl": { value: { fontSize: "8rem", lineHeight: "1" } },
  // Chakra's preset form-label style + an empty reset, available to every theme.
  label: { value: { fontSize: "sm", lineHeight: "1.25rem", fontWeight: "medium" } },
  none: { value: {} },
} satisfies TextStylesContract);
