# Design: the TypeScript-first "preset" theming API

> **Scope of this file (trimmed 2026-07).** This is the design record for the preset API **as
> shipped**. The **token-values** half of the original design was implemented and then **removed**,
> and the sections describing it have been deleted rather than kept as history — there is no code
> left for them to describe. What was removed, and why:
>
> Semantic tokens are no longer authored in TypeScript or delivered by a runtime `<style>`.
> `@hope-ui/presets/hope` authors its `--hope-*` values in CSS (`src/hope/theme.css` — a separate,
> opt-out import alongside `tailwind.css`, **not** imported by it; renamed from the former
> `tokens.css`), and `ThemeProvider` is **zero-DOM**. So `PresetTokens`, `TokenValue`,
> `ColorTokenKey`/`KebabToCamel`, `RadiusToken`, `DarkMode`, the `tokens`/`darkMode` fields on
> `Preset`/`PresetConfig`, and `renderPresetStyle`/`token-css.ts` (the runtime `<style>` and the
> `@source "./index.ts"` palette-keepalive trick it required) **no longer exist**. The reason the
> CSS-authored model won: a preset's token values must be visible to Tailwind's build scan, and a
> runtime-only `var(--color-…)` the compiler never sees resolves to nothing — the runtime `<style>`
> needed a `@source` trick to work around exactly that.
>
> The **component-override** half — `definePreset`, per-component defaults, and `slotClasses` —
> shipped and remains current; it is what this file now documents. The authoritative description of
> the current model as a whole is [`__internal__/theming.md`](./theming.md).

## Context

A hope-ui "theme" spans two axes that never share a dependency: a **CSS axis**
(`@import "@hope-ui/presets/hope/tailwind.css"` → `@theme inline` mapping + `@source "./recipes"`,
plus the separate `theme.css` token layer) and a **runtime axis** (`<ThemeProvider preset={hope}>`,
a `RecipeRegistry` map of `name → tailwind-variants` recipe read via `useRecipe("button")`).

Two gaps this design closed:

1. **No global component defaults** — a consumer couldn't say "every Button defaults to `size: 'sm'`."
2. **No slot-class injection**, global or per-instance — the only per-instance hook was `class`,
   which reaches only the `root` slot.

(A third gap, "overriding semantic tokens means hand-editing CSS", was addressed by the token API
that has since been removed; hand-editing token CSS — or importing your own `theme.css` instead of
hope's — is again the answer, and is why `theme.css` is a separate opt-out import.)

---

## Decisions (resolved)

### D1 — `@hope-ui/presets`; a Preset owns everything; `hope` is a preset

- **`@hope-ui/theming` keeps its name** — it's the *contract + runtime machinery* (`ThemeProvider`,
  `useRecipe`, `definePreset`, the `Preset` types, `tv`, the token vocabulary). `definePreset` lives
  here.
- **`@hope-ui/themes` → `@hope-ui/presets`** — the *concrete presets* (hope) and their CSS. Naming
  symmetry: `theming` = the machinery, `presets` = the instances.
- **A `Preset` owns everything the runtime needs:** `recipes` (a `RecipeRegistry`) plus typed
  `components` overrides. There is no bare `RecipeRegistry` at the provider boundary;
  `RecipeRegistry` is an internal building block — the type of a preset's `recipes` field and the
  seam for registering a component.
- **`hope` is a preset**, exported from `@hope-ui/presets/hope`, built internally with
  `definePreset` over the raw `hopeRecipes` map (both are exported; the raw map is used for
  bootstrapping and conformance tests).
- **CSS import is explicit:** `@import "@hope-ui/presets/hope/tailwind.css";` then, optionally,
  `@import "@hope-ui/presets/hope/theme.css";`.
- **`ThemeProvider`'s prop is `preset`** (renamed from `theme`; `ThemeProvider`/`ThemeContext`
  names kept — a preset *is* a theme preset).
- **`definePreset(base, config)` derives a preset from a base preset.** `base` is normally a
  `Preset` (`hope`); theme authors bootstrap a *root* preset by passing the raw `RecipeRegistry` map
  (the one place a registry is passed).

### D4 — `slotClasses`, composed by a `useSlots` utility

- **Name is `slotClasses`** for both the preset (global) and the per-instance component prop. The
  root-only `class` prop stays as a shorthand, applied last.
- **Per-slot record**, each slot a `ClassValue`, typed to the component's slot union. Static literals
  are the common case and are **fully Tailwind-scannable** in consumer source.
- **Function form (preset only):** `(props) => Partial<Record<Slot, ClassValue>>`. Loud doc warning:
  only literal class *substrings* inside the function are scannable; constructed strings
  (`` `px-${n}` ``) are never generated. Preset-package-authored classes also need the consumer's
  Tailwind `@source` to include that package.
- Composition is done by the **`useSlots` utility** (D6), not hand-written `cx` per slot.

### D5 — The recipe `loading` flaw → per-component defaults typed from the recipe

The recipe's `loading` axis (`none|center|start|end`, with `none → loader: "hidden"`) was a
**pre-existing API design flaw**: showing/hiding the loader slot is the **component's** job (it
already wraps the loader in `<Show when={isLoading()}>`), not CSS's. The fix, which is current:

- The recipe variant is **`loaderPlacement`** with values **`start | center | end`** (no `none`, no
  `loader: "hidden"`). It owns *layout only* — center overlays and hides the label via
  `label: opacity-0`; start/end set loader order. The component passes
  `loaderPlacement: isLoading() ? effectivePlacement() : undefined`, so loading layout applies only
  while loading.
- `ButtonLoaderPlacement` lives in `theming/src/recipes/button.ts` and is **shared** by the recipe
  variant *and* the component prop (the component imports + re-exports it).
- Consequence: `RecipeVariantsOf<"button">` became a **clean subset of component props** — no
  `loading`-axis leak — which is what made per-component defaults typeable straight from the
  recipe's tv variants.

> **Then partly reversed (2026-07).** The override is no longer variants-only `defaultVariants`. It
> is **`defaultProps`**, typed to a curated **themeable-props surface**: `ThemeablePropsOf<K>`
> resolves to a per-component `<Component>ThemeableProps` type (recipe variants **plus** durable
> behavioral policy + component chrome content) registered in a type-only `ThemeablePropsRegistry`,
> falling back to `RecipeVariantsOf<K>` when a component declares no entry. This revives a **scoped**
> version of the `DefaultableProps` idea the first draft dropped, but: declared in `@hope-ui/theming`
> itself (**no** module augmentation — which would degrade silently in the presets package and
> theming tests, where component types are out of scope), non-exhaustive (the `RecipeVariantsOf`
> fallback keeps it incremental), and curated (behavioral policy + chrome content, never full
> `Partial<ComponentProps>`). Chrome content is typed as a reuse-safe factory (`() => JSX.Element`,
> resolved via `runIfFunction`) — a shared preset default must render a fresh subtree per instance.
> The `slotClasses` function-form input widened to `ThemeablePropsOf<K>` too. Authoritative:
> [`__internal__/theming.md`](./theming.md).

### D6 — Two object-form utilities so components don't hand-roll merges

The merge chains are encapsulated in two utilities, each called once. Both take an **options object
with accessor-valued getters** — matching the repo's dominant convention for composed primitives
(`renderElement({ as, props, render, ref })`, `createButton({ disabled: () => …, … })`, the
`createDialog*` family). Named args are self-documenting and safe against arg-swap (`props` vs
`defaults` are both objects, so a positional form is swap-prone). Both read the preset from context,
hence the `use*` prefix:

- **`useDefaults({ recipe, props, defaults })`** — applies preset `defaultProps` then built-in
  defaults in one call (precedence: instance ?? preset ?? builtin). Returns the merged props (lazy
  getters) the component uses **everywhere**, not just for styling — see the merged-props rule in
  `__internal__/solid-2.0-notes.md`.
- **`useSlots({ recipe, variants, slotClasses?, class? })`** — returns ready-to-call per-slot class
  functions that already fold in the recipe base, preset `slotClasses`, instance `slotClasses`, and
  (root only) `class`.

`useRecipe` stays as the low-level seam; `useDefaults`/`useSlots` are the standard pattern for all
components.

### D7 — `definePreset` optional; `Preset` is a branded object

`definePreset` is the ergonomic path (generic inference + normalization + brand). The brand is
`Symbol.for("hope-ui.preset")` — **cross-realm, so a preset from one installed copy is recognized by
another** — used to distinguish `Preset` from a raw `RecipeRegistry` in `definePreset`, and to give a
friendly error if a JS consumer passes a non-preset to `ThemeProvider`.

---

## Current TypeScript signatures

All of this rides the **`@hope-ui/theming` root barrel** (`src/index.ts`) — no new subpath.

```ts
export type RecipeVariantsOf<K extends keyof RecipeRegistry> = NonNullable<Parameters<RecipeRegistry[K]>[0]>;
export type RecipeSlotsOf<K extends keyof RecipeRegistry> = keyof ReturnType<RecipeRegistry[K]> & string;

export type SlotClasses<K extends keyof RecipeRegistry> = Partial<Record<RecipeSlotsOf<K>, ClassValue>>;
export type SlotClassesInput<K extends keyof RecipeRegistry> =
  | SlotClasses<K>
  | ((props: ThemeablePropsOf<K>) => SlotClasses<K>);

export interface ComponentOverride<K extends keyof RecipeRegistry> {
  defaultProps?: Partial<ThemeablePropsOf<K>>;
  slotClasses?: SlotClassesInput<K>;
}
export type PresetComponentOverrides = { [K in keyof RecipeRegistry]?: ComponentOverride<K> };

export interface PresetConfig { components?: PresetComponentOverrides }

declare const PRESET_BRAND: unique symbol; // runtime = Symbol.for("hope-ui.preset")
export interface Preset {
  readonly [PRESET_BRAND]: true;
  readonly recipes: RecipeRegistry;
  readonly components: PresetComponentOverrides;
}

export function definePreset(base: Preset | RecipeRegistry, config?: PresetConfig): Preset;
export function isPreset(value: unknown): value is Preset;
```

Provider + consumption:

```ts
export interface ThemeProviderProps { preset: Preset; children?: JSX.Element }
export function ThemeProvider(props: ThemeProviderProps): JSX.Element;

export function useTheme(): Preset;                                                    // the current preset (advanced)
export function useRecipe<K extends keyof RecipeRegistry>(key: K): RecipeRegistry[K];  // reads preset.recipes[key]

export function useDefaults<K extends keyof RecipeRegistry, P extends object, D extends Partial<P>>(
  options: { recipe: K; props: P; defaults: D },
): WithDefaults<P, D>; // WithDefaults from @hope-ui/primitives/utils — keys in D become required

export function useSlots<K extends keyof RecipeRegistry>(options: {
  recipe: K;
  variants: Accessor<RecipeVariantsOf<K>>;
  slotClasses?: Accessor<SlotClasses<K> | undefined>; // instance overrides
  class?: Accessor<string | undefined>;               // root slot only, applied last
}): Record<RecipeSlotsOf<K>, () => string>;
```

A component body then reduces to two utility calls (`Button` is the reference); add `"slotClasses"`
to its `omit(...)` list so it isn't spread onto the DOM element.

---

## Merge precedence (defined + defended)

**Component defaults** — `built-in → preset defaultProps → instance prop`, via `useDefaults`, which
nests `withDefaults(withDefaults(props, presetDefaultProps(key)), builtins)`. `withDefaults` resolves
each key with `??`, yielding `instance ?? preset ?? builtin`, with lazy getters (Solid 2.0-correct;
**never `merge`**, which resolves by presence — see `__internal__/solid-2.0-notes.md`).

**Slot classes** — `recipe base → preset slotClasses → instance slotClasses → class (root only)`, via
`useSlots`, which builds each slot as
`recipe(variants())[slot]({ class: cx(presetSlot, instanceSlot, slot === "root" ? rootClass : undefined) })`.
`cx` orders the overrides (later wins); the **final tailwind-merge happens inside the recipe's
`SlotClassFn({ class })`** via `tv` (base first, later override classes win conflicts). This reuses
the existing `{ class }` seam — no new merge machinery.

---

## Constraints this design had to satisfy (still live)

- **SSR/hydration byte-stability.** Now trivially satisfied: class names are pure deterministic
  mappers and `ThemeProvider` is zero-DOM. But **wrapping a subtree in `ThemeProvider` shifts that
  subtree's `_hk`**, so a component's SSR entry and its hydration test must both include it
  identically (see `__internal__/theming.md` § SSR / hydration).
- **Tailwind can't see dynamic classes.** Literal `slotClasses` in consumer source are scanned;
  template/computed strings aren't. The static form is the default; the function form carries a loud
  doc warning.
- **Two installed copies.** `Symbol.for` brand; no module-scope state.
- **Resolution points.** `@hope-ui/presets` is one of the packages that must stay in sync across
  `tsconfig.base.json` `paths`, `vitest.config.ts` `resolve.alias`, and `.storybook/main.ts`
  `viteFinal` — see CLAUDE.md § *In development, `@hope-ui/*` always resolves to `src`*. Preset CSS
  isn't imported in tests, so it resolves via package `exports` only.
- `THEMING_CONTRACT_VERSION` stays `1` (recipe/slot shape unchanged apart from the pre-1.0
  `loading` → `loaderPlacement` rename).
