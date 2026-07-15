# `ThemeProvider` / `useTheme` / `useRecipe` / `useDefaults` / `useSlots`

The runtime seam of the preset theming system. A `ThemeProvider` injects a **preset** — the single
object the runtime consumes (recipes **plus** typed token/component overrides — see
[`presets`](../presets/presets.md)) — into context, and, when the preset carries token overrides,
inlines a deterministic `<style>`. Components read the preset back out with the `use*` hooks.

```tsx
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope"; // the default preset

function App() {
  return (
    <ThemeProvider preset={hope}>
      <MyComponent />
    </ThemeProvider>
  );
}
```

To customize, derive a preset with `definePreset` and pass that instead:

```tsx
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";

const app = definePreset(hope, {
  tokens: { colors: { primary: { light: "violet.600", dark: "violet.400" } } },
  components: { button: { defaultVariants: { size: "sm" }, slotClasses: { root: "rounded-full" } } },
});

<ThemeProvider preset={app}>{/* … */}</ThemeProvider>;
```

## API

### `ThemeProvider(props)`

| Prop | Type | Notes |
| --- | --- | --- |
| `preset` | `Preset` | The preset the subtree consumes. Author it with `definePreset`; **a bare recipe map is rejected** (D7 — see below). Chosen at build time, so effectively static. |
| `children` | `JSX.Element` | — |

**Token `<style>` injection (D3).** The provider computes `renderPresetStyle(preset.tokens,
preset.darkMode)` **once, in its render body** (not an effect), so the `--hope-*` custom properties
are present before first paint and inline in the SSR stream (no FOUC). The decision is made on the
*static* preset, so server and client always take the same branch:

- **No token overrides** (e.g. `hope`, whose values live in CSS) → `renderPresetStyle` returns `""`
  and the provider returns the *exact* bare-provider tree — **no fragment, no `<style>` node**. A
  component's existing SSR/hydration fixtures are therefore byte-identical, and their hydration keys
  (`_hk`) do not shift.
- **Token overrides** → a `<style>` is rendered before `children`, inside the provider. Its text is
  deterministic (fixed token order, constant whitespace), so it hydrates without a mismatch.

**D7 guard.** A JS consumer passing a non-preset (a raw recipe map, `undefined`, an arbitrary
object) gets a clear error naming `ThemeProvider` and `definePreset`, rather than a downstream
"cannot read properties of undefined".

### `useTheme(): Preset`

Returns the whole current preset — the advanced escape hatch. Most components reach for
`useDefaults` / `useSlots` / `useRecipe` instead. Throws the friendly, `ThemeProvider`-naming error
when called outside a provider.

### `useRecipe<K extends keyof RecipeRegistry>(key: K): RecipeRegistry[K]`

Reads one recipe out of `useTheme().recipes`. The low-level styling seam; the returned function is a
pure prop→className mapper, so its classes are **byte-stable across server and client**.

- Throws the friendly `ThemeProvider`-naming error when called with no provider above it.
- Throws a clear error when the mounted preset provides no recipe for `key` (a preset built against
  an older contract, or a JS consumer bypassing the types) — instead of a downstream
  "undefined is not a function".

### `useDefaults({ recipe, props, defaults })`

Applies the preset's per-component `defaultVariants`, then the component's built-in `defaults`, in
one call. Returns the merged props (lazy getters); the keys present in `defaults` become **required**
on the result (`WithDefaults<P, D>` from `@hope-ui/primitives/utils`).

| Option | Type | Notes |
| --- | --- | --- |
| `recipe` | `K extends keyof RecipeRegistry` | The recipe whose preset `defaultVariants` are the middle layer. |
| `props` | `P extends object` | The component's own props (highest precedence). |
| `defaults` | `D extends Partial<P>` | The component's built-in defaults (lowest precedence). |

**Merge precedence — `instance ?? preset ?? builtin`:**

| Source | Precedence | Where it comes from |
| --- | --- | --- |
| Instance prop | highest | `props[key]` |
| Preset default | middle | `useTheme().components[recipe]?.defaultVariants[key]` |
| Built-in default | lowest | `defaults[key]` |

Implemented as `withDefaults(withDefaults(props, presetDefaultVariants), defaults)`. `withDefaults`
resolves each key with `??` (never `merge` — see `docs/solid-2.0-notes.md`), so only a genuinely
present, non-nullish value wins, and each key resolves independently.

### `useSlots({ recipe, variants, slotClasses?, class? })`

Returns one ready-to-call class function per slot — `Record<RecipeSlotsOf<K>, () => string>` — each
folding in the full override chain. Call `slots.root()` etc. inside a `class={…}` binding; each fn
reads `variants()` / `slotClasses()` / `class()` when called, so it tracks exactly those inputs.

| Option | Type | Notes |
| --- | --- | --- |
| `recipe` | `K extends keyof RecipeRegistry` | The recipe whose base classes + preset `slotClasses` seed every slot. |
| `variants` | `Accessor<RecipeVariantsOf<K>>` | The recipe's variant props; re-read per slot-fn call. |
| `slotClasses?` | `Accessor<SlotClasses<K> \| undefined>` | Per-instance slot overrides. |
| `class?` | `Accessor<string \| undefined>` | The consumer's root `class`, applied **last** and to the `root` slot only. |

**Merge precedence — `recipe base → preset slotClasses → instance slotClasses → class` (root only):**

| Layer | Source |
| --- | --- |
| Recipe base | `recipe(variants())[slot]()` |
| Preset `slotClasses` | `useTheme().components[recipe]?.slotClasses` (its **function form** is called with `variants()`) |
| Instance `slotClasses` | `slotClasses?.()?.[slot]` |
| `class` (root only) | `class?.()` |

`cx` orders the overrides (later wins); the **final tailwind-merge happens inside the recipe's own
`{ class }` seam**, so a later utility beats an earlier conflicting one. The `class` prop reaches
the `root` slot only.

## Why the `<style>` is inline, not in `<head>`

The token `<style>` is rendered **as an ordinary element in the tree** (a sibling of `children`
inside the provider), not portalled into `document.head`. This is deliberate, and it is what makes
the SSR story work:

- **The server has no `document.head`.** Reaching `<head>` needs a `Portal` (which must be gated
  behind `isServer`, so it emits nothing in the SSR stream) or a post-mount effect — either way the
  `--hope-*` overrides would be absent on first paint (FOUC) and injected client-side, reintroducing
  a hydration divergence and imperative, ref-counted head state. A declarative in-tree element is
  present in the SSR stream, hydrates in place, and needs no module-scope bookkeeping.
- **Cascade order works in your favour.** The override and the base `@import ".../tailwind.css"`
  both declare `:root { --hope-* }` (equal specificity); the tie breaks on document order. A body
  `<style>` always follows the head import, so the override wins **without** depending on import
  ordering.

A `<style>` element is `display:none` (UA default): it paints nothing and is **not** a flex/grid
item, so it never affects layout. The one caveat is structural pseudo-classes — as a sibling of your
content it is counted by `:nth-child`/`:first-child` on the shared parent. `ThemeProvider` normally
sits at the app root, so this rarely bites; if it matters, give the provider its own wrapper element.

## SSR / hydration note

`ThemeProvider` emits markup **only when the preset carries token overrides** (the `<style>`); a
token-free preset emits nothing of its own. Either way, **wrapping a subtree in it shifts that
subtree's hydration keys (`_hk`)** — hydration keys are a path through the component tree. So a
component's SSR fixture and its hydration test must both include `<ThemeProvider>` identically, or
the keys diverge. The token `<style>` itself hydrates in place (same node, no mismatch) because its
bytes are deterministic — pinned by `theme-context.ssr.test.tsx` (the committed token fixture) and
`theme-context.browser.test.tsx` (the hydration round-trip).

## Related

- [`presets`](../presets/presets.md) — `definePreset`/`isPreset`, the `Preset` type + token/component
  vocabulary; [`token-css`](../presets/token-css.md) — the `renderPresetStyle` renderer the `<style>` uses.
- [`registry`](../recipes/registry.md) — the `RecipeRegistry` `useRecipe` reads;
  [`slot-recipe`](../recipes/slot-recipe.md) — the `SlotRecipeFn` shape.
- [`conformance`](../conformance/conformance.md) — the kit that verifies a preset's recipes actually emit classes.
