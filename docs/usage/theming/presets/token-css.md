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
  object's key order — with constant whitespace. Same input → same bytes, every time.
- **Empty → `""`.** A preset with no token overrides renders the empty string (the provider then
  returns its exact zero-DOM tree). Note the default `hope` preset is **not** empty — it authors its
  full palette in TS, so it renders a token `<style>`.
- **Key normalization.** camelCase → `--hope-<kebab>` (`onPrimarySoft` → `--hope-on-primary-soft`).
- **Value normalization.** A value beginning with `--` is a CSS custom-property *reference* and is
  wrapped in `var(...)` — `"--color-violet-500"` → `var(--color-violet-500)`. This is the deliberate
  way to point a token at a Tailwind palette var (`--color-*`) or any other custom property: writing
  the literal `--color-*` reference keeps it in the preset's build-scanned source, so Tailwind's
  scanner retains that palette var instead of tree-shaking it (a bare `"violet.500"`-style shorthand
  would not, so the runtime `var(--color-violet-500)` would resolve to nothing). Every other value is
  an already-formed CSS color (`"#fff"`, `"var(--x)"`, `"oklch(…)"`, `"color-mix(…)"`,
  `"transparent"`) and passes through raw.
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
  { colors: { primary: { light: "--color-violet-600", dark: "--color-violet-400" } } },
  ".dark",
);
```

```css
:root {
  --hope-primary: var(--color-violet-600);
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
