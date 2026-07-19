# Design: a TypeScript-first "preset" theming API

> **Partially superseded (2026-07).** The **token-values** half of this design was implemented and
> then removed. Semantic tokens are no longer authored in TypeScript or delivered by a runtime
> `<style>`: `@hope-ui/presets/hope` authors its `--hope-*` values in CSS (`src/hope/tokens.css`,
> imported by `tailwind.css`), and `ThemeProvider` is **zero-DOM**. So `PresetTokens`, `TokenValue`,
> `ColorTokenKey`, `DarkMode`, the `tokens`/`darkMode` fields on `Preset`/`PresetConfig`, and
> `renderPresetStyle`/`token-css.ts` (the "D3" runtime `<style>` and the `@source "./index.ts"`
> palette trick below) **no longer exist**. The **component-override** half — `definePreset`,
> per-component `defaultVariants`, and `slotClasses` — shipped and remains current. Sections describing
> the removed token API are kept below as design history; the authoritative current model is
> [`__internal__/theming.md`](./theming.md).

## Context

Today a hope-ui "theme" spans two axes that never share a dependency: a **CSS axis**
(`@import "@hope-ui/themes/hope"` → `--hope-*` custom properties + `@theme inline` mapping +
`@source "./recipes"`) and a **runtime axis** (`<ThemeProvider theme={hopeRecipes}>`, a
`RecipeRegistry` map of `name → tailwind-variants` recipe read via `useRecipe("button")`). Three
gaps make reskinning painful:

1. **Overriding semantic tokens means hand-editing CSS** — no IntelliSense, no type-checking, a
   typo silently compiles to an unresolved `var()`, and the light/`.dark` split is manual.
2. **No global component defaults** — a consumer can't say "every Button defaults to `size: 'sm'`."
3. **No slot-class injection** — global or per-instance; the only per-instance hook is `class`,
   which reaches only the `root` slot.

This design adds a **type-safe preset API**: a consumer authors a preset — a base preset plus typed
overrides for tokens, component default variants, and slot classes — with full IntelliSense, and
passes it to `ThemeProvider`. Plus a matching per-instance `slotClasses` prop on components.

Grounded in the current source: `theme-context.tsx` (context-only provider),
`recipes/{registry,button,slot-recipe}.ts`, `semantic-tokens.ts` (the fixed 55-token vocabulary),
`styling.ts` (`tv`/`cn`/`cx`), `themes/src/hope/{tokens.css,recipes/}`, `_base/{variants,theme-map}.css`,
and `components/src/button/button.tsx`.

> **Revised per user review.** Key redirections from the first draft: (a) the concrete-theme package
> is **renamed `@hope-ui/themes` → `@hope-ui/presets`** and its CSS entry made explicit
> (`.../hope/tailwind.css`); (b) `ThemeProvider`/`ThemeContext` names are **kept** (a preset *is* a
> "theme preset"); (c) token keys are **camelCase**, values are **`--color-*` references**, for JS/TS ergonomics;
> (d) the recipe's `loading` axis is a **pre-existing API flaw** and is fixed, which lets
> `defaultProps` become **`defaultVariants` typed straight from the recipe's tv variants** — the
> separate `DefaultableProps` contract is dropped; (e) two small utilities (`useDefaults`,
> `useSlots`) keep component code from hand-rolling merge chains.

---

## Decisions (resolved)

### D1 — Rename to `@hope-ui/presets`; a Preset owns everything; `hope` is a preset

- **`@hope-ui/theming` keeps its name** — it's the *contract + runtime machinery* (`ThemeProvider`,
  `useRecipe`, `definePreset`, the `Preset` types, `tv`, the token vocabulary). `definePreset` lives here.
- **`@hope-ui/themes` → `@hope-ui/presets`** (directory `packages/themes` → `packages/presets`) — the
  *concrete presets* (hope) and their CSS. Naming symmetry: `theming` = the machinery, `presets` = the
  instances.
- **A `Preset` owns everything the runtime needs:** `recipes` (a `RecipeRegistry`) **plus** typed
  overrides (`tokens`, `components`, `darkMode`). There is no longer a bare `RecipeRegistry` at the
  provider boundary. `RecipeRegistry` is demoted to an internal building block — the type of a
  preset's `recipes` field and the seam for registering a component.
- **`hope` is a preset**, exported from `@hope-ui/presets/hope` (JS), built internally with
  `definePreset` over the raw `hopeRecipes` map (both are exported; the raw map is used for
  bootstrapping and conformance tests).
- **CSS import is explicit:** `@import "@hope-ui/presets/hope/tailwind.css";` (renamed from
  `theme.css`, and imported by an explicit path so the content is unambiguous). It still delivers the
  base `--hope-*` layer, the `@theme inline` mapping, and `@source "./recipes"`. The preset owns
  token **value overrides** layered on top, default variants, and class composition — the CSS build
  still owns utility generation and the base token layer.
- **`ThemeProvider` prop is `preset`** (breaking rename from `theme`; acceptable pre-1.0 — see
  [[no-changesets-until-stable]]). **`ThemeProvider` and `ThemeContext` names are kept** (a preset is
  a theme preset). Error copy updated to say "preset".
- **`definePreset(base, config)` derives a preset from a base preset.** `base` is normally a `Preset`
  (`hope`); theme authors bootstrap a *root* preset by passing the raw `RecipeRegistry` map (the one
  place a registry is passed).

### D2 — Token overrides: ergonomic camelCase keys, `--color-*` references, per-token `{light,dark?}`, nested `radii`

```ts
tokens: {
  colors: {
    primary:      { light: "--color-violet-600", dark: "--color-violet-400" }, // palette var ref → var(--color-violet-600)
    warningSoft:  "--color-amber-100",                                        // camelCase key; string = both modes
    onPrimary:    { light: "#fff" },                                          // raw color; dark omitted → inherits base
    foregroundMuted: { light: "--color-mauve-600", dark: "--color-mauve-400" },
  },
  radii: { base: "0.5rem" },                                    // → --hope-radii-base (extensible)
}
```

- **camelCase keys**, derived from the fixed kebab `SemanticColorToken` vocabulary via a
  `KebabToCamel` template-literal type — **still a closed union**, so a typo is a compile error
  (constraint #3 preserved) *and* no quoting is needed. Normalized back to `--hope-<kebab>` on emit.
  *(Interpretation of "not ergonomic JS/TS": the objection is kebab keys needing quotes, not
  type-safety — so we keep the closed union + IntelliSense and switch to camelCase. Flagged for
  confirmation.)*
- **`--color-*` references:** a value starting with `--` (`"--color-violet-500"`) is wrapped to
  `var(--color-violet-500)`; values starting with `var(`/`#`/`rgb(`/`oklch(`/… pass through raw. This
  is deliberately explicit rather than a `"hue.step"` shorthand: the literal `--color-*` string then
  lives in the preset's build-scanned source, so Tailwind keeps that palette var instead of
  tree-shaking it — a runtime-only `var(--color-…)` the compiler never sees would otherwise resolve
  to nothing. A consumer preset gets this for free (its token source is auto-scanned); the shipped
  `hope` preset declares `@source "./index.ts"` in its `tailwind.css` because its tokens ship inside
  the installed package.
- **Per-token `{ light, dark? }` + string shorthand** (string = both modes). `dark` omitted → **no
  `.dark` override emitted** for that token → inherits the base theme's dark value.
- **Radii are nested and extensible:** `tokens.radii.base` → `--hope-radii-base`, leaving room for
  more radius keys later (a small `RadiusToken` union, `"base"` for now). Requires renaming the CSS
  knob `--hope-radius` → `--hope-radii-base` (Phase 4).

### D3 — Token delivery: runtime server-rendered `<style>`, injected only when overrides exist (user-chosen)

> **Removed.** This runtime-`<style>` mechanism (and the `@source "./index.ts"` trick above that it
> required) was implemented and later removed — tokens now live in a preset's CSS and `ThemeProvider`
> is zero-DOM. See the banner at the top and [`__internal__/theming.md`](./theming.md). Kept as history.

`ThemeProvider` renders a **deterministic `<style>`** derived purely from the preset:
`:root{--hope-primary:VAL;--hope-radii-base:VAL}.dark{--hope-primary:DARKVAL}`.

- **Rendered in the component body, not an effect** → present before first paint (no FOUC); inline in
  the SSR stream.
- **Byte-stable:** declarations emitted in the fixed `SEMANTIC_COLOR_TOKENS` order (never object-key
  order), no whitespace variance → server output === client output → no hydration mismatch.
- **Zero-DOM when empty:** a preset with **no** token overrides produces `""`, and the provider
  returns the *exact* today tree (`<ThemeContext value>{children}</ThemeContext>`) — structurally
  identical, so a component's hydration fixture is unaffected. The branch is on a static value, so
  server and client always agree. (The theming package's own tests exercise this empty case.)
- Global scope (`:root`/`.dark`), consistent with `tokens.css`. Declarative → Solid-lifecycle-managed,
  no module-scope state (constraint #6).

Rejected: build-time codegen (adds a build step, breaks the "author in TS, pass to provider" ergonomic)
and inline vars on a wrapper (a single inline `style` can't express the `.dark` split; injects a wrapper).

> **Post-approval deviation — `hope` authors its palette in TS.** The original plan (D1/D3) kept
> `hope`'s token *values* in `tokens.css` so `hope.tokens` was empty and `hope` took the zero-DOM
> branch. That was later reversed by request: `hope` now authors its full 52-token palette in
> TypeScript (`hopeTokens` in `packages/presets/src/hope/index.ts`), exactly like a user-defined
> preset — so `hope.tokens` is the palette (not `{}`), `renderPresetStyle(hope.tokens, …)` is
> non-empty, and `<ThemeProvider preset={hope}>` inlines a token `<style>`. The zero-DOM branch
> above is unchanged; `hope` simply no longer takes it. `tokens.css` keeps only the `@theme` radius
> scale; `_base/theme-map.css` still generates the utilities.

### D4 — `slotClasses` (name), composed by a `useSlots` utility

- **Name is `slotClasses`** for both the preset (global) and the per-instance component prop. The
  root-only `class` prop stays as a shorthand, applied last.
- **Per-slot record**, each slot a `ClassValue`, typed to the component's slot union. Static literals
  are the common case and are **fully Tailwind-scannable** in consumer source.
- **Function form (preset only):** `(variants) => Partial<Record<Slot, ClassValue>>`, receiving the
  recipe's **variant props**. Loud doc warning (constraint #2): only literal class *substrings* inside
  the function are scannable; constructed strings (`` `px-${n}` ``) are not generated.
- Composition is done by the **`useSlots` utility** (D5), not hand-written `cx` per slot.

### D5 — Fix the recipe `loading` flaw → `defaultVariants` from tv variants; drop `DefaultableProps`

> **Reversed in part (2026-07).** The override is no longer variants-only `defaultVariants`. It was
> renamed to **`defaultProps`** and re-typed to a **curated themeable-props surface** —
> `ThemeablePropsOf<K>`, which resolves to a per-component `<Component>ThemeableProps` type (recipe
> variants **plus** durable behavioral policy + component chrome content) registered in a new
> type-only `ThemeablePropsRegistry`, else falls back to `RecipeVariantsOf<K>`. This revives a
> **scoped** version of the `DefaultableProps`/`DefaultablePropsRegistry` idea D5 dropped, but
> declared in `@hope-ui/theming` itself (**no** module augmentation — which would degrade silently in
> the presets package and theming tests, where component types are out of scope), non-exhaustive (the
> `RecipeVariantsOf` fallback keeps it incremental), and curated (behavioral policy + chrome content,
> never full `Partial<ComponentProps>`). Chrome content is a reuse-safe factory (`() => JSX.Element`).
> The `slotClasses` function-form input widened to `ThemeablePropsOf<K>` too. The recipe `loading` →
> `loaderPlacement` fix below is unchanged and still current. Authoritative model:
> [`__internal__/theming.md`](./theming.md) and the `ThemeablePropsRegistry` reference in the doc
> website (`apps/docs/`). The rest
> of this section is kept as design history — the reasoning that made `RecipeVariantsOf` a clean
> subset of component props is exactly what let the surface widen cleanly.

The recipe's `loading` axis (`none|center|start|end`, with `none → loader: "hidden"`) is a
**pre-existing API design flaw**: showing/hiding the loader slot is the **component's** job (it already
wraps the loader in `<Show when={isLoading()}>`), not CSS's. Fixing it:

- Rename the recipe variant `loading` → **`loaderPlacement`** with values **`start | center | end`**
  (drop `none`; drop `loader: "hidden"`). It owns *layout only* (center overlay hides the label via
  `label: opacity-0`; start/end set loader order). The component passes
  `loaderPlacement: isLoading() ? effectivePlacement() : undefined`, so loading layout applies only
  while loading.
- `ButtonLoaderPlacement` (`"start"|"center"|"end"`) moves into `theming/src/recipes/button.ts` and is
  now **shared** by the recipe variant *and* the component prop (component imports + re-exports it).
- Consequence: `RecipeVariantsOf<"button">` becomes a **clean subset of component props**
  (`variant`/`color`/`size`/`fullWidth`/`loaderPlacement`) — no `loading`-axis leak. So a preset's
  per-component defaults can be **typed straight from the recipe's tv variants**, and the separate
  `DefaultableProps` contract + `DefaultablePropsRegistry` from the first draft are **dropped entirely**.
- The override is named **`defaultVariants`** (not `defaultProps`) — accurate (it overrides the recipe's
  default variants app-wide) and parallel to tailwind-variants' own `defaultVariants`.

### D6 — Two object-form utilities so components don't hand-roll merges

Per review ("cumbersome at scale"), the merge chains are encapsulated in two utilities, each called
once. Both take an **options object with accessor-valued getters** — matching the repo's dominant
convention for composed primitives (`renderElement({ as, props, render, ref })`,
`createButton({ disabled: () => …, … })`, the `createDialog*` family). Named args are self-documenting,
safe against arg-swap (`props` vs `defaults` are both objects, so a positional form is swap-prone), and
extensible without positional churn. Both read the preset from context, so both use the `use*` prefix
(the earlier `withThemeDefaults` name becomes `useDefaults` for that consistency):

- **`useDefaults({ recipe, props, defaults })`** — applies preset `defaultVariants` then built-in
  defaults in one call (precedence: instance ?? preset ?? builtin). Returns the merged props (lazy
  getters) the component uses everywhere (not just for styling).
- **`useSlots({ recipe, variants, slotClasses?, class? })`** — returns ready-to-call per-slot class
  functions that already fold in the recipe base, preset `slotClasses`, instance `slotClasses`, and
  (root only) `class`.

`useRecipe` stays as the low-level seam; `useDefaults`/`useSlots` are the recommended standard pattern
for all components.

### D7 — `definePreset` optional; `Preset` is a branded object

`definePreset` is the ergonomic path (generic inference + normalization + brand). The brand is
`Symbol.for("hope-ui.preset")` — cross-realm, so a preset from one installed copy is recognized by
another (constraint #6) — used to distinguish `Preset` vs raw `RecipeRegistry` in `definePreset` and to
give a friendly error if a JS consumer passes a non-preset to `ThemeProvider`.

---

## Final TypeScript signatures

All new API is exported from the **`@hope-ui/theming` root barrel** (`src/index.ts`) — no new subpath.

### Button contract — `packages/theming/src/recipes/button.ts`

```ts
export type ButtonVariant = "default" | "solid" | "soft" | "outline" | "ghost" | "link";
export type ButtonColor = "primary" | "neutral" | "success" | "warning" | "danger" | "info";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonLoaderPlacement = "start" | "center" | "end"; // moved here; recipe + component share it
// ButtonLoading — DELETED (was the flawed axis)

export interface ButtonRecipeVariants {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  loaderPlacement?: ButtonLoaderPlacement; // layout only; component controls loader mount via <Show>
}

export type ButtonSlot = "root" | "label" | "startDecorator" | "endDecorator" | "loader";
export type ButtonRecipe = SlotRecipeFn<ButtonRecipeVariants, ButtonSlot>;
```

`registry.ts` is **unchanged** (`RecipeRegistry { button: ButtonRecipe }`,
`THEMING_CONTRACT_VERSION = 1`) — no `DefaultablePropsRegistry`.

### Preset types + `definePreset` — `packages/theming/src/presets/presets.ts`

> **Partly removed.** The token-values types below — `KebabToCamel`, `ColorTokenKey`, `TokenValue`,
> `RadiusToken`, `PresetTokens`, `DarkMode`, and the `tokens`/`darkMode` fields on `PresetConfig`/
> `Preset` — were deleted. `definePreset`/`isPreset`/`Preset`, the `RecipeVariantsOf`/`RecipeSlotsOf`/
> `SlotClasses`/`SlotClassesInput` helpers, and the `components` override machinery remain. See the
> banner at the top.

```ts
import type { ClassValue } from "tailwind-variants";
import type { SemanticColorToken } from "../semantic-tokens/semantic-tokens";
import type { RecipeRegistry } from "../recipes/registry";

export type RecipeVariantsOf<K extends keyof RecipeRegistry> = NonNullable<Parameters<RecipeRegistry[K]>[0]>;
export type RecipeSlotsOf<K extends keyof RecipeRegistry> = keyof ReturnType<RecipeRegistry[K]> & string;

export type SlotClasses<K extends keyof RecipeRegistry> = Partial<Record<RecipeSlotsOf<K>, ClassValue>>;
export type SlotClassesInput<K extends keyof RecipeRegistry> =
  | SlotClasses<K>
  | ((variants: RecipeVariantsOf<K>) => SlotClasses<K>);

// Ergonomic, type-safe color keys: camelCase of the fixed kebab vocabulary (closed union).
type KebabToCamel<S extends string> = S extends `${infer H}-${infer T}` ? `${H}${Capitalize<KebabToCamel<T>>}` : S;
export type ColorTokenKey = KebabToCamel<SemanticColorToken>; // "warningSoft" | "onPrimary" | "foregroundMuted" | …

export type TokenValue = string | { light: string; dark?: string };
export type RadiusToken = "base"; // extensible

export interface PresetTokens {
  colors?: Partial<Record<ColorTokenKey, TokenValue>>;
  radii?: Partial<Record<RadiusToken, string>>;
}

export type DarkMode = string /* selector, default ".dark" */ | "media" | "none";

export interface ComponentOverride<K extends keyof RecipeRegistry> {
  defaultVariants?: Partial<RecipeVariantsOf<K>>; // typed straight from the recipe's tv variants
  slotClasses?: SlotClassesInput<K>;
}
export type PresetComponentOverrides = { [K in keyof RecipeRegistry]?: ComponentOverride<K> };

export interface PresetConfig {
  darkMode?: DarkMode;
  tokens?: PresetTokens;
  components?: PresetComponentOverrides;
}

declare const PRESET_BRAND: unique symbol; // runtime = Symbol.for("hope-ui.preset")
export interface Preset {
  readonly [PRESET_BRAND]: true;
  readonly recipes: RecipeRegistry;
  readonly tokens: PresetTokens;              // normalized
  readonly components: PresetComponentOverrides;
  readonly darkMode: DarkMode;
}

/**
 * Derive a preset. `base` is normally a `Preset` (e.g. `hope`); theme authors bootstrap a root preset
 * by passing a raw `RecipeRegistry`. `config` deep-merges over the base (config wins): tokens
 * per-token, components per-component-per-field; darkMode = config ?? base ?? ".dark".
 */
export function definePreset(base: Preset | RecipeRegistry, config?: PresetConfig): Preset;
export function isPreset(value: unknown): value is Preset;
```

### Pure token-CSS renderer — `packages/theming/src/presets/token-css.ts`

> **Removed.** `token-css.ts` / `renderPresetStyle` were deleted along with the runtime `<style>`
> (D3). A preset's tokens are plain CSS now; there is nothing to render. Kept as history.

```ts
/**
 * Deterministic `<style>` text from a preset's tokens. Normalizes camelCase keys → `--hope-<kebab>`,
 * radii → `--hope-radii-<key>`, and `--color-*` references ("--color-violet-500" → var(--color-violet-500)).
 * Iterates SEMANTIC_COLOR_TOKENS in fixed order (byte-stable). "" when no overrides. Emits a
 * `.dark`/`@media` block only for tokens with a dark value; radii go in `:root`. Throws on values
 * with CSS-breaking chars (`{ } ; < >` / newlines).
 */
export function renderPresetStyle(tokens: PresetTokens, darkMode: DarkMode): string;
```

### Provider + consumption utilities — `packages/theming/src/theme-context/theme-context.tsx`

```ts
export interface ThemeProviderProps {
  preset: Preset;                 // renamed from `theme`; no longer a bare RecipeRegistry
  children?: JSX.Element;
}
export function ThemeProvider(props: ThemeProviderProps): JSX.Element;

export function useTheme(): Preset;                                   // the current preset (advanced)
export function useRecipe<K extends keyof RecipeRegistry>(key: K): RecipeRegistry[K]; // reads preset.recipes[key]

/** Preset defaultVariants + built-in defaults in one call: instance ?? preset ?? builtin. */
export interface UseDefaultsOptions<K extends keyof RecipeRegistry, P extends object, D extends Partial<P>> {
  recipe: K;
  props: P;
  defaults: D;
}
export function useDefaults<K extends keyof RecipeRegistry, P extends object, D extends Partial<P>>(
  options: UseDefaultsOptions<K, P, D>,
): WithDefaults<P, D>; // WithDefaults from @hope-ui/primitives/utils — keys in D become required

/** Ready-to-call per-slot class fns: recipe base + preset slotClasses + instance slotClasses + root `class`. */
export interface UseSlotsOptions<K extends keyof RecipeRegistry> {
  recipe: K;
  variants: Accessor<RecipeVariantsOf<K>>;
  slotClasses?: Accessor<SlotClasses<K> | undefined>; // instance overrides
  class?: Accessor<string | undefined>;               // root slot only, applied last
}
export function useSlots<K extends keyof RecipeRegistry>(
  options: UseSlotsOptions<K>,
): Record<RecipeSlotsOf<K>, () => string>;
```

### Component per-instance prop — `packages/components/src/button/button.tsx`

```ts
import type { ButtonColor, ButtonLoaderPlacement, ButtonSize, ButtonVariant, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useRecipe, useSlots } from "@hope-ui/theming";
export type { ButtonColor, ButtonLoaderPlacement, ButtonSize, ButtonVariant }; // re-export (no local decl)

export interface ButtonProps extends ButtonElementProps {
  // …existing props…
  slotClasses?: SlotClasses<"button">; // merged after recipe base + preset slotClasses, before `class`
}
```

Body simplifies to two utility calls:

```tsx
const merged = useDefaults({
  recipe: "button",
  props,
  defaults: { type: "button", nativeButton: true, variant: "default", size: "md",
              color: "primary", loaderPlacement: "center", loading: false, fullWidth: false },
});
const slots = useSlots({
  recipe: "button",
  variants: () => ({ variant: merged.variant, color: merged.color, size: merged.size,
                     fullWidth: merged.fullWidth, loaderPlacement: isLoading() ? effectivePlacement() : undefined }),
  slotClasses: () => merged.slotClasses,
  class: () => merged.class,
});
// usage: slots.startDecorator(), slots.label(), slots.endDecorator(), slots.loader();
// root: get class() { return slots.root(); }   // `class` folded in by useSlots
```
Add `"slotClasses"` to the `omit(...)` list so it isn't spread onto the DOM element.

### `hope` preset — `packages/presets/src/hope/index.ts`

```ts
export const hopeRecipes = { button: buttonRecipe } satisfies RecipeRegistry; // raw map (bootstrap + conformance)
const hopeTokens: PresetTokens = { colors: { /* 52 tokens, light+dark */ }, radii: { base: "0.625rem" } };
export const hope = definePreset(hopeRecipes, { tokens: hopeTokens });        // palette authored in TS
```

### Fixed `buttonRecipe` — `packages/presets/src/hope/recipes/button.ts`

`variants.loading` → `variants.loaderPlacement` (drop `none` + `loader: "hidden"`); drop `loading` from
`defaultVariants`:

```ts
loaderPlacement: {
  center: { label: "opacity-0", startDecorator: "opacity-0", endDecorator: "opacity-0", loader: "absolute inset-0 flex" },
  start:  { loader: "order-first" },
  end:    { loader: "order-last" },
},
// defaultVariants: { variant: "default", color: "primary", size: "md", fullWidth: false }  // no `loading`
```

---

## Merge precedence (defined + defended)

**Default variants** — `built-in → preset defaultVariants → instance prop`, via `useDefaults`,
which internally nests `withDefaults(withDefaults(props, presetDefaultVariants(key)), builtins)`.
`withDefaults` resolves each key with `??`, yielding `instance ?? preset ?? builtin`, with lazy getters
(Solid 2.0-correct; never `merge`).

**Slot classes** — `recipe base → preset slotClasses → instance slotClasses → class (root only)`, via
`useSlots`, which builds each slot as `recipe(variants())[slot]({ class: cx(presetSlot, instanceSlot,
slot === "root" ? rootClass : undefined) })`. `cx` orders the overrides (later wins); the **final
tailwind-merge happens inside the recipe's `SlotClassFn({ class })`** via `tv` (base first, later
override classes win conflicts). Reuses the existing `{ class }` seam — no new merge machinery.

---

## Package / subpath / resolution impact

- **`@hope-ui/theming` gains no new subpath** — all new API rides the root barrel.
- **The three source-resolution redirect points change only for the rename** (`@hope-ui/themes/hope/recipes`
  → `@hope-ui/presets/hope`): `tsconfig.base.json` `paths`, `vitest.config.ts` `resolve.alias`,
  `.storybook/main.ts` `viteFinal` alias. CSS (`.../hope/tailwind.css`) isn't imported in tests, so it
  resolves via package `exports` only.
- New theming source files (`presets/presets.ts`, `presets/token-css.ts`) sit under `src/presets/` with a
  `presets/index.ts` barrel, re-exported by `src/index.ts`.
- `THEMING_CONTRACT_VERSION` stays `1` (recipe/slot shape unchanged apart from the variant *rename*,
  which is a pre-1.0 fix; bump only if we treat it as breaking).

---

## Working agreement (per-phase review + commit)

Each phase is a self-contained, independently reviewable unit. At the **end of every phase**:

1. Run that phase's **DoD gate** (`pnpm check:coverage-parity`, `pnpm typecheck`, `pnpm lint`, and the
   relevant `pnpm test` / `test:ssr` / `test:browser`) and report the results verbatim.
2. **Pause for user review** — do not start the next phase until the user approves.
3. On approval, **commit** the phase's work with a Conventional-Commit message describing the change
   rationale only. Per CLAUDE.md's git conventions, **no `Co-Authored-By` / "Generated with Claude"
   / any AI-attribution trailer**. Work is on `develop` (branch first if that changes).
4. Then hand back for the next phase's go-ahead.

Phases are sequenced so each leaves the repo green: Phase 0 is a rename-only change (no behavior),
and every later phase keeps all suites passing.

## Phased implementation plan (with DoD artifacts)

**DoD for `packages/theming`:** every non-`index` source file needs a `__tests__/` test (theming's
public API is documented in the doc website, `apps/docs/`, so no repo usage doc is required). Leaf
folders stay flat-free (tests + fixtures under `__tests__/`).
Every browser test that `mount()`s must call `expectNoA11yViolations`. `@hope-ui/presets` is exempt from
coverage-parity (pure CSS/recipe map). Gate with `pnpm check:coverage-parity`, `pnpm typecheck`, `pnpm lint`.

### Phase 0 — Rename `@hope-ui/themes` → `@hope-ui/presets`
- `git mv packages/themes packages/presets`; `package.json` `name` → `@hope-ui/presets`; restructure
  `exports`: `./hope` (JS → `dist/hope/index.jsx`) + `./hope/tailwind.css` (CSS → `src/hope/tailwind.css`);
  `hope.entries` → `{ "hope": "src/hope/index.ts" }`.
- Rename `src/hope/theme.css` → `src/hope/tailwind.css`; add `src/hope/index.ts` (JS barrel).
- Update the three resolution points (rename `@hope-ui/themes/hope/recipes` → `@hope-ui/presets/hope`,
  path base `packages/themes` → `packages/presets`).
- Repo-wide reference update (pattern; representative paths): imports in
  `packages/components/src/button/__tests__/*`, any `docs/*` and `CLAUDE.md` mentions of `@hope-ui/themes`,
  memory-referenced names. CSS import docs → `@import "@hope-ui/presets/hope/tailwind.css"`.
- **DoD:** builds/tests still green (`pnpm build`, `pnpm typecheck`); no artifact changes (rename only).

### Phase 1 — Fix the recipe `loading` flaw
- `theming/src/recipes/button.ts`: rename `loading` → `loaderPlacement` (drop `ButtonLoading`); move
  `ButtonLoaderPlacement` here.
- `presets/src/hope/recipes/button.ts`: rename the `loading` variant → `loaderPlacement` (drop `none` +
  `loader: "hidden"`); drop `loading` from `defaultVariants`.
- `components/src/button/button.tsx`: import `ButtonLoaderPlacement` from theming (drop local decl);
  pass `loaderPlacement: isLoading() ? effectivePlacement() : undefined` to the recipe.
- **DoD:** update `recipes/__tests__/button.test.ts` + the Button recipe reference in the doc website (`apps/docs/`); update
  hope's `recipes/__tests__/button.test.ts`; update Button unit/browser tests + `Button.stories.tsx`
  (loading stories). Button's SSR **inline snapshot** should be **byte-identical** (non-loading render
  unaffected) — regenerate with `-u` only if it actually changed.

### Phase 2 — Presets module (pure, no DOM)
- Add `presets/presets.ts` (`definePreset`, `isPreset`, `Preset`, `PresetConfig`, extractors,
  `SlotClasses`/`SlotClassesInput`, `PresetTokens`, `TokenValue`, `RadiusToken`, `ColorTokenKey`/
  `KebabToCamel`, `DarkMode`, brand, normalization/deep-merge).
- Add `presets/token-css.ts` (`renderPresetStyle` incl. camelCase→kebab, Tailwind shorthand, radii,
  sanitization).
- Add `presets/index.ts`; `export * from "./presets"` in root `src/index.ts`.
- **DoD:** `presets/__tests__/presets.test.ts` (bootstrap-from-registry, extend-a-preset, deep-merge
  precedence, brand/`isPreset`, shorthand + camelCase normalization) and `token-css.test.ts`
  (deterministic fixed-order output; `.dark`/`"media"`/`"none"`; dark-omitted → no dark block; radii;
  Tailwind shorthand; empty → `""`; sanitization throw). Docs: the preset reference in the doc website (`apps/docs/`).

### Phase 3 — Provider + utilities
- `theming/src/theme-context/theme-context.tsx`: context holds `Preset` (keep `ThemeContext` name);
  `ThemeProviderProps.preset`; conditional `<style>` injection (D3 static zero-DOM branch); `useTheme`;
  `useRecipe` reads `preset.recipes`; add `useDefaults` + `useSlots`. Update `src/index.ts` exports.
- **DoD:**
  - Unit `theme-context.test.tsx`: `useRecipe`/`useDefaults`/`useSlots`, missing-provider copy.
  - `theme-context.ssr.test.tsx`: keep no-token case; **add** a token-preset case asserting the `<style>`
    text and `toMatchInlineSnapshot()`ing the render (add a token-preset render entry + `HYDRATION_ENTRIES`
    id if it will be hydrated — no committed fixture).
  - `theme-context.browser.test.tsx`: **hydrate** the token render via
    `hydrateFixture(<virtual:hydration-fixture?id=…>, () => <Tree/>)`; assert no `console.error`/`warn`,
    single `<style>`, same-node reuse, `expectNoA11yViolations` (constraint-#1 byte-stability proof —
    voluntary for theming, required by spec).
  - Update the theming reference in the doc website (`apps/docs/`).

### Phase 4 — `hope` becomes a preset
- `presets/src/hope/index.ts`: `export const hope = definePreset(hopeRecipes)` (+ keep `hopeRecipes`).
- `presets/src/hope/tokens.css`: rename knob `--hope-radius` → `--hope-radii-base` and update the radius
  `@theme` derivations to read it, so `tokens.radii.base` overrides take effect end-to-end.
- **DoD:** confirm `hope.tokens` is empty (defaults live in CSS) → `renderPresetStyle(hope.tokens,…) === ""`;
  update hope recipes/token tests as needed (package is coverage-parity-exempt).
  - **Superseded by the post-approval deviation above:** `hope` now authors its palette in TS, so
    `hope.tokens` is the full palette and `renderPresetStyle(hope.tokens, …)` is non-empty; `tokens.css`
    keeps only the `@theme` radius scale, and `hope.test.ts` asserts conformance over the *rendered*
    token CSS.

### Phase 5 — Button consumes the preset
- `components/src/button/button.tsx`: replace the manual `withDefaults` with `useDefaults`; replace
  the `createMemo`+per-slot mapping with `useSlots`; add `slotClasses?: SlotClasses<"button">` (+ `omit`).
- **DoD:** Button tests switch to `preset={hope}`; add tests for preset `defaultVariants` precedence and
  `slotClasses` (global + instance + `class` interplay) with `expectNoA11yViolations`; `button.ssr.test.tsx`
  → `preset={hope}` (fixture expected byte-identical); add a `slotClasses` story (literal classes).

### Phase 6 — Full gate
- `pnpm check:coverage-parity`, `pnpm typecheck`, `pnpm lint`; then `pnpm test`, `pnpm test:ssr`,
  `pnpm test:browser`. Optionally `pnpm storybook` to eyeball token-override + `slotClasses` stories.

---

## Risks & mitigations

- **SSR/hydration byte-stability (constraint #1).** Deterministic `<style>` (fixed token order, no
  whitespace variance), rendered in the body. *Mitigation:* committed token fixture + hydrate round-trip
  (Phase 3). The zero-DOM branch keeps non-token presets byte-identical to today.
- **FOUC.** Overrides render before paint (body render / inline SSR). Residual FOUC is a base-CSS concern
  (async `tailwind.css`), independent of the preset; overrides never lag the base (they only set values
  base utilities read).
- **Tailwind can't see dynamic classes (constraint #2).** Literal `slotClasses` in consumer source are
  scanned; template/computed strings aren't. *Mitigation:* static form is the default; the function form
  carries a loud doc warning. Preset-package-authored classes need the consumer's Tailwind `@source` to
  include that package — documented in `presets.md`.
- **Token typos.** camelCase keys are still a closed `ColorTokenKey` union → compile error on unknown,
  preserving `checkSemanticTokenConformance` (constraint #3).
- **Dark-mode selector drift.** `darkMode` defaults to `".dark"` to match `_base/variants.css`; documented
  that changing it needs a matching base dark variant.
- **Two installed copies (constraint #6).** `Symbol.for` brand; no module-scope state; declarative `<style>`.
- **CSS injection.** `renderPresetStyle` throws on CSS-breaking characters (dev-authored, cheap defense).
- **Rename blast radius.** Package rename touches many files. *Mitigation:* Phase 0 is rename-only with a
  green build/test gate before any behavior change, so regressions are isolated.

---

## Migration note (existing consumers)

Breaking, but small (pre-1.0; no changeset/publish per [[no-changesets-until-stable]]):

```diff
  /* Tailwind entry */
- @import "@hope-ui/themes/hope";
+ @import "@hope-ui/presets/hope/tailwind.css";
```
```diff
- import { hopeRecipes } from "@hope-ui/themes/hope/recipes";
- <ThemeProvider theme={hopeRecipes}>{children}</ThemeProvider>
+ import { hope } from "@hope-ui/presets/hope";
+ <ThemeProvider preset={hope}>{children}</ThemeProvider>
```
- `useRecipe` unchanged. To customize: `definePreset(hope, { tokens: { colors: { primary: { light: "--color-violet-600", dark: "--color-violet-400" } } }, components: { button: { defaultVariants: { size: "sm" }, slotClasses: { root: "rounded-full" } } } })`, then `<ThemeProvider preset={app}>`.
- Components gain an optional `slotClasses` prop (additive). Button's `loaderPlacement` prop is unchanged
  (the fix is internal to the recipe).

---

## Verification

- **Type/IntelliSense:** `pnpm --filter @hope-ui/theming typecheck` — unknown token keys, unknown component
  keys, wrong slot names, wrong `defaultVariants` values are all compile errors; `"--color-violet-500"`
  references and camelCase keys autocomplete. Run `presets`/`token-css` unit tests for merge precedence + deterministic CSS.
- **SSR:** `pnpm test:ssr` — token fixture renders deterministically (identical bytes on re-run).
- **Hydration/browser:** `pnpm test:browser` — token fixture hydrates with no console error/warn, one
  `<style>`, same-node reuse, no axe violations; Button `defaultVariants` + `slotClasses` precedence holds.
- **End-to-end (real consumer path):** in a plain Vite + Solid 2.0 SPA — import
  `@hope-ui/presets/hope/tailwind.css`, wrap in `<ThemeProvider preset={app}>`, confirm token overrides
  paint (inspect `--hope-*` on the injected `<style>`), a global `defaultVariants.size` applies, and
  global + per-instance `slotClasses` land on the right slots.
- **Gate:** `pnpm check:coverage-parity` passes (new files have tests + docs; leaf folders flat-free).
