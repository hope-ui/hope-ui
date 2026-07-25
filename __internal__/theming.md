# hope-ui theming

How a hope-ui component gets its styling, and how a theme provides it. Per-symbol API detail lives in
the doc website (`apps/docs/`).

## The two axes

Theming spans two package axes that never mix dependencies:

- **Runtime** (imported into app code; peer deps `solid-js` / `@solidjs/web`):
  `@hope-ui/primitives` ← `@hope-ui/theming` ← `@hope-ui/components`.
- **Config** (imported into the consumer's Tailwind v4 entry CSS; peer dep `tailwindcss`):
  `@hope-ui/presets/{hope,…}`. Each preset ships two CSS entries — `@import
  "@hope-ui/presets/hope/tailwind.css"` for the `@theme inline` mapping, then `@import
  "@hope-ui/presets/hope/theme.css"` for the `--hope-*` token values (an opt-out import you can
  replace with your own). `hope` is the default the library is built and demoed against. Each preset
  depends *up* on `@hope-ui/theming` for the contract.

`@hope-ui/theming` is the dependency-inversion seam: components read from it, themes implement it,
neither knows the other.

## The contract (`@hope-ui/theming`)

- **`ThemeProvider` / `useRecipe`** — `ThemeProvider` injects a **theme** (a map of recipe name → pure
  recipe function) into context; a component reads one out with `useRecipe("<name>")` and computes its
  class(es) in a getter. Built on the isomorphic `createComponentContext`, so it is server-readable
  during `renderToStringAsync` — the whole of "works in SolidStart" for theming.
- **`RecipeRegistry`** (`recipe-registry.ts`) — every hope-authored component's recipe (variant
  vocabulary + slots) is declared here directly, as the single source of truth. A component does not
  `declare module` its own recipe, and a theme does not invent the shape; both import the contract
  types from theming.
- **`defaultProps` + `ThemeablePropsRegistry`** (`themeable-props-registry.ts`) — a preset's
  per-component `defaultProps` (in `definePreset`'s `components` overrides) sets app-wide defaults
  typed to that component's **themeable-props surface**: recipe variants **plus** component chrome
  content (for Button, `loader`/`loadingText` as reuse-safe factories). Per-usage behavioral props
  (Button's `nativeButton`/`type`) are deliberately **not** themeable — they describe what a given
  button *is*, not a design-system-wide policy. The surface is declared as a
  `<Component>ThemeableProps` type in theming and registered in the parallel, type-only
  `ThemeablePropsRegistry` (also closed and hand-declared). The registry is **intentionally
  non-exhaustive**: a component wanting only variant-level defaults declares no entry and
  `defaultProps` falls back to its recipe variants (`ThemeablePropsOf<K>`). The runtime merges at
  `instance ?? preset ?? builtin` precedence (`useDefaults`).
- **`SlotRecipeFn<Variants, Slot = "root">`** — **every recipe is a slot recipe**; a one-part
  component uses the `root` slot. A recipe is a `tailwind-variants` recipe used as-is, so a caller
  always deals in `recipe(props).<slot>()`, never a bare string for some components and a record for
  others.
- **`THEMING_CONTRACT_VERSION`** — a constant themes assert against to catch preset↔contract drift.
- **`@hope-ui/theming/conformance`** — a generic runtime kit (`checkSlotRecipeConformance` /
  `assertSlotRecipeConformance`) a theme runs post-`codegen` to prove each recipe emits a class for
  every slot at every variant combination it declares.

Theme is chosen at **build time** (which theme CSS the consumer imports). CSS variables make runtime
theme-switching possible (toggle a `data-theme`/`.dark` attribute), but that is out of scope — the
default path is one theme per build.

## Adding a component (the shape to follow)

1. Design the component's variants and slots.
2. Declare its contract in `@hope-ui/theming` — a `recipes/<component>.ts` contract file (its
   variant/slot types) plus one entry in `RecipeRegistry` (`recipe-registry.ts`):
   ```ts
   // recipes/accordion.ts
   export interface AccordionRecipeVariants { size?: "sm" | "md"; }
   export type AccordionSlot = "root" | "item" | "trigger";
   // recipe-registry.ts
   interface RecipeRegistry {
     accordion: SlotRecipeFn<AccordionRecipeVariants, AccordionSlot>;
   }
   ```
   **Optional — behavioral/chrome defaults.** For a preset to default *non-variant* props app-wide,
   also declare a `<Component>ThemeableProps` type (same contract file, `extends
   <Component>RecipeVariants`) and register it in `themeable-props-registry.ts`. Type chrome content
   as a factory (`() => JSX.Element`, resolved via `runIfFunction`), never a bare `JSX.Element` — a
   shared preset default must render a fresh subtree per instance. Then add a compile-time drift guard
   in the component keeping its real props and the themeable surface aligned (`Button` is the
   pattern). A component needing only variant-level defaults skips this entirely.
3. In the component, compute each slot's `class` in a getter from
   `useRecipe("accordion")(props).<slot>()` and render through `renderElement` for `as`/`render`
   polymorphism. Merge the consumer's `class` through the recipe's slot function (`.root({ class })`)
   so their utilities win.
4. Add the matching `tailwind-variants` slot recipe (authored with the shared `tv` from
   `@hope-ui/theming`; internal state authored as conditions **nested inside** consumer-facing
   variants — never a top-level `state` axis) to each preset under `@hope-ui/presets/*`. Every
   directional utility in it is **logical** — see [RTL-aware recipes](#rtl-aware-recipes).

## Adding a preset

A preset ships **two Tailwind v4 CSS entries** the consumer imports, in order:
`@import "@hope-ui/presets/hope/tailwind.css"` (structure) then
`@import "@hope-ui/presets/hope/theme.css"` (token values). The token entry is a **separate, opt-out
import** — skip it and import your own `theme.css` (e.g. the doc site's Theme Creator output) to
restyle every token; `tailwind.css` deliberately does **not** import it. Behind those entries the CSS
splits into single-responsibility files, several **shared verbatim by every preset**:

```
packages/presets/src/
├── _base/                # shared structural layer — reused unchanged by every preset; not a published subpath
│   ├── base.css          #   the single entry into _base/ — aggregates the partials below (imported by hope/tailwind.css)
│   ├── _variants.css     #   @custom-variant dark + data-* state variants
│   ├── _opacity.css      #   @utility opacity-disabled / opacity-loading → var(--hope-opacity-*)
│   ├── _scrollbar.css    #   @utility no-scrollbar
│   └── _theme-map.css    #   @theme inline: color --hope-* → Tailwind color namespace (bg-primary, text-on-primary, …)
└── hope/
    ├── index.ts          # the JS preset — definePreset over the recipe map (no token values here)
    ├── tailwind.css      # structural CSS entry — @import _base/base.css, radius scale, @source recipes
    ├── theme.css         # token-value entry — hope's --hope-* values (:root + .dark), a separate opt-out import
    └── recipes/          #   tailwind-variants slot recipes; registered via @source
```

**Why the split.** The `@theme inline` color mapping, the opacity `@utility` layer, and the `dark`
variant are a **pure function of the fixed token contract** (`SEMANTIC_COLOR_TOKENS` +
`SEMANTIC_OPACITY_TOKENS`) — byte-identical in every preset — so they live once in `_base/`. A preset
authors only its token *values* (hope authors them in **CSS**, `theme.css`'s `:root`/`.dark`
`--hope-*` declarations) and its `recipes/`. Within `tailwind.css` the `@import` order is cosmetic:
Tailwind at-rules (`@theme`, `@custom-variant`) are collected at build time and `:root`/`.dark` custom
properties resolve by the cascade at use time. The one ordering that matters is that the consumer
imports `theme.css` *after* `tailwind.css`.

So a theme (a) authors the semantic token values as `--hope-*` variables under `:root`/`.dark` in its
own `theme.css` (so `<ThemeProvider>` renders no DOM — hope is a zero-DOM preset), (b) maps them into
Tailwind's color namespace with `@theme inline` so utilities stay clean — `bg-primary`,
`text-on-primary`, `border-subtle`, `ring-focus` (`_base/_theme-map.css`) — plus the opacity axis via
`_base/_opacity.css` (`@utility`, since Tailwind v4 has no `--opacity-*` namespace), and (c) ships its
own `tailwind-variants` slot recipes (same slots and variant *values* as every other preset; only the
emitted classes differ). A first-party preset is a subpath of `@hope-ui/presets` reusing `_base/*` and
adding its own `hope/`-style folder; a third party publishes its own package implementing the same
contract.

**Swap-safety.** Raw scales (colors, spacing, radii, shadows) come from **Tailwind itself**, so their
key surface is identical in every build by construction — nothing to police, and a preset-private
extra (an elevation shadow) is safe because only that preset's recipes reference it. What each preset
*must* define is the **semantic vocabulary**: every token in `SEMANTIC_COLOR_TOKENS` as a `--hope-*`
variable, or a referencing utility (`bg-primary`) compiles to an unresolved `var()`. CSS variables
aren't `tsc`-checkable, so this is enforced at the CSS level by `checkSemanticTokenConformance` /
`assertSemanticTokenConformance` (`@hope-ui/theming/conformance`), which a preset runs against its
token CSS — for hope, its `theme.css` read as a string in `hope.test.ts`. The separate **opacity
axis** (`SEMANTIC_OPACITY_TOKENS`) has the same requirement and its own mirror check,
`checkOpacityTokenConformance` / `assertOpacityTokenConformance`, over the same CSS. Both are the
token analog of the recipe axis's `checkSlotRecipeConformance`.

## RTL-aware recipes

hope-ui supports RTL from day one. For the styling layer that is a property of the **classes a
recipe emits**, not a per-component flag: `pr-8` reserves a gutter on the right in every locale,
while `pe-8` reserves it on the side the text *ends* — the same edge in `ltr`, the mirrored one in
`rtl`. A physical utility never fails loudly. It mis-paints for every Arabic/Hebrew/Farsi reader
while the variant matrix, the snapshots and axe all stay green. (The real case: hope's Listbox pinned
its check glyph with `absolute right-2` inside a `pr-8` gutter, so in RTL the glyph landed on top of
the label and the reserved gutter sat on the empty side.)

**The rule: a recipe uses logical directional utilities only.**

| Physical — never | Logical — always |
|---|---|
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `border-l*` / `border-r*` | `border-s*` / `border-e*` |
| `rounded-l*` `rounded-r*` `rounded-tl*` `rounded-tr*` `rounded-bl*` `rounded-br*` | `rounded-s*` `rounded-e*` `rounded-ss*` `rounded-se*` `rounded-es*` `rounded-ee*` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `float-left` / `float-right`, `clear-left` / `clear-right` | `float-start`/`-end`, `clear-start`/`-end` |
| `scroll-pl-*` `scroll-pr-*` `scroll-ml-*` `scroll-mr-*` | `scroll-ps-*` `scroll-pe-*` `scroll-ms-*` `scroll-me-*` |

**Already logical in Tailwind v4 — leave them alone.** `px-*` (`padding-inline`), `mx-*`,
`inset-x-*`, `border-x-*`, `space-x-*` and `divide-x-*` are all flow-relative; `space-x-*` and
`divide-x-*` changed from physical in v3, so v3 habits mislead here. Block-axis utilities
(`rounded-t-*`, `border-b`, `py-*`, `mt-*`) and flex/grid alignment (`justify-end`, `items-start`,
`order-first`) are direction-invariant or already flow-relative.

**Two sanctioned exemptions.**
1. **An `rtl:`/`ltr:`-scoped utility** is a deliberate manual flip and is correct — it is the escape
   hatch for a rule no logical property can express. hope's calendar mirrors its chevrons with
   `rtl:[&_svg]:rotate-180`.
2. **An `rtl-ok: <reason>` comment** on the offending line (or the one above it), for a case neither
   a logical property nor an `rtl:` variant covers. Same philosophy as `expectNoA11yViolations`'
   `allowIncomplete` — name the specific case with a reason, never silence the category. A bare
   `rtl-ok:` with no reason does not count.

**Correctly physical, and deliberately out of scope.** `origin-left`/`origin-right` —
`transform-origin` has no portable logical keyword, so there is no replacement to point at.
`_base/_variants.css`'s `data-placement-left`/`data-placement-right` — `data-placement` reports the
side a floating layer *landed on* after `flip`, which is a physical fact, so the variant name matches
the attribute value it selects. And `createFloating` writes its computed coordinates to `left`/`top`:
`inset-inline-start` there would double-flip under RTL.

**The inline-relative placement pair.** For a recipe that does need "the side nearest where the text
starts" — a Select listbox's corner radius, a submenu's enter-slide — `_base/_variants.css` also
registers `data-placement-inline-start` / `data-placement-inline-end`. They are **derived**, not a
second attribute: each selects the physical value paired with `:dir()`, e.g.

```css
@custom-variant data-placement-inline-start (&:where([data-placement="left"]:dir(ltr), [data-placement="right"]:dir(rtl)));
```

so no component emits anything new and no JS tracks direction. `:dir()` is already this stack's
baseline — Tailwind v4 implements its own `rtl:`/`ltr:` as `&:where(:dir(rtl))`. The matching kernel
half is `createFloating`'s `side: "inline-start" | "inline-end"` option, which resolves against the
*floating* element's computed direction — the same call floating-ui's own `platform.isRTL` makes, so
there is one source of truth rather than two. Full decision:
`__internal__/reference-implementations.md` § createFloating.

**Enforced on both halves**, because neither alone is enough:

- `pnpm check:rtl-safety` (`scripts/check-rtl-safety.mjs`) scans this repo's source. Pass 1 reads
  string-literal interiors and matches whole tokens, so a comment naming `pr-8` cannot trip it;
  pass 2 reads the code projection for CSSOM writes (`.style.paddingRight = …`), which is how
  `createScrollLock` was compensating the scrollbar on the wrong edge in every RTL locale.
- `checkLogicalPropertyConformance` / `assertLogicalPropertyConformance`
  (`@hope-ui/theming/conformance`) run against a *resolved* recipe across its variant matrix, so
  they reach a **third-party preset** and a class only a `compoundVariant` assembles at call time.
  Each preset recipe test calls it beside `assertSlotRecipeConformance`.

The rule table is canonical in `PHYSICAL_UTILITIES` (`packages/theming/src/conformance.ts`); a drift
guard in that package's `conformance.test.ts` fails if the script's copy diverges.

**Not covered.** The scan reads `.ts`/`.tsx` under `packages/{presets,components,primitives}/src`
only — the three packages that author classes or write style properties. Directional CSS in a
preset's `theme.css` is on review, and `apps/docs` is outside the scan roots. `packages/theming` is
excluded on purpose: it authors no classes, and it holds the rule table itself, whose entries name
every forbidden utility as a string literal.

## Semantic token vocabulary

The other half of the contract: one design-system-agnostic set of role names every preset implements,
so a preset is a different set of values behind the same tokens. Raw scales come from Tailwind; each
`@hope-ui/presets/*` supplies the semantic values as `--hope-<token>` variables in its own
`theme.css`; components and recipes reference the names as Tailwind utilities (`bg-primary`,
`text-on-primary`).

The runtime source of truth is `SEMANTIC_COLOR_TOKENS`
([`semantic-tokens.ts`](../packages/theming/src/semantic-tokens.ts)); its `SemanticColorContract` type
is the canonical description. The **authoritative, current token list** — each token with the utility
it reads as — is the semantic-tokens reference in the doc website; this section is the design
rationale and cross-system provenance behind it, and the origin story is
[`semantic-color-token-redesign.md`](semantic-color-token-redesign.md).

**Name by identity, not context (the 5 rules).** A token carries `role + variant + state` and nothing
about *where* it sits.

1. The Tailwind prefix is the layer, so no token is ever a bare CSS property and utilities never
   double up (`text-text` / `border-border` / `ring-ring`).
2. Name by identity: `{role}-emphasis` is the role's legible *content* color (the
   soft/outline/ghost/link label, inline role text), while `on-{role}` names a context *only* for
   content on the solid fill.
3. Recipes never compute — no `color-mix`/alpha-modifier/hardcoded value; a derived color is a token
   authored in the preset's `theme.css` (`focus-halo`, `scrim`).
4. The overridability unit is `(role × variant × state)`: every variant owns its full rest /
   `-hovered` / `-pressed` ladder (press is a colorable state), nothing borrowed from a sibling.
5. Collection state splits `active` (transient) from `selected` (persistent), each with an `on-*`.

Standard text is the `foreground*` ramp; neutral borders are `subtle`/`strong`; the outline-variant
border is `{role}-line`; systemic is `focus`/`focus-halo`/`scrim`; the error role is `danger`.

The role *concepts* follow the Atlassian Design System's `property.role.modifier` shape
([foundations](https://atlassian.design/foundations/tokens/design-tokens),
[all tokens](https://atlassian.design/components/tokens/all-tokens)), re-spelled flat and
Tailwind-first (the opacity axis adapts Atlassian's opacity tokens). The set is a **superset** of five
systems' alias layers (MD3 color roles, Ant seed→map→alias, Fluent v9, Bootstrap 5.3, shadcn) that
maps down to each without losing MD3/Fluent nuance.

### The shape

- **Surfaces are an elevation concept, not a fill** — so a background surface is never a doubled
  `bg-bg`: `surface` (default page/card) · `surface-raised` (cards/menus, with its own
  `-raised-hovered`/`-raised-pressed` ladder) · `surface-overlay` (dialogs) · `surface-sunken` (wells)
  · `surface-inverse` (tooltips). → `bg-surface`.
- **Standard text is the `foreground*` ramp** on neutral surfaces: `foreground` → `foreground-muted` →
  `foreground-subtle`, plus `foreground-disabled`. Icons fold into these via `currentColor`; there is
  no separate `icon` family.
- **Roles** (`primary` · `neutral` · `success` · `info` · `warning` · `danger`) each carry a fully
  decomposed set: the solid fill `{role}` (also the full-strength border `border-{role}`) with a
  `-hovered`/`-pressed` ladder; the tonal fill `{role}-soft` with its own ladder; per-variant wash
  ladders `{role}-outline-hovered/-pressed` and `{role}-ghost-hovered/-pressed`; the outline-variant
  border `{role}-line` (chromatic only — `neutral` uses `border-strong`); the role content color
  `{role}-emphasis` (soft/outline/ghost/link label, inline role text → `text-{role}-emphasis`) with a
  link ladder `{role}-link-hovered/-pressed`; and `on-{role}` (content on the solid fill).
- **On-state text** (`on-*`, `text-*`): `on-inverse` (on `surface-inverse`, e.g. a tooltip),
  `on-active` (on the transient collection highlight), `on-selected` (on the persistent selection).
- **Neutral borders**: `subtle` · `strong` (`border-subtle`, `border-strong`) — emphasis levels only;
  no bare `border` token. A recipe tinting a disabled outline can reuse `border-subtle`.
- **Collection states**: `active` (transient — hover / roving / activedescendant) and `selected`
  (persistent — chosen), both `bg-*`, each paired with its `on-*` text above.
- **Disabled** has no fill token: a disabled control dims via the `opacity-disabled` axis rather than
  swapping to a background color. The disabled *label* still has `foreground-disabled`.
- **Systemic**: `focus` (the focus indicator → `ring-focus` / `border-focus`) · `focus-halo` (its
  translucent ring → `ring-focus-halo`, a preset-authored derived color) · `scrim` (the dimming layer
  behind modals, distinct from the `surface-overlay` the dialog sits on → `bg-scrim`).

**Pairing** (the readable-on rule): each fill owns its content color. The solid fill pairs with
`on-{role}`; the soft/outline/ghost/link variants label with `{role}-emphasis`; neutral surfaces pair
with the shared `foreground*` ramp; `on-inverse` is only the on-color for `surface-inverse`;
`on-active`/`on-selected` for the collection states. Per-fill content colors are what let every fill
stay readable in both themes — a single global "inverse" can't serve both the flipping neutrals *and*
the fixed chromatic fills, which is why `on-warning` is dark in both themes (white fails on amber).

So a primary button is `bg-primary text-on-primary hover:not-data-pressed:bg-primary-hovered
data-pressed:bg-primary-pressed` (the hope button recipe guards the hover wash against the pressed
state via `not-data-pressed`, so the two never fight); a soft error alert is `bg-danger-soft
text-danger-emphasis border-danger-line`.

The **opacity axis** — `opacity-disabled` and `opacity-loading` — is a separate contract from color:
Tailwind v4 has no `--opacity-*` namespace, so these reach utilities through `_base/_opacity.css`'s
`@utility` layer, and exist so a recipe never hardcodes a magic `opacity-90` (the hope button consumes
both — `data-disabled:opacity-disabled` and `aria-busy:opacity-loading`). hope ships
`opacity-disabled` at 0.4 and `opacity-loading` at 1 (the loader arc conveys the loading state, so the
content isn't dimmed); both are preset knobs a theme can retune.

### Token reference (110 color + 2 opacity)

The full, authoritative list with every utility is the semantic-tokens reference in the doc website;
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
`opacity-disabled`, `opacity-loading` (via `_base/_opacity.css`).

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
`--bs-tertiary-color` (MD3/shadcn ship two tiers → collapses ¹); `on-inverse` →
`inverse-on-surface` / — / `colorNeutralForegroundInverted` / — / —. `{role}-emphasis` and
`on-{role}` map to each system's on-fill/content colors — see Fills/Feedback below. Icons reuse the
text tones (no separate ramp; Fluent likewise has none).

**Borders** · `subtle` → `outline-variant` / `colorBorder` / `colorNeutralStroke1` /
`--bs-border-color` / `border`; `strong` → MD3 `outline` / `colorNeutralStrokeAccessible` / shadcn
`input`; `border-{role}` and `{role}-line` → Ant `colorErrorBorder` etc. / Fluent
`colorStatusDangerBorder1` / Bootstrap `--bs-danger-border-subtle`.

**Fills** (bare `primary`; every role identical)

| hope | MD3 | Ant | Fluent | Bootstrap | shadcn |
|---|---|---|---|---|---|
| `primary` (solid) | `primary` | `colorPrimary` | `colorBrandBackground` | `--bs-primary` | `primary` |
| ↳ `on-primary` | `on-primary` | `colorTextLightSolid` | `colorNeutralForegroundOnBrand` | `#fff` | `primary-foreground` |
| `primary-soft` | `primary-container` | `colorPrimaryBg` | `colorBrandBackground2` | `--bs-primary-bg-subtle` | — ² |
| ↳ `primary-emphasis` (soft label / inline) | `on-primary-container` | `colorPrimaryText` | `colorBrandForeground2` | `--bs-primary-text-emphasis` | — ² |
| `text-primary-emphasis` (on neutral) | `primary` | `colorPrimaryText` | `colorBrandForeground1` | `--bs-link-color` | `primary` |
| `border-primary-line` | `outline` | `colorPrimaryBorder` | `colorBrandStroke1` | `--bs-primary-border-subtle` | — |

Interaction states here **are** tokens (`{role}-hovered`/`-pressed` and the per-variant
soft/outline/ghost/link ladders) — where MD3 uses state-layer opacity overlays, Ant
`colorPrimaryHover`/`Active`, Fluent `…Hover`/`…Pressed`, Bootstrap Sass `tint/shade`, shadcn a `/90`
utility, hope resolves each to a finished shade so the recipe reads intent literally and never mixes
a color.

**Feedback** · `success`/`info`/`warning`/`danger`, each the same fill + `text-{role}-emphasis` (soft
label / inline) + `on-{role}` + `{role}-line`. Bootstrap 5.3's
`{color}`/`-bg-subtle`/`-border-subtle`/`-text-emphasis` maps 1:1 onto `danger` / `danger-soft` /
`danger-line` / `danger-emphasis`; Ant fills every state cell. **MD3 ships only `error`; shadcn only
`destructive`** — those themes derive the rest from palette (consistent with MD3's "add custom
colors"). Fluent has no `info` alias (borrows Blue). `on-warning` is dark in both themes (white fails
on amber).

**Scrim** · `scrim` → MD3 `scrim` / Ant `colorBgMask` / Fluent `colorBackgroundOverlay` / Bootstrap
`--bs-backdrop-bg`+`-opacity` (component-scoped) / shadcn `bg-black/80` (utility). Atlassian calls
this `color.blanket`; hope uses `scrim` to avoid colliding with `surface-overlay`.

¹ MD3/shadcn ship two neutral text tiers → `foreground-subtle` collapses to `foreground-muted`.
² shadcn has no brand-soft; `neutral`/`neutral-soft` stand in.

### Extension points (documented, out of the required core)

- **`surface-N` ladder** — numbered tonal elevation (`surface` = `surface-1`) for MD3/Fluent themes;
  flat themes alias each rung to the nearest anchor.
- **`secondary` / `tertiary`** — optional chromatic accent roles (same shape) for multi-hue themes;
  `neutral` (always present) is the gray filled role, avoiding MD3's `secondary`-means-a-hue clash.
- **extra emphasis tokens** (`-bold`, and other Atlassian-style prominence steps) — a theme may add
  these beyond the required set.
- **`chart-*` / `palette-*`** — decorative/categorical color; not role-based; out of contract.

A theme adds any of these as extra `--hope-*` variables (theme-private extras are swap-safe because
only that theme's recipes reference them); the conformance check polices only the required core.

### Decisions (resolved 2026-07-13)

| # | Decision | Resolution |
|---|---|---|
| 01 | Ergonomic default | bare `primary`/`danger`/… = solid fill; `-soft` = tonal fill; the soft/outline/ghost/link label is `{role}-emphasis` (role content color); `on-{role}` is only the solid-fill content color |
| 02 | State mechanism | every `(role × variant × state)` is its own finished token (`{role}-hovered`/`-pressed`, per-variant soft/outline/ghost/link ladders; press is colorable) — recipes never compute a color |
| 03 | Surface pairing | shared `foreground*` ramp across surfaces; per-surface override optional |
| 04 | Surface tiers | 5 named `surface*` anchors required (`surface-raised` carries a hovered/pressed ladder); `surface-N` ladder optional |
| 05 | Feedback scope | all four — `success` · `info` · `warning` · `danger` |
| 06 | Naming | `neutral` = gray role; `secondary`/`tertiary` = optional chromatic accents |
| 07 | Chart/decorative | out of contract → `chart-*` / `palette-*` |
| 08 | Disabled | no dedicated fill token — a disabled control dims via the `opacity-disabled` axis (0.4); `foreground-disabled` (text) + `border-subtle` (border) remain for a recipe that still wants a grayed treatment. The reference hope button dims via `opacity-disabled` alone (loading via `opacity-loading` on `aria-busy`) |
| 09 | Casing | flat kebab-case names; preset ships `--hope-<token>`, color `@theme inline` maps to `--color-<token>`, opacity via `@utility` (no `--opacity-*` namespace in Tailwind v4) |
| 10 | Reference preset | shadcn-flavored baseline shipped as the default `@hope-ui/presets/hope` |
| 11 | Recipe purity | recipes reference *finished* tokens only — no `color-mix`, alpha modifier (`bg-x/50`), or magic opacity (`opacity-90`); derived colors (`focus-halo`, `scrim`) are authored in the preset's `theme.css`. Enforced by `pnpm check:recipe-purity` |
| 12 | Opacity axis | `opacity-disabled` (0.4) / `opacity-loading` (1 in hope — the loader arc conveys the state) — a separate contract (`SEMANTIC_OPACITY_TOKENS`) so recipes never hardcode a magic opacity; adapts Atlassian's opacity tokens |
| 13 | RTL-aware recipes | a recipe emits **logical** directional utilities only — `ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`/`border-s`/`rounded-s`/`text-start`, never their `l`/`r` physical twins. An `rtl:`/`ltr:` variant is the sanctioned manual flip; `rtl-ok: <reason>` the named escape hatch. Enforced by `pnpm check:rtl-safety` **and** `assertLogicalPropertyConformance` |
| — | Naming source | Atlassian `property.role.modifier`, re-spelled flat + Tailwind-first: `surface-*` (elevation), `foreground*` + `{role}-emphasis`/`on-*`, `scrim` |

## SSR / hydration

Class names are pure, deterministic mappers, so server and client produce identical markup
(`hash: false` makes them byte-identical). `ThemeProvider` renders no DOM of its own — but **wrapping
a subtree in it shifts that subtree's hydration keys (`_hk`)**, so a component's SSR fixture and its
hydration test must both include `<ThemeProvider>` identically.

## Current state

The contract and the default preset `@hope-ui/presets/hope` are built on **Tailwind v4 +
`tailwind-variants`**. `hope` ships the full semantic-token structure, enforced by
`checkSemanticTokenConformance`, and a `tv` slot recipe per styled component (registered as-is — a
`tv` recipe *is* the `SlotRecipeFn` shape, no adapter). Done/deferred breakdown:
[`roadmap.md`](roadmap.md).
