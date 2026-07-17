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
  design tokens as `--hope-*` variables (in its `tokens.css`) plus an `@theme inline` mapping. `hope`
  is the default the library is built and demoed against. Each preset depends *up* on
  `@hope-ui/theming` for the contract (its recipes are `tailwind-variants` functions, and it runs the
  conformance kit).

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
- **`defaultProps` + `ThemeablePropsRegistry`** — a preset's per-component `defaultProps` (in
  `definePreset`'s `components` overrides) sets app-wide defaults typed to that component's
  **themeable-props surface**: recipe variants **plus** component chrome content (for Button,
  `loader`/`loadingText` as reuse-safe factories). Per-usage behavioral props (Button's
  `nativeButton`/`type`) are deliberately **not** themeable — they describe what a given button *is*,
  not a design-system-wide policy. That surface is declared as a `<Component>ThemeableProps` type in theming, registered in
  a parallel, type-only `ThemeablePropsRegistry` (also closed and hand-declared — **no** module
  augmentation). The registry is **intentionally non-exhaustive**: a component that only wants
  variant-level defaults declares no entry and `defaultProps` falls back to its recipe variants
  (`ThemeablePropsOf<K>`). The runtime merges `defaultProps` in at `instance ?? preset ?? builtin`
  precedence (`useDefaults`). See
  [`themeable-props-registry`](usage/theming/registry/themeable-props-registry.md).
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
   variant/slot types) plus one entry in `RecipeRegistry` (`registry/recipe-registry.ts`). No
   module augmentation; the component and every theme import these types from theming:
   ```ts
   // recipes/accordion.ts
   export interface AccordionRecipeVariants { size?: "sm" | "md"; }
   export type AccordionSlot = "root" | "item" | "trigger";
   // registry/recipe-registry.ts
   interface RecipeRegistry {
     accordion: SlotRecipeFn<AccordionRecipeVariants, AccordionSlot>;
   }
   ```
   **Optional — behavioral/chrome defaults.** If the component wants a preset to default *non-variant*
   props app-wide (a behavioral toggle, a piece of brand chrome), also declare a
   `<Component>ThemeableProps` type (in the same contract file, `extends <Component>RecipeVariants`)
   and register it in `registry/themeable-props-registry.ts`. Type chrome content as a factory
   (`() => JSX.Element`, resolved via `runIfFunction`), never a bare `JSX.Element` — a shared preset
   default must render a fresh subtree per instance. Then add a compile-time drift guard in the
   component keeping its real props and the themeable surface aligned (see `Button` for the pattern).
   A component that only needs variant-level defaults skips this entirely — `defaultProps` falls back
   to its recipe variants.
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
│   ├── theme-map.css     #   @theme inline: color --hope-* → Tailwind color namespace (bg-primary, text-on-primary, …)
│   └── opacity.css       #   @utility opacity-disabled / opacity-loading → var(--hope-opacity-*)
└── hope/
    ├── index.ts          # the JS preset — definePreset over the recipe map (no token values here)
    ├── tokens.css        # hope's --hope-* token values (:root + .dark), authored in CSS
    ├── tailwind.css      # the published CSS entry (@hope-ui/presets/hope/tailwind.css) — a thin orchestrator, @imports only
    └── recipes/          #   tailwind-variants slot recipes; registered via @source
```

**Why the split.** The `@theme inline` color mapping, the opacity `@utility` layer, and the `dark`
variant are a **pure function of the fixed token contract** (`SEMANTIC_COLOR_TOKENS` +
`SEMANTIC_OPACITY_TOKENS`) — byte-identical in every preset — so they live once in `_base/` rather
than being copy-pasted per preset. The only thing a preset authors is its token *values* (hope
authors them in **CSS** — `tokens.css`'s `:root`/`.dark` `--hope-*` declarations) and its `recipes/`. The orchestrator's `@import` order is cosmetic — Tailwind
at-rules (`@theme`, `@custom-variant`) are collected at build time and `:root`/`.dark` custom
properties resolve by the cascade at use time, so nothing here is order-sensitive — so it reads as
labelled groups: the shared contract, this theme's token values, then its recipes. (`_base/` is a CSS
partials directory — unrelated to the removed Panda `base` preset noted under "Current state".)

So a theme (a) authors hope's semantic token values as `--hope-*` variables under `:root`/`.dark` in
its own `tokens.css` (so `<ThemeProvider>` renders no DOM — hope is a zero-DOM preset), (b) maps them
into Tailwind's color namespace with `@theme inline` so utilities stay clean — `bg-primary`,
`text-on-primary`, `border-subtle`, `ring-focus` (`_base/theme-map.css`) — plus the opacity axis via
`_base/opacity.css` (`@utility`, since Tailwind v4 has no `--opacity-*` namespace), and
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
which a preset runs against its token CSS — for hope, its `tokens.css` (read as a string in
`hope.test.ts`). The separate **opacity axis** (`SEMANTIC_OPACITY_TOKENS`) has the same requirement
and its own mirror check, `checkOpacityTokenConformance` / `assertOpacityTokenConformance`, run over
the same CSS. Both are the token analog of the recipe axis's `checkSlotRecipeConformance`.

## Semantic token vocabulary

The recipe contract above imposes no *token* vocabulary. This is the other half: the **semantic
(alias) color contract** — one design-system-agnostic set of role names every preset implements, so a
preset is a different set of values behind the same tokens. It is the token analog of the recipe
contract's "same slots and variant values, only the CSS differs": raw scales come from Tailwind
itself; each `@hope-ui/presets/*` supplies the semantic values as `--hope-<token>` variables in its
own `tokens.css` (hope's live in `hope/tokens.css`); components and recipes reference the names as
Tailwind utilities (`bg-primary`, `text-on-primary`).

The runtime source of truth is `SEMANTIC_COLOR_TOKENS` in `@hope-ui/theming`
([`semantic-tokens.ts`](../packages/theming/src/semantic-tokens/semantic-tokens.ts)); its
`SemanticColorContract` type (`Record<SemanticColorToken, string>`) is the canonical description of
the vocabulary. Because a theme ships CSS variables rather than a typed object, completeness is
enforced at the CSS level by `checkSemanticTokenConformance` (see "Adding a theme" above) rather than
by a `tsc` `satisfies` check. The **authoritative, current token list** — each token with the utility
it reads as — is
[`docs/usage/theming/semantic-tokens/semantic-tokens.md`](usage/theming/semantic-tokens/semantic-tokens.md);
this section is the design rationale and cross-system provenance behind it.

**Name by identity, not context (the 5 rules).** A token carries `role + variant + state` and nothing
about *where* it sits. (1) The Tailwind prefix is the layer, so no token is ever a bare CSS property
and utilities never double up (`text-text` / `border-border` / `ring-ring`). (2) Name by identity:
`{role}-emphasis` is the role's legible *content* color (the soft/outline/ghost/link label, inline
role text), while `on-{role}` names a context *only* for content on the solid fill. (3) Recipes never
compute — no `color-mix`/alpha-modifier/hardcoded value; a derived color is a token authored in the
preset's `tokens.css` (`focus-halo`, `scrim`). (4) The overridability unit is `(role × variant ×
state)`: every variant owns its full rest / `-hovered` / `-pressed` ladder (press is a colorable
state), nothing borrowed from a sibling. (5) Collection state splits `active` (transient) from
`selected` (persistent), each with an `on-*`. Standard text is the `foreground*` ramp; neutral borders
are `subtle`/`strong`; the outline-variant border is `{role}-line`; systemic is
`focus`/`focus-halo`/`scrim`; the error role is `danger` (not `destructive`).

The role *concepts* follow the Atlassian Design System's `property.role.modifier` shape
([foundations](https://atlassian.design/foundations/tokens/design-tokens),
[all tokens](https://atlassian.design/components/tokens/all-tokens)), re-spelled flat and Tailwind-first
(the opacity axis adapts Atlassian's opacity tokens). The set was designed as a **superset** of five
systems' alias layers (MD3 color roles, Ant seed→map→alias, Fluent v9, Bootstrap 5.3, shadcn) that
maps down to each without losing MD3/Fluent nuance.

### The shape

- **Surfaces are an elevation concept, not a fill** — so a background surface is never a doubled
  `bg-bg`: `surface` (default page/card) · `surface-raised` (cards/menus, with its own
  `-raised-hovered`/`-raised-pressed` interaction ladder) · `surface-overlay` (dialogs) ·
  `surface-sunken` (wells) · `surface-inverse` (tooltips). → `bg-surface`.
- **Standard text is the `foreground*` ramp** on neutral surfaces: `foreground` → `foreground-muted`
  → `foreground-subtle`, plus `foreground-disabled`. Icons fold into these via `currentColor` — there
  is no separate `icon` family.
- **Roles** (`primary` · `neutral` · `success` · `info` · `warning` · `danger`) each carry a fully
  decomposed set: the solid fill `{role}` (also the full-strength border `border-{role}`) with a
  `-hovered`/`-pressed` ladder; the tonal fill `{role}-soft` with its own ladder; per-variant wash
  ladders `{role}-outline-hovered/-pressed` and `{role}-ghost-hovered/-pressed`; the outline-variant
  border `{role}-line` (chromatic only — `neutral` uses `border-strong`); the role content color
  `{role}-emphasis` (the soft/outline/ghost/link label, inline role text → `text-{role}-emphasis`)
  with a link ladder `{role}-link-hovered/-pressed`; and `on-{role}` (content on the solid fill).
- **On-state text** (`on-*`, `text-*`): `on-inverse` (on `surface-inverse`, e.g. a tooltip),
  `on-active` (on the transient collection highlight), `on-selected` (on the persistent selection).
- **Neutral borders**: `subtle` · `strong` (`border-subtle`, `border-strong`) — emphasis levels only;
  no bare `border` token. (A recipe that tints a disabled outline can reuse `border-subtle`.)
- **Collection states**: `active` (transient — hover / roving / activedescendant) and `selected`
  (persistent — chosen), both `bg-*`, each paired with its `on-*` text above.
- **Disabled** has no fill token: a disabled control dims via the `opacity-disabled` axis (below)
  rather than swapping to a background color. The disabled *label* still has `foreground-disabled`.
- **Systemic**: `focus` (the focus indicator → `ring-focus` / `border-focus`) · `focus-halo` (its
  translucent ring → `ring-focus-halo`, a preset-authored derived color) · `scrim` (the dimming layer
  behind modals — distinct from the `surface-overlay` the dialog itself sits on → `bg-scrim`).

**Pairing** (the readable-on rule): each fill owns its content color. The solid fill pairs with
`on-{role}`; the soft/outline/ghost/link variants label with `{role}-emphasis`; neutral surfaces pair
with the shared `foreground*` ramp; `on-inverse` is only the on-color for `surface-inverse` (tooltip),
and `on-active`/`on-selected` for the collection states. Per-fill content colors are what let every
fill stay readable in both themes — a single global "inverse" can't serve both the flipping neutrals
*and* the fixed chromatic fills, which is why e.g. `on-warning` is dark in both themes (white fails on
amber).

So a primary button is `bg-primary text-on-primary hover:not-data-pressed:bg-primary-hovered
data-pressed:bg-primary-pressed` (the hope button recipe guards the hover wash against the pressed
state — via the `not-data-pressed` variant — so the two never fight); a soft error alert is
`bg-danger-soft text-danger-emphasis border-danger-line`.

**States are tokens, not computed** (decision 02): every `(role × variant × state)` is its own
finished token, so a recipe reads intent literally (`hover:bg-primary-soft-hovered`,
`data-pressed:text-primary-link-pressed`) and never mixes a color. Disabled has no dedicated fill
token — hope-ui dims a disabled control through the opacity axis, keeping only `foreground-disabled`
(text) for the label; a recipe that still wants a full grayed treatment can reuse `border-subtle` for
the border. The **opacity axis** — `opacity-disabled` and `opacity-loading` — is a separate contract
from color: Tailwind v4 has no `--opacity-*` namespace, so these reach utilities through
`_base/opacity.css`'s `@utility` layer, and exist so a recipe never hardcodes a magic `opacity-90`
(the hope button consumes both — `data-disabled:opacity-disabled` and `aria-busy:opacity-loading`).
hope ships `opacity-disabled` at 0.4 and `opacity-loading` at 1 (the loader arc conveys the loading
state, so the content itself isn't dimmed); both are preset knobs a theme can retune.

### Token reference (110 color + 2 opacity)

The full, authoritative list with every utility is
[`docs/usage/theming/semantic-tokens/semantic-tokens.md`](usage/theming/semantic-tokens/semantic-tokens.md);
this is the grouped summary. **Per role** (`primary` · `neutral` · `success` · `info` · `warning` ·
`danger` — 15 each, `neutral` = 14 with no `-line`):

| token | reads as | purpose |
|---|---|---|
| `{role}` · `{role}-hovered` · `{role}-pressed` | `bg-*` · `border-{role}` | solid fill ladder; full-strength role border |
| `{role}-soft` · `{role}-soft-hovered` · `{role}-soft-pressed` | `bg-*` | tonal fill ladder |
| `{role}-outline-hovered` · `{role}-outline-pressed` | `bg-*` | outline-variant wash (rest transparent) |
| `{role}-ghost-hovered` · `{role}-ghost-pressed` | `bg-*` | ghost-variant wash (rest transparent) |
| `{role}-line` | `border-{role}-line` | outline-variant border (rest) — chromatic only |
| `{role}-emphasis` · `{role}-link-hovered` · `{role}-link-pressed` | `text-*` | role content color + link ladder |
| `on-{role}` | `text-on-{role}` | content on the solid fill |

**Non-role (21):**

| token | reads as | purpose |
|---|---|---|
| `surface` · `-raised` · `-raised-hovered` · `-raised-pressed` · `-overlay` · `-sunken` · `-inverse` | `bg-*` | page/card · elevated (+ ladder) · dialog · well · tooltip |
| `foreground` · `-muted` · `-subtle` · `-disabled` | `text-*` | body → faint text; disabled |
| `on-inverse` · `on-active` · `on-selected` | `text-*` | on the inverse surface / on collection states |
| `subtle` · `strong` | `border-*` | default → strong border tint |
| `active` · `selected` | `bg-*` | transient highlight · persistent selection |
| `focus` · `focus-halo` · `scrim` | `ring-*`/`border-*` · `ring-*` · `bg-*` | focus indicator · translucent halo · modal dimming |

**Opacity axis (separate contract):** `opacity-disabled` (0.4) · `opacity-loading` (1) →
`opacity-disabled`, `opacity-loading` (via `_base/opacity.css`). A disabled control has no fill
token — this axis is how hope-ui dims it.

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
surface) → `inverse-on-surface` / — / `colorNeutralForegroundInverted` / — / —. The role content
color `{role}-emphasis` and the on-fill color `on-{role}` map to each system's on-fill/content colors
— see Fills/Feedback below. Icons reuse the text tones (no separate ramp; Fluent likewise has none).

**Borders** · `subtle` → `outline-variant` / `colorBorder` / `colorNeutralStroke1` /
`--bs-border-color` / `border`; `strong` → MD3 `outline` / `colorNeutralStrokeAccessible` /
shadcn `input`; the full-strength role border `border-{role}` and the outline-variant border
`{role}-line` → Ant `colorErrorBorder` etc. / Fluent `colorStatusDangerBorder1` /
Bootstrap `--bs-danger-border-subtle`.

**Fills** (bare `primary`; every role identical)

| hope | MD3 | Ant | Fluent | Bootstrap | shadcn |
|---|---|---|---|---|---|
| `primary` (solid) | `primary` | `colorPrimary` | `colorBrandBackground` | `--bs-primary` | `primary` |
| ↳ `on-primary` | `on-primary` | `colorTextLightSolid` | `colorNeutralForegroundOnBrand` | `#fff` | `primary-foreground` |
| `primary-soft` | `primary-container` | `colorPrimaryBg` | `colorBrandBackground2` | `--bs-primary-bg-subtle` | — ² |
| ↳ `primary-emphasis` (soft label / inline) | `on-primary-container` | `colorPrimaryText` | `colorBrandForeground2` | `--bs-primary-text-emphasis` | — ² |
| `text-primary-emphasis` (on neutral) | `primary` | `colorPrimaryText` | `colorBrandForeground1` | `--bs-link-color` | `primary` |
| `border-primary-line` | `outline` | `colorPrimaryBorder` | `colorBrandStroke1` | `--bs-primary-border-subtle` | — |

Interaction states here **are** tokens (`{role}-hovered`/`-pressed` and the per-variant soft/outline/
ghost/link ladders) — where MD3 uses state-layer opacity overlays, Ant `colorPrimaryHover`/`Active`,
Fluent `…Hover`/`…Pressed`, Bootstrap Sass `tint/shade`, shadcn a `/90` utility, hope resolves each to
a finished shade so the recipe reads intent literally and never mixes a color.

**Feedback** · `success`/`info`/`warning`/`danger`, each the same fill + `text-{role}-emphasis` (soft
label / inline) + `on-{role}` + `{role}-line`. Bootstrap 5.3's
`{color}`/`-bg-subtle`/`-border-subtle`/`-text-emphasis` maps 1:1 onto
`danger` / `danger-soft` / `danger-line` / `danger-emphasis`;
Ant fills every state cell. **MD3 ships only `error`; shadcn only `destructive`** — those themes
derive the rest from palette (consistent with MD3's "add custom colors"). Fluent has no `info` alias
(borrows Blue). `on-warning` (text on the solid warning fill) is dark in both themes (white fails on
amber).

**Scrim** · `scrim` → MD3 `scrim` / Ant `colorBgMask` / Fluent `colorBackgroundOverlay` / Bootstrap
`--bs-backdrop-bg`+`-opacity` (component-scoped) / shadcn `bg-black/80` (utility). Atlassian calls
this `color.blanket`; we use `scrim` to avoid colliding with `surface-overlay`.

¹ MD3/shadcn ship two neutral text tiers → `foreground-subtle` collapses to `foreground-muted`. ²
shadcn has no brand-soft; `neutral`/`neutral-soft` stand in.

### Extension points (documented, out of the required core)

- **`surface-N` ladder** — numbered tonal elevation (`surface` = `surface-1`) for MD3/Fluent themes;
  flat themes alias each rung to the nearest anchor.
- **`secondary` / `tertiary`** — optional chromatic accent roles (same shape) for multi-hue themes;
  `neutral` (always present) is the gray filled role, avoiding MD3's `secondary`-means-a-hue clash.
- **extra emphasis tokens** (`-bold`, and other Atlassian-style prominence steps) — a theme may add
  these beyond the required set. (The `-hovered`/`-pressed` interaction ladders are now **core**, not
  an extension — every variant owns its full ladder.)
- **`chart-*` / `palette-*`** — decorative/categorical color; not role-based; out of contract.

A theme adds any of these as extra `--hope-*` variables (a theme-private extra is swap-safe because
only that theme's own recipes reference it); the conformance check only polices the required core.

### Decisions (resolved 2026-07-13)

| # | Decision | Resolution |
|---|---|---|
| 01 | Ergonomic default | bare `primary`/`danger`/… = solid fill; `-soft` = tonal fill; the soft/outline/ghost/link label is `{role}-emphasis` (role content color); `on-{role}` is only the solid-fill content color |
| 02 | State mechanism | every `(role × variant × state)` is its own finished token (`{role}-hovered`/`-pressed`, per-variant soft/outline/ghost/link ladders; press is colorable). Supersedes the earlier "no state tokens / use `hover:bg-primary/90`" — recipes never compute a color |
| 03 | Surface pairing | shared `foreground*` ramp across surfaces; per-surface override optional |
| 04 | Surface tiers | 5 named `surface*` anchors required (`surface-raised` carries a hovered/pressed ladder); `surface-N` ladder optional |
| 05 | Feedback scope | all four — `success` · `info` · `warning` · `danger` |
| 06 | Naming | `neutral` = gray role; `secondary`/`tertiary` = optional chromatic accents |
| 07 | Chart/decorative | out of contract → `chart-*` / `palette-*` |
| 08 | Disabled | no dedicated fill token — a disabled control dims via the `opacity-disabled` axis (0.4); `foreground-disabled` (text) + `border-subtle` (border) remain for a recipe that still wants a grayed treatment. The reference hope button dims via `opacity-disabled` alone (loading via `opacity-loading` on `aria-busy`) |
| 09 | Casing | flat kebab-case names; preset ships `--hope-<token>`, color `@theme inline` maps to `--color-<token>`, opacity via `@utility` (no `--opacity-*` namespace in Tailwind v4) |
| 10 | Reference preset | shadcn-flavored baseline shipped as the default `@hope-ui/presets/hope` |
| 11 | Recipe purity | recipes reference *finished* tokens only — no `color-mix`, alpha modifier (`bg-x/50`), or magic opacity (`opacity-90`); derived colors (`focus-halo`, `scrim`) are authored in the preset's `tokens.css`. Enforced by `pnpm check:recipe-purity` |
| 12 | Opacity axis | `opacity-disabled` (0.4) / `opacity-loading` (1 in hope — the loader arc conveys the state) — a separate contract (`SEMANTIC_OPACITY_TOKENS`) so recipes never hardcode a magic opacity; adapts Atlassian's opacity tokens |
| — | Naming source | Atlassian `property.role.modifier`, re-spelled flat + Tailwind-first: `surface-*` (elevation), `foreground*` + `{role}-emphasis`/`on-*`, `scrim` |

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
