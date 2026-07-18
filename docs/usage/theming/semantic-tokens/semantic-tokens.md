# Semantic color tokens (`@hope-ui/theming`)

The design-system-agnostic color vocabulary every `@hope-ui/presets/*` preset implements. Components
and recipes reference these names as Tailwind utilities; a preset supplies the values as
`--hope-<token>` CSS variables (see `@hope-ui/presets/hope`).

Tokens are named by **identity, not context** — `role + variant + state`, nothing about *where* a
token sits. Every `(role × variant × state)` a recipe paints is its own **flat** token (no borrowing
across variants, no `--hope-{component}-*` tokens), so every painted value is an independent knob.

## API

- `SEMANTIC_COLOR_TOKENS` — readonly array of every semantic **color** token name (117). The runtime
  source of truth; `checkSemanticTokenConformance` iterates it.
- `SemanticColorToken` — the union of the color token names.
- `SemanticColorContract` — `Record<SemanticColorToken, string>`, the completeness shape a JS tool
  can assert against.
- `SEMANTIC_OPACITY_TOKENS` — readonly array of the opacity-axis token names (`opacity-disabled`,
  `opacity-loading`). A **separate contract** from color (see "Opacity axis" below).
- `SemanticOpacityToken` / `SemanticOpacityContract` — the opacity-axis analogues of the two color types.

## Naming (Tailwind-ergonomic)

No token is ever a bare CSS property, so utilities never double up (`text-text`, `border-border`,
`ring-ring`). The five naming rules:

1. **The Tailwind prefix is the layer** — a token carries role + variant + state only.
2. **Name by identity, not context** — `{role}-emphasis` is the role's legible *content* color
   (soft/outline/ghost/link label, inline role text); `on-{role}` names a context *only* for content
   on the solid fill.
3. **Recipes never compute** — no `color-mix` / alpha-modifier / hardcoded value in a recipe; a
   derived value is a token authored in the preset's `tokens.css` (the `focus-halo`/`scrim` precedent).
4. **Overridability unit = (role × variant × state)** — every variant owns its full rest / `-hovered`
   / `-pressed` ladder; press is a colorable state; nothing is borrowed from a sibling variant.
5. **Collection state splits `active`** (transient: hover / roving / activedescendant) **from
   `selected`** (persistent: chosen), each with an `on-*`.

### Per role — `{role}` ∈ `primary` · `neutral` · `success` · `info` · `warning` · `danger`

16 tokens per role, now uniform across all 6: the role border is **two-tier** — `-line` (strong) and
`-subtle-line` (soft) — and `neutral` carries both, like the chromatic roles.

| Token | Reads as | Purpose |
|---|---|---|
| `{role}` | `bg-{role}` · `border-{role}` | solid fill (rest); full-strength role border |
| `{role}-hovered` · `{role}-pressed` | `bg-*` | solid fill, hovered / pressed |
| `{role}-soft` | `bg-{role}-soft` | tonal fill (rest) |
| `{role}-soft-hovered` · `{role}-soft-pressed` | `bg-*` | tonal fill, hovered / pressed |
| `{role}-outline-hovered` · `{role}-outline-pressed` | `bg-*` | outline-variant wash (rest transparent) |
| `{role}-ghost-hovered` · `{role}-ghost-pressed` | `bg-*` | ghost-variant wash (rest transparent) |
| `{role}-line` | `border-{role}-line` | role border, **strong** tier (rest) |
| `{role}-subtle-line` | `border-{role}-subtle-line` | role border, **soft** tier (rest) |
| `{role}-emphasis` | `text-{role}-emphasis` | role content color (soft/outline/ghost/link label, inline role text) |
| `{role}-link-hovered` · `{role}-link-pressed` | `text-*` | link text, hovered / pressed (rest = `{role}-emphasis`) |
| `on-{role}` | `text-on-{role}` | content on the solid fill |

### Non-role (21)

| Group | Tokens | Reads as |
|---|---|---|
| Surfaces | `surface`, `surface-raised`, `surface-raised-hovered`, `surface-raised-pressed`, `surface-overlay`, `surface-sunken`, `surface-inverse` | `bg-*` |
| Standard text | `foreground`, `foreground-muted`, `foreground-subtle`, `foreground-disabled` | `text-*` |
| On-state | `on-inverse`, `on-active`, `on-selected` | `text-*` |
| Borders | `subtle`, `strong` | `border-*` |
| Collections | `active`, `selected` | `bg-*` |
| Systemic | `focus`, `focus-halo`, `scrim` | `border-*`/`ring-*` · `ring-*` · `bg-*` |

**Total color = 96 role + 21 non-role = 117.** There is no disabled *fill* token — a disabled control
dims via the `opacity-disabled` axis (below), keeping only `foreground-disabled` for the label. Icons
fold into the text tokens (currentColor) — there is no separate `icon` family.

## Opacity axis (separate contract)

Tailwind v4.3.2 has **no `--opacity-*` theme namespace**, so opacity is not mapped via `@theme inline`
like colors; a preset defines `--hope-opacity-*` and the shared `_base/opacity.css` wires each to a
custom `@utility`. These exist so a recipe never hardcodes a magic opacity (`opacity-90`).

| Token | Reads as | hope default | Purpose |
|---|---|---|---|
| `opacity-disabled` | `opacity-disabled` | `0.4` | dim applied to a disabled control |
| `opacity-loading` | `opacity-loading` | `1` | dim applied to content obscured while loading (hope leaves it undimmed — the loader arc conveys the state) |

## Pairing (readable-on)

Each fill owns its content color:

- primary button → `bg-primary text-on-primary hover:bg-primary-hovered data-pressed:bg-primary-pressed`
- soft error alert → `bg-danger-soft text-danger-emphasis border-danger-line`
- card → `bg-surface text-foreground border-subtle`
- tooltip → `bg-surface-inverse text-on-inverse`
- selected list option → `bg-selected text-on-selected`; highlighted (roving) option → `bg-active text-on-active`

Neutral surfaces pair with the `foreground*` ramp; the soft/outline/ghost/link label is
`{role}-emphasis` (the role's legible content color), not an on-fill color.

## Conformance

A preset proves it defines every token with the conformance kit (from `@hope-ui/theming/conformance`)
run against the CSS that declares the `--hope-*` values:

- `checkSemanticTokenConformance` / `assertSemanticTokenConformance` — the 117 color tokens.
- `checkOpacityTokenConformance` / `assertOpacityTokenConformance` — the 2 opacity tokens (same
  `--hope-<token>:` regex; the `--hope-` namespace is shared).

`@hope-ui/presets/hope` authors its palette in `hope/tokens.css`, so `hope.test.ts` reads that file
and runs **both** checks over it. An undefined token compiles every referencing utility (or the
opacity `@utility`) to an unresolved `var(--hope-…)`. Conformance checks the `:root` values only;
a preset keeps its `.dark` block in lockstep by hand (for hope, 117 color tokens in each block).
