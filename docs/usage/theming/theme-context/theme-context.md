# `ThemeProvider` / `useTheme` / `useRecipe` / `useDefaults` / `useSlots`

The runtime seam of the preset theming system. A `ThemeProvider` injects a **preset** — the single
object the runtime consumes (recipes **plus** typed `components` overrides — see
[`preset`](../preset/preset.md)) — into context. It is **zero-DOM**: it renders no markup of its
own (token values live in the preset's CSS, not a runtime `<style>`). Components read the preset back
out with the `use*` hooks.

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

To customize component defaults, derive a preset with `definePreset` and pass that instead:

```tsx
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";

const app = definePreset(hope, {
  components: { button: { defaultProps: { size: "sm", variant: "solid" }, slotClasses: { root: "rounded-full" } } },
});

<ThemeProvider preset={app}>{/* … */}</ThemeProvider>;
```

To change token *values*, author your own `--hope-*` CSS — tokens aren't part of the preset object.

## API

### `ThemeProvider(props)`

| Prop | Type | Notes |
| --- | --- | --- |
| `preset` | `Preset` | The preset the subtree consumes. Author it with `definePreset`; **a bare recipe map is rejected** (D7 — see below). Chosen at build time, so effectively static. |
| `children` | `JSX.Element` | — |

**Zero-DOM.** The provider renders no markup of its own — it returns the *exact* bare-context tree
(`<ThemeContext value={preset}>{children}</ThemeContext>`). Token values live in the preset's CSS
(`--hope-*` custom properties; see [`@hope-ui/presets/hope`](../../../theming.md)'s `tokens.css`),
so there is no runtime `<style>` to inline and nothing to diverge between server and client. A
component rendered under the provider therefore keeps byte-identical SSR/hydration fixtures — its
markup is exactly what it would be without the wrapper (only the hydration keys shift; see below).

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

Applies the preset's per-component `defaultProps`, then the component's built-in `defaults`, in one
call. Returns the merged props (lazy getters); the keys present in `defaults` become **required** on
the result (`WithDefaults<P, D>` from `@hope-ui/primitives/utils`).

| Option | Type | Notes |
| --- | --- | --- |
| `recipe` | `K extends keyof RecipeRegistry` | The recipe whose preset `defaultProps` are the middle layer. |
| `props` | `P extends object` | The component's own props (highest precedence). |
| `defaults` | `D extends Partial<P>` | The component's built-in defaults (lowest precedence). |

`defaultProps` is typed to the curated themeable surface (`ThemeablePropsOf<K>` — variants + chrome
content), but it is merged into the component's *full* props `P`: an internal `as Partial<P>` cast is
what lets a themeable default flow through as a full-props default unchanged.

**Merge precedence — `instance ?? preset ?? builtin`:**

| Source | Precedence | Where it comes from |
| --- | --- | --- |
| Instance prop | highest | `props[key]` |
| Preset default | middle | `useTheme().components[recipe]?.defaultProps[key]` |
| Built-in default | lowest | `defaults[key]` |

Implemented as `withDefaults(withDefaults(props, presetDefaults), defaults)`. `withDefaults` resolves
each key with `??` (never `merge` — see `docs/solid-2.0-notes.md`), so only a genuinely present,
non-nullish value wins, and each key resolves independently.

### `useSlots({ recipe, variantsProps, slotClasses?, class? })`

Returns one ready-to-call class function per slot — `Record<RecipeSlotsOf<K>, () => string>` — each
folding in the full override chain. Call `slots.root()` etc. inside a `class={…}` binding; each fn
reads `variantsProps()` / `slotClasses()` / `class()` when called, so it tracks exactly those inputs.

| Option | Type | Notes |
| --- | --- | --- |
| `recipe` | `K extends keyof RecipeRegistry` | The recipe whose base classes + preset `slotClasses` seed every slot. |
| `variantsProps` | `Accessor<CompleteVariantsOf<K>>` | The recipe's variant props; re-read per slot-fn call. The only styling input — both the recipe and a preset `slotClasses` function consume exactly these. Typed `CompleteVariantsOf` (every key **required to be present**, values may be `undefined`), so a component can't silently omit a variant. |
| `slotClasses?` | `Accessor<SlotClasses<K> \| undefined>` | Per-instance slot overrides. |
| `class?` | `Accessor<string \| undefined>` | The consumer's root `class`, applied **last** and to the `root` slot only. |

The `variantsProps()` object is passed to **both** the recipe and the preset's `slotClasses` function
form — the recipe's variant props are the sole styling axis either one reads. The wider *themeable*
surface is a preset-`defaultProps` concept only: chrome content (`loader`/`loadingText`) isn't style,
and runtime state (`disabled`/`loading`) is reached through the recipe's `data-*`/`aria-*` Tailwind
variants in the class strings — so neither is threaded here.

**Merge precedence — `recipe base → preset slotClasses → instance slotClasses → class` (root only):**

| Layer | Source |
| --- | --- |
| Recipe base | `recipe(variantsProps())[slot]()` |
| Preset `slotClasses` | `useTheme().components[recipe]?.slotClasses` (its **function form** is called with `variantsProps()`) |
| Instance `slotClasses` | `slotClasses?.()?.[slot]` |
| `class` (root only) | `class?.()` |

`cx` orders the overrides (later wins); the **final tailwind-merge happens inside the recipe's own
`{ class }` seam**, so a later utility beats an earlier conflicting one. The `class` prop reaches
the `root` slot only.

## SSR / hydration note

`ThemeProvider` emits no markup of its own (zero-DOM), so SSR output is exactly `children`. But
**wrapping a subtree in it still shifts that subtree's hydration keys (`_hk`)** — hydration keys are
a path through the component tree, and the provider is a node on that path. So a component's SSR
fixture and its hydration test must both include `<ThemeProvider>` identically, or the keys diverge.
This is pinned by `theme-context.ssr.test.tsx` (the committed zero-DOM fixture) and
`theme-context.browser.test.tsx` (the hydration round-trip).

Token values reach the page through the preset's CSS (`--hope-*` custom properties in the theme's
`tailwind.css`/`tokens.css`, imported into the consumer's Tailwind entry), present in the first
stylesheet with no runtime injection and no FOUC.

## Related

- [`preset`](../preset/preset.md) — `definePreset`/`isPreset`, the `Preset` type + the `components`
  override vocabulary.
- [`recipe-registry`](../registry/recipe-registry.md) — the `RecipeRegistry` `useRecipe`
  reads; [`themeable-props-registry`](../registry/themeable-props-registry.md) — the
  `defaultProps` vocabulary; [`slot-recipe`](../recipes/slot-recipe.md) — the
  `SlotRecipeFn` shape.
- [`conformance`](../conformance/conformance.md) — the kit that verifies a preset's recipes actually emit classes, and that its token CSS defines every `--hope-*` var.
