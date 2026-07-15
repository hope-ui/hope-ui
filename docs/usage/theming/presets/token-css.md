# `token-css` — the deterministic token-CSS renderer

`renderPresetStyle(tokens, darkMode)` turns a preset's [`tokens`](./presets.md) into the `<style>`
text `ThemeProvider` inlines (server-rendered, before first paint). Pure and DOM-free. Exported from
the `@hope-ui/theming` root barrel.

```ts
renderPresetStyle(tokens: PresetTokens, darkMode: DarkMode): string
```

## Why it exists

Token overrides must reach the page as CSS custom properties, and that CSS must be **byte-stable**:
the server-rendered `<style>` has to equal the client's exactly, or hydration mismatches
(constraint #1). This renderer is the one place all CSS-value transforms happen, so the preset can
store tokens exactly as authored.

## What it emits

- **Fixed order.** Colors are emitted in the `SEMANTIC_COLOR_TOKENS` order — **never** the input
  object's key order — and radii in sorted-key order, with constant whitespace. Same input → same
  bytes, every time.
- **Empty → `""`.** A preset with no token overrides renders the empty string (the provider then
  returns its exact zero-DOM tree). Note the default `hope` preset is **not** empty — it authors its
  full palette in TS, so it renders a token `<style>`.
- **Key normalization.** camelCase → `--hope-<kebab>` (`onPrimarySoft` → `--hope-on-primary-soft`);
  radii → `--hope-radii-<key>` (always `:root`, never a dark variant).
- **Value normalization.** Tailwind color shorthand `"violet.500"` → `var(--color-violet-500)`, and
  the scale-less Tailwind colors `"white"` / `"black"` → `var(--color-white)` / `var(--color-black)`.
  Values already starting with `var(` / `#` / `rgb` / `hsl` / `oklch` / `oklab` / `lab(` / `lch(` /
  `hwb(` / `color(`, or a genuine CSS keyword (`transparent`, `currentColor`), pass through raw.
- **Per-mode split.** A token's `dark` value goes in a dark block; a token with no `dark` emits no
  dark override (it inherits the base theme).

## `darkMode`

| Value | Dark block |
| --- | --- |
| `".dark"` (default) or any selector | `<selector> { … }` |
| `"media"` | `@media (prefers-color-scheme: dark) { :root { … } }` |
| `"none"` | none — no dark block even if tokens define dark values |

## Example

```ts
renderPresetStyle(
  { colors: { primary: { light: "violet.600", dark: "violet.400" } }, radii: { base: "0.5rem" } },
  ".dark",
);
```

```css
:root {
  --hope-primary: var(--color-violet-600);
  --hope-radii-base: 0.5rem;
}
.dark {
  --hope-primary: var(--color-violet-400);
}
```

## Sanitization

Values are checked for CSS-breaking characters — `{`, `}`, `;`, `<`, `>`, and newlines — and
`renderPresetStyle` **throws** (naming the token) if any are present. A cheap defense against a
malformed or injected dev-authored token corrupting the whole stylesheet; no legitimate token value
needs those characters.
