# Design record: the semantic color token vocabulary (+ opacity axis + recipe-purity rule)

> **Status: implemented (2026-07).** This file is kept for the *problem statement and reasoning* —
> the part that still binds when someone adds a token or writes a recipe. The execution detail has
> been removed: the phased file-by-file change list, the migration table from the old 52-token set,
> the verification checklist, and the vocabulary tables have all been carried out or superseded.
>
> **The authoritative, current model is [`theming.md`](./theming.md)** — the token list, the utility
> each token reads as, the cross-system mapping, and the resolved decisions table. Do not use the
> counts that used to appear here: the shipped set is **143 color + 2 opacity**, not the 111 this
> spec proposed. The `disabled` fill token was dropped during implementation (a disabled control dims
> via the opacity axis instead), and the set has since grown past the proposal — the `inverted` fill
> ladder, the `-subtle-line` border tier, and the `surface-adaptive-*` wash all landed after it.
>
> **Filename note:** the CSS files this spec named were later reorganized — hope's `tokens.css`
> became `theme.css`, split out of `tailwind.css` as a separate opt-out import, and the
> `_base/*.css` files became `_`-prefixed partials behind a single `_base/base.css`.

## The problems this fixed

Semantic color tokens used to conflate a token's **role** with the **context it's used in**. The
clearest symptom: Button's `link`/`ghost`/`outline` variants painted `text-on-{role}-soft` even
though they render *no soft fill* — the name encoded an implementation accident, not intent, and
needed a paragraph of comment to justify.

Two deeper problems surfaced while designing the fix, and both are now enforced rules:

1. **Recipes computed colors.** The Button recipe derived states with `color-mix(...)` (soft hover)
   and `ring-focus/50` (focus halo) over `--hope-*` tokens it doesn't own. **If a consumer redefines
   `--hope-danger-soft`, the recipe applies a fixed 12% rule to an unknown base → broken color.**
   Colors a recipe paints must be **finished tokens**, authored by the preset (which owns the raw
   scale) — never computed in the recipe. Now enforced by `pnpm check:recipe-purity`
   (`scripts/check-recipe-purity.mjs`), which scans preset recipe **string literals** for
   `color-mix(`, arbitrary values containing `--hope-`/`color-mix`, alpha modifiers on a color
   utility (`bg-x/50`), and magic opacity (`opacity-90`; `opacity-0`/`opacity-100` allowed). NB: it
   is the **inverse** of `check-coverage-parity`'s `blankNonCode` — matches *inside* strings are the
   violations.
2. **Every (role × variant × state) must be independently overridable.** Reusing one variant's token
   for another's state (e.g. ghost-press borrowing `soft-hovered`) leaves a token author with no knob
   for the thing they want to change, and silently breaks a sibling variant when they touch a shared
   one.

## Naming model

The 5 naming rules that came out of this — the Tailwind prefix is the layer; name by identity not
context; recipes never compute; the overridability unit is (role × variant × state); collection state
splits `active` from `selected` — are stated canonically in [`theming.md`](./theming.md) §
*Semantic token vocabulary*, next to the token list they govern. Not repeated here.

Spellings this redesign locked, since older notes use the old ones: the state suffix is
`-hovered`/`-pressed` (was `-hover`); the outline-variant border is `{role}-line` (was
`{role}-outline`); the role content color is `{role}-emphasis` (was `on-{role}-soft`); neutral
borders are `subtle`/`strong` (was `subtle-outline`/`strong-outline`); the error role is `danger`,
never `destructive`.

## The opacity axis (a separate contract)

`opacity-disabled` and `opacity-loading`, under `--hope-opacity-*`, adapting Atlassian's opacity
tokens. **Tailwind v4 has no `--opacity-*` theme namespace** (verified), so these reach utilities via
custom `@utility` rules in `_base/_opacity.css`, not `@theme inline`. They exist so a recipe never
hardcodes a magic `opacity-90`. A disabled control has **no fill token** — this axis is how hope-ui
dims it, keeping only `foreground-disabled` for the label.

hope ships `opacity-disabled` at **0.4** and `opacity-loading` at **1** (the loader arc conveys the
loading state, so the content itself isn't dimmed — this deviates from the spec's original 0.2).

## How the shipped Button recipe deviated from the spec's sketch

The token vocabulary is unchanged; only the recipe's *use* of it moved on. Worth knowing because the
sketch is quoted in older notes:

- The hover wash is **guarded against the pressed state** (`[&:hover:not([data-pressed])]:bg-{role}-hovered`)
  on every variant, `default` included, so hover never fights the press color.
- Disabled dims via `opacity-disabled` **alone**, dropping the `disabled`/`foreground-disabled`/
  `border-subtle` color swaps the sketch had.
- Loading dims via `opacity-loading` on the `aria-busy` axis — the first consumer of that token.
- The root base drops `active:translate-y-px`, keeping only `data-pressed:translate-y-px`.

## Live risks

- **`.dark` drift.** `checkSemanticTokenConformance` only checks `:root`, so the `.dark` block must
  carry every token too — easy to miss, and nothing fails if it doesn't. Extending the check to
  assert the `.dark` block as well is still worth doing, given the doubled surface.
- **Value authoring is the bulk of the effort**, not the mechanics: 143 color tokens × 2 modes is
  ~286 declarations. A bad shade pick shows up nowhere but the eye — `pnpm storybook`, Button's 6
  roles × 5 variants × rest/hover/press in light and `.dark`, is the check.
