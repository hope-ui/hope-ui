# hope-ui theming

How a hope-ui component gets its styling, and how a theme provides it. This is the orientation
doc; per-symbol API detail lives in the per-file usage docs under `docs/usage/theming/`, and
the full rationale (the multi-theme feasibility analysis) is in the approved plan referenced from
`CLAUDE.md`.

## The two axes

Theming spans two package axes that never mix dependencies:

- **Runtime** (imported into app code; peer deps `solid-js` / `@solidjs/web`):
  `@hope-ui/primitives` ← `@hope-ui/theming` ← `@hope-ui/components`.
- **Config** (imported into the consumer's Tailwind v4 entry CSS; peer dep `tailwindcss`):
  `@hope-ui/presets/{hope,…}` — each preset is a CSS file (`@import "@hope-ui/presets/hope/tailwind.css"`) shipping
  design tokens as `--hope-*` variables plus an `@theme inline` mapping. `hope` is the default the
  library is built and demoed against. Each preset depends *up* on `@hope-ui/theming` for the contract
  (its recipes are `tailwind-variants` functions, and it runs the conformance kit).

`@hope-ui/theming` is the dependency-inversion seam: components read from it, themes implement it,
and neither knows about the other.

## The contract (`@hope-ui/theming`)

- **`ThemeProvider` / `useRecipe`** — a `ThemeProvider` injects a **theme** (a map of recipe name →
  pure recipe function) into context; a component reads one out with
  `const recipe = useRecipe("<name>")` and computes its class(es) in a getter. Built on the
  isomorphic `createComponentContext`, so it is server-readable during `renderToStringAsync` —
  which is the whole of "works in SolidStart" for theming.
- **`RecipeRegistry`** — the recipe registry. `@hope-ui/theming` **owns the look-&-feel contract**:
  every hope-authored component's recipe (its variant vocabulary + slots) is declared here directly,
  as the single source of truth. A component does not `declare module` its own recipe (no module
  augmentation), and a theme does not invent the shape; both import the contract types from theming.
- **`SlotRecipeFn<Variants, Slot = "root">`** — **every recipe is a slot recipe.** There is no
  single-class recipe form: a one-part component uses the `root` slot. A recipe is a
  `tailwind-variants` recipe used as-is, so a caller always deals in `recipe(props).<slot>()` (each
  slot is a class function), never a bare string for some components and a record for others.
- **`THEMING_CONTRACT_VERSION`** — a constant themes assert against to catch preset↔contract drift.
- **`@hope-ui/theming/conformance`** — a generic runtime kit
  (`checkSlotRecipeConformance` / `assertSlotRecipeConformance`) a theme runs post-`codegen` to
  prove each recipe actually emits a class for every slot at every variant combination it declares.

Theme is chosen at **build time** (which theme CSS the consumer imports). CSS variables make runtime
theme-switching *possible* (toggle a `data-theme`/`.dark` attribute), but it is out of scope for now —
the default path is one theme per build.

## Adding a component (the shape to follow)

1. Design the component's variants and slots.
2. Declare its contract in `@hope-ui/theming` — a `recipes/<component>.ts` contract file (its
   variant/slot types) plus one entry in `RecipeRegistry` (`recipes/registry.ts`). No module
   augmentation; the component and every theme import these types from theming:
   ```ts
   // recipes/accordion.ts
   export interface AccordionRecipeVariants { size?: "sm" | "md"; }
   export type AccordionSlot = "root" | "item" | "trigger";
   // recipes/registry.ts
   interface RecipeRegistry {
     accordion: SlotRecipeFn<AccordionRecipeVariants, AccordionSlot>;
   }
   ```
3. In the component, compute each slot's `class` in a getter from
   `useRecipe("accordion")(props).<slot>()` and render through `renderElement` for `as`/`render`
   polymorphism. Merge the consumer's `class` through the recipe's slot function (`.root({ class })`)
   so their utilities win.
4. Add the matching `tailwind-variants` slot recipe (authored with the shared `tv` from
   `@hope-ui/theming`; internal state authored as conditions **nested inside** consumer-facing
   variants — never a top-level `state` axis) to each preset under `@hope-ui/presets/*`.

## Adding a preset

A preset is a **Tailwind v4 CSS entry** the consumer imports into their Tailwind entry
(`@import "@hope-ui/presets/hope/tailwind.css"`). Behind that one entry the CSS is split into single-responsibility
files — two of them **shared verbatim by every preset**, so a preset only authors what is actually
preset-specific:

```
packages/presets/src/
├── _base/                # shared structural layer — reused unchanged by every preset; not a published subpath
│   ├── variants.css      #   @custom-variant dark (+ future data-* state variants)
│   └── theme-map.css     #   @theme inline: --hope-* → Tailwind color namespace (bg-primary, text-on-primary, …)
└── hope/
    ├── index.ts          # the JS preset — hope's token palette (hopeTokens, authored in TS) + definePreset over the recipe map
    ├── tailwind.css      # the published CSS entry (@hope-ui/presets/hope/tailwind.css) — a thin orchestrator, @imports only
    ├── tokens.css        #   the @theme radius scale (--radius-* derived from --hope-radii-base); token *values* live in index.ts
    └── recipes/          #   tailwind-variants slot recipes; registered via @source
```

**Why the split.** The `@theme inline` mapping and the `dark` variant are a **pure function of the
fixed `SEMANTIC_COLOR_TOKENS` contract** — byte-identical in every preset — so they live once in
`_base/` rather than being copy-pasted per preset. The only thing a preset authors is its token
*values* (hope authors them in **TypeScript** — `index.ts`'s `hopeTokens` — delivered at runtime by
`<ThemeProvider>`; the CSS side keeps only the `@theme` radius scale) and its `recipes/`. The
orchestrator's `@import` order is cosmetic — Tailwind
at-rules (`@theme`, `@custom-variant`) are collected at build time and `:root`/`.dark` custom
properties resolve by the cascade at use time, so nothing here is order-sensitive — so it reads as
two labelled groups: the shared contract first, then this theme's values. (`_base/` is a CSS partials
directory — unrelated to the removed Panda `base` preset noted under "Current state".)

So a theme (a) authors hope's semantic token values (hope authors them in TS — `index.ts`'s
`hopeTokens` — which `<ThemeProvider>` delivers at runtime as `--hope-*` variables under
`:root`/`.dark`; a preset may instead declare them in its own `tokens.css`), (b) maps them into
Tailwind's color namespace with `@theme inline` so utilities stay clean — `bg-primary`,
`text-on-primary`, `border-subtle-outline`, `ring-focus` (`_base/theme-map.css`), and
(c) — once components exist — ships its own `tailwind-variants` slot recipes (same slots and variant
*values* as every other preset; only the emitted classes differ). A first-party preset is a subpath of
`@hope-ui/presets` (`@hope-ui/presets/hope` is the default) that reuses `_base/*` and adds its own
`hope/`-style folder; a third party publishes its own package implementing the same contract. See
`@hope-ui/presets/hope`'s files for the reference shape.

**Swap-safety.** Raw scales (colors, spacing, radii, shadows) come from **Tailwind itself**, so their
key surface is identical in every build by construction — nothing to police, and a preset-private
extra (e.g. an elevation shadow) is safe because only that preset's own recipes reference it. What
each preset *must* define is the **semantic vocabulary**: every token in `SEMANTIC_COLOR_TOKENS` as a
`--hope-*` variable, or a referencing utility (`bg-primary`) compiles to an unresolved `var()`.
Because CSS variables aren't `tsc`-checkable, this is enforced at the CSS level by
`checkSemanticTokenConformance` / `assertSemanticTokenConformance` (from `@hope-ui/theming/conformance`),
which a preset runs against its token CSS — for hope, the CSS that `renderPresetStyle(hope.tokens, …)`
emits from its TS palette (see `hope.test.ts`); for a CSS-authoring preset, its `tokens.css`. It's the
token analog of the recipe axis's `checkSlotRecipeConformance`.

## Semantic token vocabulary

The recipe contract above imposes no *token* vocabulary. This is the other half: the **semantic
(alias) color contract** — one design-system-agnostic set of role names every preset implements, so a
preset is a different set of values behind the same tokens. It is the token analog of the recipe
contract's "same slots and variant values, only the CSS differs": raw scales come from Tailwind
itself; each `@hope-ui/presets/*` supplies the semantic values (hope authors them in TS and the
provider emits `--hope-<token>` variables at runtime; a preset may instead declare them in its own
`tokens.css`); components and recipes reference the names as Tailwind utilities (`bg-primary`,
`text-on-primary`).

The runtime source of truth is `SEMANTIC_COLOR_TOKENS` in `@hope-ui/theming`
([`semantic-tokens.ts`](../packages/theming/src/semantic-tokens/semantic-tokens.ts)); its
`SemanticColorContract` type (`Record<SemanticColorToken, string>`) is the canonical description of
the vocabulary. Because a theme ships CSS variables rather than a typed object, completeness is
enforced at the CSS level by `checkSemanticTokenConformance` (see "Adding a theme" above) rather than
by a `tsc` `satisfies` check. The **authoritative, current token list** — each token with the utility
it reads as — is
[`docs/usage/theming/semantic-tokens/semantic-tokens.md`](usage/theming/semantic-tokens/semantic-tokens.md);
this section is the design rationale and cross-system provenance behind it.

**Tailwind-first naming.** No token is ever a bare CSS property, so utilities never double up (no
`text-text` / `border-border` / `ring-ring`): standard text is the `foreground*` ramp, on-fill/inverse
text is `on-*`, neutral borders are `subtle`/`strong`, systemic is `focus`/`scrim`, and the error role
is `danger` (not `destructive`). The role *concepts* follow the Atlassian Design System's
`property.role.modifier` shape ([foundations](https://atlassian.design/foundations/tokens/design-tokens),
[all tokens](https://atlassian.design/components/tokens/all-tokens)), re-spelled flat and Tailwind-first.
The set was designed as a **superset** of five systems' alias layers (MD3 color roles, Ant
seed→map→alias, Fluent v9, Bootstrap 5.3, shadcn) that maps down to each without losing MD3/Fluent
nuance.

### The shape

- **Surfaces are an elevation concept, not a fill** — so a background surface is never a doubled
  `bg-bg`: `surface` (default page/card) · `surface-raised` (cards/menus) · `surface-overlay`
  (dialogs) · `surface-sunken` (wells) · `surface-inverse` (tooltips). → `bg-surface`.
- **Standard text is the `foreground*` ramp** on neutral surfaces: `foreground` → `foreground-muted`
  → `foreground-subtle`, plus `foreground-disabled`. Icons fold into these via `currentColor` — there
  is no separate `icon` family.
- **On-color text** stays readable on a colored fill or the inverse surface, under the `on-*` prefix:
  `on-<role>` (text on the role's SOLID fill → `text-on-primary`), `on-<role>-subtle` (text on its
  SUBTLE fill → `text-on-primary-subtle`), and `on-inverse` (text on `surface-inverse`, e.g. a
  tooltip). The role color used as *standalone* text on a neutral surface (a link, an inline error) is
  just the role utility, `text-<role>` (e.g. `text-danger`). Roles, in order: `primary` · `neutral` ·
  `success` · `info` · `warning` · `danger`.
- **Neutral border tints**: `subtle-outline` · `strong-outline` · `disabled-outline`
  (`border-subtle-outline`, …) — the `-outline` suffix keeps them from being misread as fills. Role
  borders reuse the role color (`border-primary`), so they need no dedicated token.
- **Disabled control fill**: `disabled` (`bg-disabled`) — a real background fill (distinct from the
  border tints), kept a legible step away from `foreground-disabled` so the disabled label still reads.
- **Fills stay role-first and bare** so the common case is short (decision 01): `bg-primary`,
  `bg-danger`, `bg-danger-subtle`. Each role is `{ <role> (solid fill), <role>-subtle (tonal fill) }`.
- **Systemic**: `focus` (the focus indicator → `ring-focus` / `outline-focus`) · `scrim` (the dimming
  layer behind modals — distinct from the `surface-overlay` the dialog itself sits on → `bg-scrim`).

**Pairing** (the readable-on rule): each fill owns its on-color. Text on a role's solid fill is
`text-on-<role>`; text on its subtle fill is `text-on-<role>-subtle`. Neutral surfaces pair with the
shared `foreground*` ramp; `on-inverse` is only the on-color for `surface-inverse` (tooltip). Per-fill
on-colors are what let every fill stay readable in both themes — a single global "inverse" can't serve
both the flipping neutrals *and* the fixed chromatic fills, which is why e.g. `on-warning` is dark in
both themes (white fails on amber).

So a primary button is `bg-primary text-on-primary`; a soft error alert is
`bg-danger-subtle text-on-danger-subtle border-danger`.

**States**: the semantic vocabulary carries no `hovered`/`pressed`/`bold` tokens — recipes derive
interaction states from Tailwind's own opacity / `color-mix` utilities (e.g. `hover:bg-primary/90`,
decision 02). Disabled pairs `foreground-disabled` (text) / `disabled` (fill, `bg-disabled`) /
`disabled-outline` (border) with a reduced opacity (decision 08).

### Token reference (hope values, light → dark intent)

| token | reads as | purpose |
|---|---|---|
| `surface` · `-raised` · `-overlay` · `-sunken` · `-inverse` | `bg-*` | page/card · elevated · dialog · well · tooltip |
| `foreground` · `-muted` · `-subtle` · `-disabled` | `text-*` | body → faint text; disabled |
| `on-<role>` · `on-<role>-subtle` · `on-inverse` | `text-*` | text on the role's solid fill; on its subtle fill; on the inverse surface |
| `subtle-outline` · `strong-outline` · `disabled-outline` | `border-*` | default → strong border tint; disabled border (role border = `border-<role>`) |
| `disabled` | `bg-*` | disabled control fill (kept legible under `foreground-disabled`) |
| `primary` · `neutral` · `success` · `info` · `warning` · `danger` (+ each `-subtle`) | `bg-*` | solid fill + tonal fill |
| `focus` · `scrim` | `ring-*` · `bg-*` | focus indicator · modal dimming layer |

### Cross-system mapping

`—` = no equivalent; footnotes flag lossy/approximate mappings.

**Surfaces**

| hope | MD3 | Ant | Fluent | Bootstrap | shadcn |
|---|---|---|---|---|---|
| `surface` | `surface` | `colorBgContainer` | `colorNeutralBackground1` | `--bs-body-bg` | `background` / `card` |
| `surface-raised` | `surface-container-high` | `colorBgElevated` | `colorNeutralCardBackground` | — | `popover` |
| `surface-overlay` | `surface-container-highest` | `colorBgElevated` | `colorNeutralBackground1` | — | `popover` |
| `surface-sunken` | `surface-container` / `surface-dim` | `colorBgLayout` | `colorNeutralBackground3` | `--bs-tertiary-bg` | `muted` |
| `surface-inverse` | `inverse-surface` | `colorBgSpotlight` | `colorNeutralBackgroundInverted` | — | — |

**Foreground** · `foreground` → MD3 `on-surface` / Ant `colorText` / Fluent `colorNeutralForeground1` /
Bootstrap `--bs-body-color` / shadcn `foreground`; `foreground-muted` → `on-surface-variant` /
`colorTextSecondary` / `colorNeutralForeground2` / `--bs-secondary-color` / `muted-foreground`;
`foreground-subtle` → Ant `colorTextTertiary` / Fluent `colorNeutralForeground3` /
`--bs-tertiary-color` (MD3/shadcn ship two tiers → collapses ¹); `on-inverse` (on the inverse
surface) → `inverse-on-surface` / — / `colorNeutralForegroundInverted` / — / —. The per-role on-fill
colors (`on-<role>`, `on-<role>-subtle`) map to each system's on-fill colors — see Fills/Feedback
below. Icons reuse the text tones (no separate ramp; Fluent likewise has none).

**Borders** · `subtle-outline` → `outline-variant` / `colorBorder` / `colorNeutralStroke1` /
`--bs-border-color` / `border`; `strong-outline` → MD3 `outline` / `colorNeutralStrokeAccessible` /
shadcn `input`; `border-<role>` → Ant `colorErrorBorder` etc. / Fluent `colorStatusDangerBorder1` /
Bootstrap `--bs-danger-border-subtle`.

**Fills** (bare `primary`; every role identical)

| hope | MD3 | Ant | Fluent | Bootstrap | shadcn |
|---|---|---|---|---|---|
| `primary` (solid) | `primary` | `colorPrimary` | `colorBrandBackground` | `--bs-primary` | `primary` |
| ↳ `on-primary` | `on-primary` | `colorTextLightSolid` | `colorNeutralForegroundOnBrand` | `#fff` | `primary-foreground` |
| `primary-subtle` | `primary-container` | `colorPrimaryBg` | `colorBrandBackground2` | `--bs-primary-bg-subtle` | — ² |
| ↳ `on-primary-subtle` | `on-primary-container` | `colorPrimaryText` | `colorBrandForeground2` | `--bs-primary-text-emphasis` | — ² |
| `text-primary` (on neutral) | `primary` | `colorPrimaryText` | `colorBrandForeground1` | `--bs-link-color` | `primary` |
| `border-primary` | `outline` | `colorPrimaryBorder` | `colorBrandStroke1` | `--bs-primary-border-subtle` | — |

Interaction states (`hover`/`active`) are not tokens — recipes use utilities (`hover:bg-primary/90`),
where MD3 uses state-layer opacity overlays, Ant `colorPrimaryHover`/`Active`, Fluent `…Hover`/`…Pressed`,
Bootstrap Sass `tint/shade`, shadcn a `/90` utility.

**Feedback** · `success`/`info`/`warning`/`danger`, each the same fill + `text-<role>` (on neutral) +
`on-<role>` / `on-<role>-subtle` + `border-<role>`. Bootstrap 5.3's
`{color}`/`-bg-subtle`/`-border-subtle`/`-text-emphasis` maps 1:1 onto
`danger` / `danger-subtle` / `border-danger` / `on-danger-subtle`;
Ant fills every state cell. **MD3 ships only `error`; shadcn only `destructive`** — those themes
derive the rest from palette (consistent with MD3's "add custom colors"). Fluent has no `info` alias
(borrows Blue). `on-warning` (text on the solid warning fill) is dark in both themes (white fails on
amber).

**Scrim** · `scrim` → MD3 `scrim` / Ant `colorBgMask` / Fluent `colorBackgroundOverlay` / Bootstrap
`--bs-backdrop-bg`+`-opacity` (component-scoped) / shadcn `bg-black/80` (utility). Atlassian calls
this `color.blanket`; we use `scrim` to avoid colliding with `surface-overlay`.

¹ MD3/shadcn ship two neutral text tiers → `foreground-subtle` collapses to `foreground-muted`. ²
shadcn has no brand-subtle; `neutral`/`neutral-subtle` stand in.

### Extension points (documented, out of the required core)

- **`surface-N` ladder** — numbered tonal elevation (`surface` = `surface-1`) for MD3/Fluent themes;
  flat themes alias each rung to the nearest anchor.
- **`secondary` / `tertiary`** — optional chromatic accent roles (same shape) for multi-hue themes;
  `neutral` (always present) is the gray filled role, avoiding MD3's `secondary`-means-a-hue clash.
- **discrete emphasis / state tokens** (`-bold`, `-hovered`, `-pressed`) — Atlassian-style variants a
  theme may add when Tailwind's opacity / `color-mix` utilities aren't good enough.
- **`chart-*` / `palette-*`** — decorative/categorical color; not role-based; out of contract.

A theme adds any of these as extra `--hope-*` variables (a theme-private extra is swap-safe because
only that theme's own recipes reference it); the conformance check only polices the required core.

### Decisions (resolved 2026-07-13)

| # | Decision | Resolution |
|---|---|---|
| 01 | Ergonomic default | bare `primary`/`danger`/… = solid fill; `-subtle` = tonal fill; on-colors are `on-<role>`/`on-<role>-subtle` |
| 02 | State mechanism | Tailwind opacity / `color-mix` utilities (e.g. `hover:bg-primary/90`); no dedicated state tokens |
| 03 | Surface pairing | shared `foreground*` ramp across surfaces; per-surface override optional |
| 04 | Surface tiers | 5 named `surface*` anchors required; `surface-N` ladder optional |
| 05 | Feedback scope | all four — `success` · `info` · `warning` · `danger` |
| 06 | Naming | `neutral` = gray role; `secondary`/`tertiary` = optional chromatic accents |
| 07 | Chart/decorative | out of contract → `chart-*` / `palette-*` |
| 08 | Disabled | `foreground-disabled` (text) + `disabled` (fill) + `disabled-outline` (border) + reduced opacity; fill kept legible under the text |
| 09 | Casing | flat kebab-case names; preset ships `--hope-<token>`, `@theme inline` maps to `--color-<token>` |
| 10 | Reference preset | shadcn-flavored baseline shipped as the default `@hope-ui/presets/hope` |
| — | Naming source | Atlassian `property.role.modifier`, re-spelled flat + Tailwind-first: `surface-*` (elevation), `foreground*` + `on-*`, `scrim` |

## SSR / hydration

Class names are pure, deterministic mappers, so server and client produce identical markup
(`hash: false` makes them byte-identical). `ThemeProvider` renders no DOM of its own — but
**wrapping a subtree in it shifts that subtree's hydration keys (`_hk`)**, so a component's SSR
fixture and its hydration test must both include `<ThemeProvider>` identically.

## Current state

The contract and the default preset `@hope-ui/presets/hope` are built on **Tailwind v4 +
`tailwind-variants`**. `hope` ships the full semantic-token structure, enforced by
`checkSemanticTokenConformance`. `Button` is the first styled component: it consumes `useRecipe`,
and `@hope-ui/presets/hope` implements the matching `tv` slot recipe (registered as-is — a `tv`
recipe *is* the `SlotRecipeFn` shape, no adapter). See [`roadmap.md`](roadmap.md) for the
done/deferred breakdown.
