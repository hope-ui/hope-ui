/**
 * Barrel for the theme contracts — the type-level guarantees every `@hope-ui/themes/*` theme
 * implements so any two presets are swap-compatible:
 *
 * - `semantic-color-contract` — `SemanticColorContract`, the semantic (alias) color vocabulary
 *   every theme's `semanticTokens.colors` must satisfy.
 * - `token-contract` — `BaseTokenContract` (the shared raw-token key surface) + `ThemeTokenOverride`
 *   (the shape a theme's raw-token overrides must satisfy) + the per-category contract types the
 *   `base` token files assert against.
 */
export type * from "./semantic-color-contract";
export type * from "./token-contract";
