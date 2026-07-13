# hope-ui theming

How a hope-ui component gets its styling, and how a theme provides it. This is the orientation
doc; per-symbol API detail lives in the per-file usage docs under `docs/usage/theming/`, and
the full rationale (the multi-theme feasibility analysis) is in the approved plan referenced from
`CLAUDE.md`.

## The two axes

Theming spans two package axes that never mix dependencies:

- **Runtime** (imported into app code; peer deps `solid-js` / `@solidjs/web`):
  `@hope-ui/primitives` ← `@hope-ui/theming` ← `@hope-ui/components`.
- **Config** (consumed by the *consumer's* `panda.config.ts` + `panda codegen`; peer dep
  `@pandacss/dev`): `@hope-ui/themes/{base,chakra,nova,…}` (`chakra` is the default the library is
  built and demoed against). Each theme depends *up* on `@hope-ui/theming` for the contract types.

`@hope-ui/theming` is the dependency-inversion seam: components read from it, themes implement it,
and neither knows about the other.

## The contract (`@hope-ui/theming`)

- **`ThemeProvider` / `useRecipe`** — a `ThemeProvider` injects a **theme** (a map of recipe name →
  pure recipe function) into context; a component reads one out with
  `const recipe = useRecipe("<name>")` and computes its class(es) in a getter. Built on the
  isomorphic `createComponentContext`, so it is server-readable during `renderToStringAsync` —
  which is the whole of "works in SolidStart" for theming.
- **`ThemeRecipes`** — an **empty, augmentable** registry. It seeds no component names and no
  variant vocabulary; a recipe becomes reachable only once a component or theme registers it.
- **`SlotRecipeFn<Variants, Slot = "root">`** — **every recipe is a slot recipe.** There is no
  single-class recipe form: a one-part component uses the `root` slot, so a caller always deals in
  `recipe(props).<slot>`, never a bare string for some components and a record for others.
- **`THEMING_CONTRACT_VERSION`** — a constant themes assert against to catch preset↔contract drift.
- **`@hope-ui/theming/conformance`** — a generic runtime kit
  (`checkSlotRecipeConformance` / `assertSlotRecipeConformance`) a theme runs post-`codegen` to
  prove each recipe actually emits a class for every slot at every variant combination it declares.

Theme is chosen at **codegen time**; runtime theme-switching is out of scope (two ejected presets
would collide on recipe names, or namespacing would ship every theme's CSS in one bundle).

## Adding a component (the shape to follow)

1. Design the component's variants and slots — its own decision, no shared vocabulary is imposed.
2. Register its recipe on the contract by augmentation:
   ```ts
   declare module "@hope-ui/theming" {
     interface ThemeRecipes {
       accordion: SlotRecipeFn<{ size?: "sm" | "md" }, "root" | "item" | "trigger">;
     }
   }
   ```
3. In the component, compute `class` in a getter from `useRecipe("accordion")(props).<slot>` — the
   `box.tsx` pattern — and render through `renderElement` for `as`/`render` polymorphism.
4. Add the matching recipe (a Panda slot recipe with `jsx` hints, internal state authored as
   conditions **nested inside** consumer-facing variants — never a top-level `state` axis) to each
   theme preset under `@hope-ui/themes/*`.

## Adding a theme

A theme is a Panda preset built on `@hope-ui/themes/base` plus its own `semanticTokens` (the
vocabulary below) and, once components exist, its own slot recipes (same slots and variant *values*
as every other theme — only the emitted CSS differs). First-party themes are subpaths of
`@hope-ui/themes` (`@hope-ui/themes/chakra` — the default — `@hope-ui/themes/nova`, …); a third
party publishes its own package implementing the same contract. For the recipe *functions* the
provider injects, prefer bundling the theme's own generated recipe runtime under a `hash: false` /
no-prefix contract (so the class names equal the consumer's own codegen), exactly as
`@hope-ui/styled-system` bundles `css()` today.

**The swap-safety rule: augment `base`, never add a theme-local token.** Theme is chosen at codegen
time and components reference token *names*, so a token key one theme has and another lacks compiles
to an unresolved `var(--…)` the moment the preset is swapped. Therefore a theme only overrides the
*values* of keys `base` already declares; a genuinely new token (e.g. Chakra's `2xs` radii/font-size
rung, its `label`/`none` textStyles, its `heading` font) is added to `base`, so **every** theme
inherits it. This is enforced, not just documented: `base`'s raw-token literals are written
`defineTokens.x({ … } satisfies XContract)` and a theme's `theme.extend.tokens` override object is
typed `satisfies ThemeTokenOverride` (both from `@hope-ui/themes/base`, defined in
`base/contracts/token-contract.ts`) — a missing key fails assignability, a foreign/typo'd key fails the
object-literal excess-property check. `BaseTokenContract` is the raw-token analog of
`SemanticColorContract`; together they make any two presets swap-compatible by construction.

`base` stays font-neutral (system-UI stacks); it exposes both `fonts.sans` and `fonts.heading` (same
value) so a display-face theme overrides just `heading`. A future Chakra component/recipe port maps
Chakra's font roles onto base keys: **Chakra `heading` → base `fonts.heading`, Chakra `body` → base
`fonts.sans`** (Inter is deferred — a theme may later override those values).

## Semantic token vocabulary

The recipe contract above imposes no *token* vocabulary. This is the other half: the **semantic
(alias) color contract** — one design-system-agnostic set of role names every theme implements, so a
theme is a different set of values behind the same tokens. It is the token analog of the recipe
contract's "same slots and variant values, only the CSS differs": `base` carries only raw palette
ramps; each `@hope-ui/themes/*` supplies the semantic values; components and recipes reference the
names. Every theme's `colors` is typed `satisfies SemanticColorContract` (exported from
`@hope-ui/themes/base`), so a missing, misspelled, or extra token fails `tsc` instead of compiling
to a broken `var(--colors-…)`. Reference implementation:
[`nova/tokens/semantic-tokens.ts`](../packages/themes/src/nova/tokens/semantic-tokens.ts).

Naming follows the Atlassian Design System's `property.role.modifier` shape
([foundations](https://atlassian.design/foundations/tokens/design-tokens),
[all tokens](https://atlassian.design/components/tokens/all-tokens)), adapted for brevity (no
`elevation.`/`color.` foundation prefix). The set was designed as a **superset** of five systems'
alias layers (MD3 color roles, Ant seed→map→alias, Fluent v9, Bootstrap 5.3, shadcn) that maps down
to each without losing MD3/Fluent nuance.

### The shape

- **Surfaces are an elevation concept, not a fill** — so a background surface is never a doubled
  `bg.bg`: `surface` (default page/card) · `surface.raised` (cards/menus) · `surface.overlay`
  (dialogs) · `surface.sunken` (wells) · `surface.inverse` (tooltips). → `bg="surface"`.
- **Foreground splits into `text.*` and `icon.*`** (icons often want a different tone than body
  text). Neutral emphasis ramps `text` → `text.subtle` → `text.subtlest`, plus `text.disabled` and
  `text.inverse` (text on the inverse *surface*). Each role is a **group** under `text`/`icon`:
  `text.<role>` (the role color as standalone text on a neutral surface — a link, an inline error),
  `text.<role>.foreground` (text on the role's SOLID fill), `text.<role>.subtle.foreground` (text on
  the role's SUBTLE fill). `icon.*` mirrors it. Roles, in order: `primary` · `neutral` · `success` ·
  `info` · `warning` · `destructive`.
- **Borders**: `border` · `border.bold` · `border.disabled` + `border.<role>`.
- **Fills stay role-first and bare** so the common case is short (decision 01): `bg="primary"`,
  `bg="destructive"`, `bg="destructive.subtle"`. Each role is `{ DEFAULT (solid fill),
  subtle (tonal fill) }`.
- **Systemic**: `ring` (focus indicator) · `scrim` (the dimming layer behind modals — distinct from
  the `surface.overlay` the dialog itself sits on).

**Pairing** (the readable-on rule): each fill owns its on-color. Text on a role's solid fill is
`text.<role>.foreground` (icons `icon.<role>.foreground`); text on its subtle fill is
`text.<role>.subtle.foreground`. Neutral surfaces pair with the shared `text.*` ramp; `text.inverse`
is only the on-color for the inverse *surface* (tooltip). Per-fill on-colors are what let every fill
stay readable in both themes — a single global "inverse" can't serve both the flipping neutrals *and*
the fixed chromatic fills, which is why e.g. `warning`'s on-solid foreground is dark in both themes.

So a primary button is `bg="primary"` + `color="text.primary.foreground"`; a soft error alert is
`bg="destructive.subtle"` + `color="text.destructive.subtle.foreground"` + `borderColor="border.destructive"`.

**States**: `.hovered` / `.pressed` / `.bold` are contract-reserved but unpopulated in the baseline —
recipes derive interaction states from `color-mix` + an `opacity.*` scale (decision 02). Disabled is
`text.disabled` / `border.disabled` + `opacity.disabled` (decision 08). Nested keys stay dotted and
Panda emits the dashed CSS var: `text.destructive.subtle.foreground` →
`--colors-text-destructive-subtle-foreground` (decision 09).

### Token reference (nova values, light → dark intent)

| token | purpose |
|---|---|
| `surface` · `.raised` · `.overlay` · `.sunken` · `.inverse` | page/card · elevated · dialog · well · tooltip |
| `text` · `.subtle` · `.subtlest` · `.disabled` · `.inverse` | body → faint text; disabled; text on the inverse surface |
| `text.<role>` · `.foreground` · `.subtle.foreground` | role text on neutral; text on the role's solid fill; text on its subtle fill |
| `icon` · `.subtle` · `.disabled` · `.inverse` · `.<role>{,.foreground,.subtle.foreground}` | icon ramp, mirrors `text` |
| `border` · `.bold` · `.disabled` · `.<role>` | default → strong border; role-colored border |
| `primary` · `neutral` · `success` · `info` · `warning` · `destructive` (+ each `.subtle`) | solid fill + tonal fill |
| `ring` · `scrim` | focus indicator · modal dimming layer |

### Cross-system mapping

`—` = no equivalent; footnotes flag lossy/approximate mappings.

**Surfaces**

| standardized | MD3 | Ant | Fluent | Bootstrap | shadcn |
|---|---|---|---|---|---|
| `surface` | `surface` | `colorBgContainer` | `colorNeutralBackground1` | `--bs-body-bg` | `background` / `card` |
| `surface.raised` | `surface-container-high` | `colorBgElevated` | `colorNeutralCardBackground` | — | `popover` |
| `surface.overlay` | `surface-container-highest` | `colorBgElevated` | `colorNeutralBackground1` | — | `popover` |
| `surface.sunken` | `surface-container` / `surface-dim` | `colorBgLayout` | `colorNeutralBackground3` | `--bs-tertiary-bg` | `muted` |
| `surface.inverse` | `inverse-surface` | `colorBgSpotlight` | `colorNeutralBackgroundInverted` | — | — |

**Foreground** · `text` → MD3 `on-surface` / Ant `colorText` / Fluent `colorNeutralForeground1` /
Bootstrap `--bs-body-color` / shadcn `foreground`; `text.subtle` → `on-surface-variant` /
`colorTextSecondary` / `colorNeutralForeground2` / `--bs-secondary-color` / `muted-foreground`;
`text.subtlest` → Ant `colorTextTertiary` / Fluent `colorNeutralForeground3` /
`--bs-tertiary-color` (MD3/shadcn ship two tiers → collapses ¹); `text.inverse` (on the inverse
surface) → `inverse-on-surface` / — / `colorNeutralForegroundInverted` / — / —. The per-role on-fill
foregrounds (`text.<role>.foreground`, `.subtle.foreground`) map to each system's on-fill colors —
see Fills/Feedback below. `icon.*` → Fluent has no separate icon ramp; the rest reuse the text tones.

**Borders** · `border` → `outline-variant` / `colorBorder` / `colorNeutralStroke1` /
`--bs-border-color` / `border`; `border.bold` → MD3 `outline` / `colorNeutralStrokeAccessible` /
shadcn `input`; `border.<role>` → Ant `colorErrorBorder` etc. / Fluent `colorStatusDangerBorder1` /
Bootstrap `--bs-danger-border-subtle`.

**Fills** (bare `primary`; every role identical)

| standardized | MD3 | Ant | Fluent | Bootstrap | shadcn |
|---|---|---|---|---|---|
| `primary` (solid) | `primary` | `colorPrimary` | `colorBrandBackground` | `--bs-primary` | `primary` |
| ↳ `text.primary.foreground` | `on-primary` | `colorTextLightSolid` | `colorNeutralForegroundOnBrand` | `#fff` | `primary-foreground` |
| `primary.subtle` | `primary-container` | `colorPrimaryBg` | `colorBrandBackground2` | `--bs-primary-bg-subtle` | — ² |
| ↳ `text.primary.subtle.foreground` | `on-primary-container` | `colorPrimaryText` | `colorBrandForeground2` | `--bs-primary-text-emphasis` | — ² |
| `text.primary` (on neutral) | `primary` | `colorPrimaryText` | `colorBrandForeground1` | `--bs-link-color` | `primary` |
| `border.primary` | `outline` | `colorPrimaryBorder` | `colorBrandStroke1` | `--bs-primary-border-subtle` | — |
| `.hovered`/`.pressed` (reserved) | state layer ³ | `colorPrimaryHover`/`Active` | `…Hover`/`…Pressed` | Sass `tint/shade` | `/90` utility |

**Feedback** · `success`/`info`/`warning`/`destructive`, each the same fill + `text.<role>` (+
`.foreground` / `.subtle.foreground`) + `border.<role>`. Bootstrap 5.3's
`{color}`/`-bg-subtle`/`-border-subtle`/`-text-emphasis` maps 1:1 onto
`destructive` / `destructive.subtle` / `border.destructive` / `text.destructive.subtle.foreground`;
Ant fills every state cell. **MD3 ships only `error`; shadcn only `destructive`** — those themes
derive the rest from palette (consistent with MD3's "add custom colors"). Fluent has no `info` alias
(borrows Blue). `warning`'s on-solid foreground (`text.warning.foreground`) is dark in both themes
(white fails on amber).

**Scrim** · `scrim` → MD3 `scrim` / Ant `colorBgMask` / Fluent `colorBackgroundOverlay` / Bootstrap
`--bs-backdrop-bg`+`-opacity` (component-scoped) / shadcn `bg-black/80` (utility). Atlassian calls
this `color.blanket`; we use `scrim` to avoid colliding with `surface.overlay`.

¹ MD3/shadcn ship two neutral text tiers → `subtlest` collapses to `subtle`. ² shadcn has no
brand-subtle; `neutral`/`neutral.subtle` stand in. ³ MD3 uses state-layer *opacity overlays*, not
tokens.

### Extension points (documented, out of the required core)

- **`surface.N` ladder** — numbered tonal elevation (`surface` = `surface.1`) for MD3/Fluent themes;
  flat themes alias each rung to the nearest anchor.
- **`secondary` / `tertiary`** — optional chromatic accent roles (same shape) for multi-hue themes;
  `neutral` (always present) is the gray filled role, avoiding MD3's `secondary`-means-a-hue clash.
- **`.bold` / `.bolder` fill emphasis** and **`.hovered` / `.pressed` states** — Atlassian-style
  discrete tokens a theme may add when `color-mix` isn't good enough.
- **`chart.*` / `palette.*`** — decorative/categorical color; not role-based; out of contract.
- **`opacity.*`** — the state-layer scale (`hover .08`, `focus .10`, `pressed .12`, `disabled .40`),
  a base-token group recipes consume via `color-mix`; added to `base` when the first recipe lands.

### Decisions (resolved 2026-07-13)

| # | Decision | Resolution |
|---|---|---|
| 01 | Ergonomic default | bare `primary`/`destructive`/… = solid fill; `.subtle` = tonal fill; on-colors live under `text.<role>`/`icon.<role>` |
| 02 | State mechanism | `color-mix` + `opacity.*` baseline; `.hovered`/`.pressed`/`.bold` optional overrides |
| 03 | Surface pairing | shared `text.*` ramp across surfaces; per-surface override optional |
| 04 | Surface tiers | 5 named `surface.*` anchors required; `surface.N` ladder optional |
| 05 | Feedback scope | all four — `success` · `info` · `warning` · `destructive` |
| 06 | Naming | `neutral` = gray role; `secondary`/`tertiary` = optional chromatic accents |
| 07 | Chart/decorative | out of contract → `chart.*` / `palette.*` |
| 08 | Disabled | `text.disabled`/`border.disabled` + `opacity.disabled`; dedicated fill tokens optional |
| 09 | Casing | dot-nested, camelCase leaves; Panda emits dashed CSS var |
| 10 | Reference theme | shadcn preset re-expressed as `@hope-ui/themes/nova` |
| — | Naming source | Atlassian `property.role.modifier`: `surface.*` (elevation), split `text.*`/`icon.*` with per-role on-fill foregrounds, `scrim` |

## SSR / hydration

Class names are pure, deterministic mappers, so server and client produce identical markup
(`hash: false` makes them byte-identical). `ThemeProvider` renders no DOM of its own — but
**wrapping a subtree in it shifts that subtree's hydration keys (`_hk`)**, so a component's SSR
fixture and its hydration test must both include `<ThemeProvider>` identically.

## Current state

The contract and `@hope-ui/themes/{base,chakra,nova}` are built. **`chakra` is the default** the
styled-system runtime is generated from (a Chakra-UI-v3-like look in hope's own semantic
vocabulary); `nova` is the shadcn-derived sibling, kept in place but no longer the baseline. Both
ship tokens only (no recipes yet), expressed in the standardized semantic-token vocabulary above and
enforced by `SemanticColorContract`; their raw-token surface is guarded by `BaseTokenContract`. No
components consume `useRecipe` yet — recipes arrive per-component as each is designed. See the
plan's "Implementation status & decisions" for the full done/deferred breakdown.
