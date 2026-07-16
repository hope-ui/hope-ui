# Design & migration: semantic color token vocabulary redesign (+ opacity axis + recipe-purity rule)

> **Status: approved, not yet implemented.** This is the authoritative spec for the work. Execute it
> phase by phase (Phase A → D); each phase leaves the repo green and is committed separately after
> review. All decisions below are locked.

## Context

Today's semantic color tokens conflate a token's **role** with the **context it's used in**. The
clearest symptom: Button's `link`/`ghost`/`outline` variants paint `text-on-{role}-soft` even though
they render *no soft fill* — the name encodes an implementation accident, not intent, and needs a
paragraph of comment to justify. Two deeper problems surfaced while designing the fix:

1. **Recipes compute colors.** The Button recipe derives states with `color-mix(...)` (soft hover) and
   `ring-focus/50` (focus halo) over `--hope-*` tokens it doesn't own. If a consumer redefines
   `--hope-danger-soft`, the recipe applies a fixed 12% rule to an unknown base → broken color. Colors
   a recipe paints must be **finished tokens**, authored by the preset (which owns the raw scale) —
   never computed in the recipe.
2. **Every (role × variant × state) must be independently overridable.** Reusing one variant's token
   for another's state (e.g. ghost-press borrowing `soft-hovered`) means a token author has no knob for
   the thing they want to change, and silently breaks a sibling variant when they touch a shared one.

The redesign delivers: a role/prominence naming model that reads without comments, a fully-decomposed
**flat** token vocabulary (no `--hope-{component}-*` tokens), an interaction-state ladder per variant,
a new **opacity** token axis (`opacity-disabled`/`opacity-loading`, adapting Atlassian's opacity
tokens), and an enforced **recipe-purity** rule. Outcome: recipe class strings that state intent
literally, and a token contract where every painted value is a knob.

**Current baseline (verified):** `SEMANTIC_COLOR_TOKENS` = **52 color tokens**; no opacity/radii tokens
exist. Conformance (`checkSemanticTokenConformance`) regex-checks each `--hope-<token>:` in
`hope/tokens.css` (only `:root`) and **auto-follows the array**, so renames need no conformance-code
change. The Button recipe already ships `-hover`/`-soft`/per-role `-outline` tokens but still uses
`color-mix`, `ring-focus/50`, `data-disabled:opacity-90`. **The docs (`docs/theming.md`, the
semantic-tokens usage doc) are already stale** — they still describe `-subtle`, "no state tokens", and
"role borders reuse the role color" — so the doc pass reconciles that drift, not just decision 02.

## Naming model (5 rules)

1. **The Tailwind prefix is the layer** — token carries role + variant + state only (no `text-text`).
2. **Name by identity, not context** — `{role}-emphasis` = the role's legible content color (soft/
   outline/ghost/link label, inline role text); `on-{role}` names a context *only* for content on the
   solid fill.
3. **Recipes never compute** — no `color-mix`/alpha-modifier/hardcoded value in a recipe; derived
   values are tokens authored in `tokens.css` (the existing `scrim` `color-mix` is the precedent).
4. **Overridability unit = (role × variant × state)** — every variant owns its full rest/hovered/
   pressed ladder; nothing borrowed from a sibling variant. Press is a **colorable** state.
5. **Collection state splits `active` (transient: hover/roving/activedescendant) from `selected`
   (persistent: chosen)**, each with an `on-*`.

**Locked decisions:** state suffix = `-hovered`/`-pressed` (renames existing `{role}-hover`); hope's
Button paints color press (`data-pressed:bg-{role}-pressed`) **and** keeps the transform nudge;
`opacity-disabled` = **0.4**, `opacity-loading` = **0.2**.

## Final vocabulary — 111 color tokens + 2 opacity tokens

### Per role — `{role}` ∈ primary · neutral · success · info · warning · danger (15 chromatic; neutral = 14, no `-line`)

| token | utility | purpose |
|---|---|---|
| `{role}` | `bg-{role}` · `border-{role}` | solid fill (rest); full-strength role border |
| `{role}-hovered` · `{role}-pressed` | `bg-*` | solid fill, hovered / pressed |
| `{role}-soft` | `bg-{role}-soft` | tonal fill (rest) |
| `{role}-soft-hovered` · `{role}-soft-pressed` | `bg-*` | tonal fill, hovered / pressed |
| `{role}-outline-hovered` · `{role}-outline-pressed` | `bg-*` | outline-variant wash (rest transparent) |
| `{role}-ghost-hovered` · `{role}-ghost-pressed` | `bg-*` | ghost-variant wash (rest transparent) |
| `{role}-line` | `border-{role}-line` | outline-variant border (rest) — **chromatic only**; neutral uses `border-strong` |
| `{role}-emphasis` | `text-{role}-emphasis` | role content color (soft/outline/ghost/link label, inline role text) |
| `{role}-link-hovered` · `{role}-link-pressed` | `text-*` | link text, hovered / pressed (rest = `{role}-emphasis`) |
| `on-{role}` | `text-on-{role}` | content on the solid fill |

= 15×5 + 14 = **89 role tokens**.

### Non-role (22)

| group | tokens | utility |
|---|---|---|
| Surfaces | `surface` · `-raised` · `-raised-hovered` · `-raised-pressed` · `-overlay` · `-sunken` · `-inverse` | `bg-*` |
| Text ramp | `foreground` · `-muted` · `-subtle` · `-disabled` | `text-*` |
| On-state | `on-inverse` · `on-selected` · `on-active` | `text-*` |
| Borders | `subtle` · `strong` | `border-*` |
| Collections | `active` · `selected` | `bg-*` |
| Disabled | `disabled` | `bg-*` |
| Systemic | `focus` · `focus-halo` · `scrim` | `border-*`/`ring-*` · `ring-*` · `bg-*` |

**Total color = 89 + 22 = 111.**

### Opacity axis (new, separate contract) — `--hope-opacity-*`

| token | utility | hope default | purpose |
|---|---|---|---|
| `opacity-disabled` | `opacity-disabled` | `0.4` | dim applied to a disabled control |
| `opacity-loading` | `opacity-loading` | `0.2` | dim applied to content obscured while loading |

Tailwind v4.3.2 has **no `--opacity-*` theme namespace** (verified), so these are exposed via custom
`@utility` rules, not `@theme inline`.

## Migration (current 52 → new)

| kind | change |
|---|---|
| **rename** | `on-{role}-soft` → `{role}-emphasis` (6); `{role}-hover` → `{role}-hovered` (6); `{role}-outline` → `{role}-line` (5 chromatic); `subtle-outline`/`strong-outline` → `subtle`/`strong` |
| **drop** | `neutral-outline` (→ `border-strong`); `disabled-outline` (→ `border-subtle`) — both already equal those values in `tokens.css` |
| **unchanged** | `surface*` rest, `foreground*`, `on-{role}` (solid), `on-inverse`, `{role}`, `{role}-soft`, `disabled`, `focus`, `scrim` |
| **new (61)** | `{role}-pressed`, `{role}-soft-hovered`, `{role}-soft-pressed`, `{role}-outline-hovered/-pressed`, `{role}-ghost-hovered/-pressed`, `{role}-link-hovered/-pressed` (9×6=54); `surface-raised-hovered/-pressed`; `focus-halo`; `active`/`on-active`; `selected`/`on-selected` |

52 − 2 + 61 = **111**. Plus 2 opacity tokens.

## Button recipe re-derivation (the proof — pure tokens, color press)

```ts
primary: {
  solid:   "bg-primary text-on-primary hover:bg-primary-hovered data-pressed:bg-primary-pressed",
  soft:    "bg-primary-soft text-primary-emphasis hover:bg-primary-soft-hovered data-pressed:bg-primary-soft-pressed",
  outline: "text-primary-emphasis border-primary-line hover:bg-primary-outline-hovered data-pressed:bg-primary-outline-pressed",
  ghost:   "text-primary-emphasis hover:bg-primary-ghost-hovered data-pressed:bg-primary-ghost-pressed",
  link:    "text-primary-emphasis hover:text-primary-link-hovered data-pressed:text-primary-link-pressed hover:underline underline-offset-4",
},
// neutral: outline border → border-strong (not border-neutral). success/info/warning/danger identical in shape.
```

Root base changes: `ring-focus/50` → `ring-focus-halo`; `data-disabled:opacity-90` →
`data-disabled:opacity-disabled`; **keep** `active:translate-y-px data-pressed:translate-y-px`.
`default` variant: `border-subtle-outline` → `border-subtle`, `hover:bg-neutral-soft` →
`hover:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed`. `outline` disabled:
`data-disabled:border-disabled-outline` → `data-disabled:border-subtle`. No `color-mix`, no alpha
modifier, no magic opacity anywhere. (The arbitrary font sizes `text-[0.8125rem]`/`text-[0.9375rem]`
are **not colors** → out of scope for this rule; leave as-is.)

> **Post-redesign note.** The shipped hope button recipe iterated past this sketch (the token
> vocabulary above is unchanged — only the recipe's use of it moved on): the hover wash is now
> guarded against the pressed state (`[&:hover:not([data-pressed])]:bg-{role}-hovered`) on every
> variant, `default` included, so hover never fights the press color; disabled dims via
> `opacity-disabled` **alone**, dropping the `disabled`/`foreground-disabled`/`border-subtle` color
> swaps; loading dims via `opacity-loading` on the `aria-busy` axis (its first consumer — the
> `opacity-loading` row above); and the root base drops `active:translate-y-px`, keeping only
> `data-pressed:translate-y-px`. See `docs/theming.md` and the recipe for the current shape.

## Files to change (by phase — each phase leaves the repo green)

### Phase A — vocabulary + values + mapping + conformance (atomic; conformance ties them together)
- `packages/theming/src/semantic-tokens/semantic-tokens.ts` — replace `SEMANTIC_COLOR_TOKENS` with the
  111; add `SEMANTIC_OPACITY_TOKENS = ["opacity-disabled","opacity-loading"] as const` + `SemanticOpacityToken`
  type + `SemanticOpacityContract`. Keep `HOPE_VAR_PREFIX`/`hopeVar` (reused for both axes).
- `packages/theming/src/semantic-tokens/__tests__/semantic-tokens.test.ts` — update the `has(...)`
  assertions to the new names; add opacity-list assertions; keep the "no bare CSS property" guard.
- `packages/theming/src/conformance/conformance.ts` — add `checkOpacityTokenConformance` /
  `assertOpacityTokenConformance` mirroring the color pair (default `tokens = SEMANTIC_OPACITY_TOKENS`,
  same `--hope-<token>:` regex). `checkSemanticTokenConformance` is unchanged (auto-follows the array).
- `packages/theming/src/conformance/__tests__/conformance.test.ts` — add opacity conformance cases.
- `packages/theming/src/index.ts` — re-export `SEMANTIC_OPACITY_TOKENS` + the new types (parity with the
  color exports).
- `packages/presets/src/_base/theme-map.css` — rewrite the `@theme inline` block to one
  `--color-<token>: var(--hope-<token>)` per **color** token (111), grouped as above.
- `packages/presets/src/_base/opacity.css` — **new** shared file:
  `@utility opacity-disabled { opacity: var(--hope-opacity-disabled); }` + same for `opacity-loading`.
- `packages/presets/src/hope/tailwind.css` — add `@import "../_base/opacity.css";`.
- `packages/presets/src/hope/tokens.css` — author all **111** `--hope-*` color values in **both** `:root`
  and `.dark`, plus `--hope-opacity-disabled: 0.4` / `--hope-opacity-loading: 0.2`. This is the large
  design-value task (pick a Tailwind scale step for every state). Keep `scrim`'s `color-mix` (preset-level
  is allowed). Reuse the existing shade choices where a token is unchanged; the new state tokens need new
  shade picks (e.g. `{role}-pressed` one step past `{role}-hovered`).
- `packages/presets/src/hope/__tests__/hope.test.ts` — add a second assertion:
  `assertOpacityTokenConformance(tokensCss)` (reads the same disk string).

### Phase B — Button recipe
- `packages/presets/src/hope/recipes/button.ts` — rewrite `COLOR_CLASSES` (pure tokens, color press),
  the `root` base (`ring-focus-halo`, `opacity-disabled`), and `default`/`outline` variants
  (`surface-raised-hovered/-pressed`, `border-subtle`). Remove all `color-mix`, `ring-focus/50`,
  `opacity-90`.
- `packages/presets/src/hope/recipes/__tests__/button.test.ts` — update expected class strings.
- Button SSR/hydration surfaces in `packages/components/src/button/__tests__/*` — the rendered `class`
  strings change, so regenerate the SSR inline snapshot / `button-ssr` fixture (`-u`) **only if it
  actually changed**, and confirm hydration still same-node-reuses.

### Phase C — recipe-purity enforcement (must follow B, else it fails on the old recipe)
- `scripts/check-recipe-purity.mjs` — **new**, modeled on `scripts/check-coverage-parity.mjs` (pure
  node ESM, manual `walk`, regex helpers, `relPath — message` reporting, exit 1 on any violation).
  Scans `packages/presets/**/recipes/**/*.{ts,tsx}`; within class **string literals** flags:
  (a) `color-mix(`; (b) arbitrary value `[...]` containing `--hope-` or `color-mix`; (c) alpha modifier
  on a color utility `\b(bg|text|border|ring|outline|fill|stroke|shadow|decoration|accent|caret|divide|from|via|to)-[\w-]+\/\d{1,3}\b`;
  (d) magic opacity `\bopacity-([1-9]|[1-9]\d)\b` (allow `opacity-0`/`opacity-100`). NB: this is the
  **inverse** of coverage-parity's `blankNonCode` — matches inside strings are the violations.
- `package.json` — add `"check:recipe-purity": "node scripts/check-recipe-purity.mjs"` beside
  `check:coverage-parity`.
- `.github/workflows/ci.yml` — add a step after the coverage-parity step: `run: pnpm check:recipe-purity`.
- `CLAUDE.md` — add `pnpm check:recipe-purity` to the commands list + a one-line rule in the
  Definition-of-Done / theming section.

### Phase D — docs (docs-only; `push` CI skips `**/*.md`)
- `docs/theming.md` — rewrite **Decision 01** (`-soft` not `-subtle`), **Decision 02** (recipes never
  compute; states are tokens incl. color press; supersede "no state tokens"), **Decision 08** (disabled =
  `foreground-disabled` + `disabled` fill + `border-subtle` + `opacity-disabled` token); replace the
  vocabulary section + Token reference table with the 111+2 set; add the opacity axis, the 5-rule naming
  model, and a "recipe purity" decision. Reconcile the stale `-subtle`/"role borders reuse the role
  color" wording to match the shipped `-soft`/`-line` reality.
- `docs/usage/theming/semantic-tokens/semantic-tokens.md` — rewrite the authoritative token list to
  111+2; document the opacity axis and its conformance.
- `docs/usage/theming/styling/styling.md` — update the token names it lists (`primary-hover` →
  `primary-hovered`, `primary-outline` → `primary-line`, add representative new ones).
- `docs/usage/components/button/button.md` — `on-{role}-soft` → `{role}-emphasis`.

## Key existing utilities to reuse (don't rebuild)
- `hopeVar()` / `HOPE_VAR_PREFIX` (`semantic-tokens.ts`) — for both color and opacity vars.
- `checkSemanticTokenConformance` (`conformance.ts`) — unchanged; mirror it for opacity.
- `scripts/check-coverage-parity.mjs` `walk` + regex-helper + reporting shape — the template for the
  purity script.
- `@source "./recipes"` (`hope/tailwind.css`) + literal `COLOR_CLASSES` strings — the existing scan
  mechanism; new tokens just need literal utilities in the recipe.

## Verification
1. **Typecheck:** `pnpm --filter @hope-ui/theming typecheck` (the `SemanticColorToken` union + button
   recipe types compile against the new names). `pnpm --filter @hope-ui/presets typecheck`.
2. **Unit:** `pnpm test` — `semantic-tokens.test.ts`, `conformance.test.ts` (color + new opacity), and
   `hope.test.ts` (`assertSemanticTokenConformance` proves all 111 `--hope-*` declared in `tokens.css`;
   `assertOpacityTokenConformance` proves the 2 opacity vars), plus the button recipe test.
3. **Purity:** `pnpm check:recipe-purity` — passes (green proves `button.ts` is free of `color-mix`,
   alpha modifiers, and magic opacity).
4. **SSR + hydration:** `pnpm test:ssr` / `pnpm test:browser` — Button renders with the new class
   strings, SSR snapshot regenerated if changed, hydration same-node-reuses, `expectNoA11yViolations`
   passes.
5. **Coverage parity:** `pnpm check:coverage-parity` — new `_base/opacity.css` and the conformance
   additions keep test/doc parity (scripts under `scripts/` are exempt; the new `_base` CSS is a preset
   partial, also exempt).
6. **Visual (the value-authoring check):** `pnpm storybook` — eyeball Button's 6 roles × 5 variants ×
   rest/hover/press in light and `.dark` to validate the ~110 hand-picked `tokens.css` values (this is
   where a bad shade pick shows).

## Risks / notes
- **`.dark` drift:** conformance only checks `:root`, so `.dark` must carry all 111 tokens too — easy to
  miss. Consider extending `checkSemanticTokenConformance` to also assert the `.dark` block (optional,
  recommended given the doubled surface).
- **Value authoring is the bulk of the effort**, not the mechanics: 111 color tokens × 2 modes = ~222
  declarations, most new state shades. Phase A is where the real design work sits.
- **Rollout:** follow the repo's per-phase convention — after each phase run its DoD gate, pause for
  review, then commit (Conventional Commit, **no** AI-attribution trailer per `CLAUDE.md`). Work on
  `develop`.
