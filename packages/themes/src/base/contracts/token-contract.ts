/**
 * The **raw-token contract** — the exact key surface every `@hope-ui/themes/*` theme shares.
 *
 * This is the raw-token analog of `SemanticColorContract` (see `./semantic-color-contract.ts`). The
 * problem it solves: a theme is chosen at `panda codegen` time, and components/recipes reference
 * token *names* (`rounded="2xl"` → `var(--radii-2xl)`, `fontSize="2xs"` → …). If one theme defined
 * a token key another lacked, swapping the preset would compile that reference to an *unresolved*
 * CSS variable and silently break styling — the same failure mode `SemanticColorContract` guards on
 * the color-alias axis, now closed on every raw category too.
 *
 * The rule this enforces (and the rule for authoring themes here): **new tokens are added to
 * `base`, never to a single theme** — so every theme inherits the identical key surface. A theme
 * only overrides the *values* of keys `base` already declares. Enforcement runs both directions:
 *
 * - **base can't drift from the contract.** Each `base` token literal is written
 *   `defineTokens.x({ … } satisfies XContract)`, so a missing key fails assignability and an
 *   extra/typo'd key fails the object-literal excess-property check.
 * - **a theme can't add a key.** A theme's raw-token override object is typed
 *   `satisfies ThemeTokenOverride` (a deep-partial of this contract): overriding an existing key's
 *   value is fine, introducing a foreign key is an excess-property `tsc` error.
 *
 * `Val` restricts a raw-token value to `{ value: string | string[] }` — a bare token (arrays cover
 * font stacks and multi-layer shadows). Semantic (conditional `{ base, _dark }`) values live on the
 * separate `semanticTokens` axis, not here.
 */
type Val = { value: string | string[] };

/** A color palette ramp — the fixed 50→950 shade set every hope palette uses. */
type Shade = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "950";
type ColorRamp = Record<Shade, Val>;

/** Every raw palette hope's `base` ships (Tailwind v4 hues + the v4 neutrals). */
type PaletteName =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "mauve"
  | "olive"
  | "mist"
  | "taupe"
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
  | "rose";

export type ColorsContract = { [K in PaletteName]: ColorRamp } & {
  inherit: Val;
  current: Val;
  transparent: Val;
  black: Val;
  white: Val;
};

export type FontsContract = Record<"sans" | "serif" | "mono" | "heading", Val>;

export type FontSizesContract = Record<
  | "2xs"
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
  | "9xl",
  Val
>;

export type FontWeightsContract = Record<
  | "thin"
  | "extralight"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black",
  Val
>;

export type LetterSpacingsContract = Record<
  "tighter" | "tight" | "normal" | "wide" | "wider" | "widest",
  Val
>;

export type LineHeightsContract = Record<
  "none" | "tight" | "snug" | "normal" | "relaxed" | "loose",
  Val
>;

type SpacingKey =
  | "0"
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
  | "11"
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
  | "96";

export type SpacingContract = Record<SpacingKey, Val>;

/** Sizes = the full spacing scale + fractions + intrinsic keywords + breakpoint widths + prose. */
type SizesExtraKey =
  | "1/2"
  | "1/3"
  | "2/3"
  | "1/4"
  | "2/4"
  | "3/4"
  | "1/5"
  | "2/5"
  | "3/5"
  | "4/5"
  | "1/6"
  | "5/6"
  | "1/12"
  | "5/12"
  | "7/12"
  | "11/12"
  | "full"
  | "min"
  | "max"
  | "fit"
  | "prose"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl";

export type SizesContract = Record<SpacingKey | SizesExtraKey, Val>;

export type RadiiContract = Record<
  "none" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full",
  Val
>;

export type ShadowsContract = Record<
  "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "inner",
  Val
>;

export type BlursContract = Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl", Val>;

export type DurationsContract = Record<"fast" | "normal" | "slow" | "slower", Val>;

export type EasingsContract = Record<"default" | "linear" | "in" | "out" | "in-out", Val>;

export type AspectRatiosContract = Record<
  "square" | "landscape" | "portrait" | "wide" | "ultrawide" | "golden",
  Val
>;

export type AnimationsContract = Record<"spin" | "ping" | "pulse" | "bounce", Val>;

/**
 * A text style value — a composite of typography props. The contract pins the *key set* (which
 * text styles exist); the inner CSS props stay a permissive string map so a theme can vary
 * line-height/tracking without churning the contract.
 */
type TextStyleVal = { value: Record<string, string> };

export type TextStylesContract = Record<
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
  | "9xl"
  | "label"
  | "none",
  TextStyleVal
>;

/** The full raw-token surface (matches the `defineTokens({ … })` aggregate in `theme/tokens.ts`). */
export interface BaseTokenContract {
  colors: ColorsContract;
  fonts: FontsContract;
  fontSizes: FontSizesContract;
  fontWeights: FontWeightsContract;
  letterSpacings: LetterSpacingsContract;
  lineHeights: LineHeightsContract;
  spacing: SpacingContract;
  sizes: SizesContract;
  radii: RadiiContract;
  shadows: ShadowsContract;
  blurs: BlursContract;
  easings: EasingsContract;
  durations: DurationsContract;
  aspectRatios: AspectRatiosContract;
  animations: AnimationsContract;
}

/** Deep-partial that stops at `Val`/`TextStyleVal` leaves (a value override is a complete token). */
type Leaf = Val | TextStyleVal;
type DeepTokenPartial<T> = T extends Leaf ? T : { [K in keyof T]?: DeepTokenPartial<T[K]> };

/**
 * The type a theme's `theme.extend.tokens` override object must satisfy: any subset of existing
 * keys, each overridden with a complete value. A foreign key is an excess-property `tsc` error —
 * which is how a theme is prevented from introducing a token `base` (and thus other themes) lack.
 */
export type ThemeTokenOverride = DeepTokenPartial<BaseTokenContract>;

/**
 * The `colors` slice of `ThemeTokenOverride` — the type a theme's per-file color override
 * (`chakra/tokens/colors.ts`) satisfies: a subset of `base`'s palettes, re-valued. A foreign
 * palette or shade is an excess-property `tsc` error.
 */
export type ThemeColorsOverride = NonNullable<ThemeTokenOverride["colors"]>;

/** The `theme.extend.textStyles` override analog (separate Panda category from raw tokens). */
export type ThemeTextStylesOverride = DeepTokenPartial<TextStylesContract>;
