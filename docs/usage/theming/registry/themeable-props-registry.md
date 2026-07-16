# `themeable-props-registry` — per-component themeable props

`ThemeablePropsRegistry` is the parallel, **type-only** counterpart to
[`RecipeRegistry`](./recipe-registry.md): one entry per component that opts into defaulting
*non-variant* props app-wide, on top of its recipe variants. It is what lets a preset's
`ComponentOverride.defaultProps` express **durable behavioral policy** (e.g. Button's `nativeButton`,
`type`) and **component chrome content** (Button's `loader`/`loadingText`), not just visual variants.

Hand-declared and closed — **no module augmentation**. Augmentation from the components package would
degrade *silently*: `@hope-ui/presets` and theming's own tests don't import components, so a `declare
module` there would be out of scope exactly where the feature is needed, falling back to variants-only
with no diagnostic. Declaring the vocabulary in theming keeps it uniformly in scope for presets,
theming tests, and consumer apps.

## The registry

```ts
interface ThemeablePropsRegistry {
  button: ButtonThemeableProps;
}
```

Each entry is that component's `<Component>ThemeableProps` type from its contract file (in the sibling
`recipes/` folder, e.g. [`ButtonThemeableProps`](../recipes/button.md)), declared
`extends <Component>RecipeVariants` so it is a superset of the variants by construction.

## Intentionally non-exhaustive

Unlike `RecipeRegistry`, this registry is **not** exhaustive over `keyof RecipeRegistry`. A component
that only wants variants-only defaults declares *no* entry here. The resolver
[`ThemeablePropsOf<K>`](../presets/presets.md) handles that:

```ts
type ThemeablePropsOf<K extends keyof RecipeRegistry> =
  K extends keyof ThemeablePropsRegistry ? ThemeablePropsRegistry[K] : RecipeVariantsOf<K>;
```

The `: RecipeVariantsOf<K>` fallback is **load-bearing** — it keeps the feature incremental and
backward-compatible: an unregistered component still resolves to a valid (variants-only) surface
rather than a type error.

## The curation rule

An entry contains **only props for which an app-wide `instance ?? preset ?? builtin` default is
meaningful and safe**: recipe variants + durable behavioral/config policy toggles + component-level
chrome content. Deliberately **excluded**: per-instance payload content (`children`, decorators);
transient UI state (`loading`, `disabled` — defaulting these app-wide is a footgun); controlled/identity
state (`open`, `value`, `id`, `ref`); polymorphism/styling/events (`render`/`as`, `class`,
`slotClasses`, `on*`); and raw DOM passthrough (`aria-*`, `data-*`).

Chrome content is typed as a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset
value is one object shared by every instance, and a Solid `JSX.Element` is an already-built node that
would *move* if reused. The factory (called per instance) yields a fresh subtree — see
[`runIfFunction`](../../primitives/utils/run-if-function/run-if-function.md) and
[`RenderProp`](../../primitives/utils/render/render.md).

## Related

- [`recipe-registry`](./recipe-registry.md) — the recipe/slot contract this parallels.
- [`button`](../recipes/button.md) — `ButtonThemeableProps`, the `button` entry.
- [`presets`](../presets/presets.md) — `ThemeablePropsOf<K>`, `ComponentOverride.defaultProps`, and
  the widened `slotClasses` function input.
