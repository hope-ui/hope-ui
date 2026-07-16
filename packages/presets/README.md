# @hope-ui/presets

The visual identity for [hope-ui](../../README.md) — the concrete implementation of the
[`@hope-ui/theming`](../theming/README.md) contract. It ships **`@hope-ui/presets/hope`** (a
subpath export), the preset hope-ui is built and demoed against. The package is structured so a
preset is one self-contained subpath.

A preset has two halves that a consumer wires up together:

1. **A CSS entry** imported into your Tailwind v4 entry — it ships the design tokens as `--hope-*`
   CSS variables plus an `@theme inline` mapping to clean utilities (`bg-primary`, …).
2. **A JS entry** — a `Preset` object you pass to `<ThemeProvider preset={…}>`, from which
   `@hope-ui/components` reads each component's recipe.

## Install

> Not yet published — see the repo [status](../../README.md#status).

```bash
pnpm add @hope-ui/presets
```

Peer dependency: `tailwindcss` (`^4.0.0`). Depends *up* on `@hope-ui/theming` for the contract it
implements.

## Subpath exports

| Import | Kind | Purpose |
| ------ | ---- | ------- |
| `@hope-ui/presets/hope` | JS | `hope` (the `Preset`) and `hopeRecipes` (the raw recipe map). |
| `@hope-ui/presets/hope/tailwind.css` | CSS | The Tailwind v4 entry — `--hope-*` token values + the `@theme inline` mapping. |

## Usage

```css
/* your Tailwind entry */
@import "tailwindcss";
@import "@hope-ui/presets/hope/tailwind.css";
```

```tsx
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";

<ThemeProvider preset={hope}>{/* app */}</ThemeProvider>;
```

`hope` is a **zero-DOM preset**: its token *values* are authored in CSS (`src/hope/tokens.css` —
`:root` + `.dark`), so `<ThemeProvider preset={hope}>` renders no runtime token `<style>`. Dark mode
is a `.dark` class. Theme is chosen at **build time** (which preset CSS you import); runtime
theme-switching is possible via `data-theme`/`.dark` but out of scope for now.

## How a preset is structured

```
src/
├── _base/                # shared structural layer — reused unchanged by every preset (not a subpath)
│   ├── variants.css      #   @custom-variant dark
│   └── theme-map.css     #   @theme inline: --hope-* → Tailwind color namespace
└── hope/
    ├── index.ts          # the JS preset — definePreset over the recipe map (no token values here)
    ├── tokens.css        # hope's --hope-* token values (:root + .dark)
    ├── tailwind.css      # the published CSS entry — a thin orchestrator of @imports
    └── recipes/          # tailwind-variants slot recipes; registered via @source
```

The `@theme inline` mapping and the `dark` variant are a pure function of the fixed semantic-token
contract, so they live once in `_base/` rather than being copy-pasted per preset. A preset authors
only its token *values* and its `recipes/`.

## Swap-safety

Raw scales (colors, spacing, radii) come from Tailwind itself, so their surface is identical in
every build by construction. What each preset **must** define is the semantic vocabulary — every
token in `SEMANTIC_COLOR_TOKENS` as a `--hope-*` variable, or a referencing utility compiles to an
unresolved `var()`. Because CSS variables aren't `tsc`-checkable, this is enforced with
`checkSemanticTokenConformance` (from [`@hope-ui/theming/conformance`](../theming/README.md)) run
against the preset's token CSS read as a string — see `src/hope/__tests__/`.

## Docs

- Theming model, the two axes, and adding a preset: [`docs/theming.md`](../../docs/theming.md).
- Preset API surface: [`docs/preset-api.md`](../../docs/preset-api.md).
- Semantic-token reference: [`docs/usage/theming/semantic-tokens/semantic-tokens.md`](../../docs/usage/theming/semantic-tokens/semantic-tokens.md).

## License

MIT.
