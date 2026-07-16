# `preset` — the preset machinery

The pure, DOM-free core of hope-ui's preset theming API: the `Preset` type, `definePreset`/`isPreset`,
and the typed component-override vocabulary. No DOM, no CSS emission, no Solid runtime (that is
[`theme-context`](../theme-context/theme-context.md)). Everything is exported from the
`@hope-ui/theming` root barrel.

Semantic token *values* are **not** part of this API — a preset authors them in CSS as `--hope-*`
custom properties (see [`@hope-ui/presets/hope`](../../../theming.md)'s `tokens.css`), so
`ThemeProvider` renders no DOM. Completeness of that CSS is checked by
[`checkSemanticTokenConformance`](../conformance/conformance.md), not by this typed surface.

## What a `Preset` is

A `Preset` is the single object `ThemeProvider` consumes. It owns everything the runtime needs — the
`recipes` (a `RecipeRegistry`) **plus** typed `components` overrides — and is branded so it is
distinguishable at runtime from a bare recipe map.

| Field | Type | Notes |
| --- | --- | --- |
| `recipes` | `RecipeRegistry` | The recipe map (`{ button: … }`). Always taken from the base. |
| `components` | `PresetComponentOverrides` | Per-component `defaultProps` + global `slotClasses`. |

`components` is always a present object (possibly empty). The brand is `Symbol.for("hope-ui.preset")`
— resolved through the cross-realm global symbol registry, so a preset built by one installed copy of
`@hope-ui/theming` is recognized by another.

## `definePreset(base, config?)`

Derive a preset. `base` is normally a `Preset` (e.g. `hope`); theme authors bootstrap a **root**
preset by passing a raw `RecipeRegistry` (the one place a registry is passed directly). `config`
deep-merges its `components` over the base, **config winning**:

```ts
import { definePreset } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";

const app = definePreset(hope, {
  components: {
    button: {
      // `defaultProps` = the curated themeable surface: recipe variants + chrome content (the latter
      // as a factory). A superset of the old variants-only `defaultVariants`. Per-usage behavioral
      // props (`nativeButton`/`type`) are NOT themeable, so they can't be defaulted here.
      defaultProps: { size: "sm", loader: () => <MyBrandSpinner /> },
      slotClasses: { root: "rounded-full" },
    },
  },
});
```

To change token *values*, author your own `--hope-*` CSS (or override individual variables in your
app's stylesheet) — tokens are not part of the `definePreset` config.

### Merge precedence

| Slice | Rule |
| --- | --- |
| `recipes` | Always the base's — a `config` never carries recipes. |
| `components[k].defaultProps` | Deep-merged **per key** — overriding one default keeps the base's others (every themeable prop is a top-level value, primitive or factory, never a nested object). |
| `components[k].slotClasses` | Replaced **wholesale** (config's if present, else base's) — the function form can't be deep-merged, so both forms follow one rule. |

`definePreset` never mutates the base; each call returns a fresh, normalized preset.

## `isPreset(value)`

A type guard that checks the cross-realm brand. Used internally by `definePreset` to tell a `Preset`
base from a raw `RecipeRegistry`, and available to give a friendly error if a JS consumer passes a
non-preset to `ThemeProvider`.

```ts
isPreset(app);       // true
isPreset({ button }); // false — a bare recipe map is not a preset
```

## Type vocabulary

| Type | Meaning |
| --- | --- |
| `RecipeVariantsOf<K>` | The variant props recipe `K` accepts (extracted from its signature). All keys optional (the recipe tolerates a partial). |
| `CompleteVariantsOf<K>` | `RecipeVariantsOf<K>` with **every key required to be present** (values may still be `undefined`). What `useSlots`' `variantsProps` demands and a `slotClasses` function receives, so a component can't *silently omit* a variant (which would make the recipe fall back to `defaultVariants` and hand the function `undefined`). |
| `ThemeablePropsOf<K>` | The props a preset may default for `K`: its [`ThemeablePropsRegistry`](../registry/themeable-props-registry.md) entry (variants + chrome content) if it opted in, else `RecipeVariantsOf<K>`. A superset of `RecipeVariantsOf<K>`. |
| `RecipeSlotsOf<K>` | The slot names recipe `K` returns. |
| `SlotClasses<K>` | `Partial<Record<slot, ClassValue>>` — a per-slot class record. |
| `SlotClassesInput<K>` | `SlotClasses<K>` **or** `(props: CompleteVariantsOf<K>) => SlotClasses<K>` (preset-only function form — its input is the recipe's variant props, every key present, the only axis a global slot class can branch on; slot *keys* stay recipe-owned). |
| `ComponentOverride<K>` | `{ defaultProps?, slotClasses? }` for one component. |
| `PresetComponentOverrides` | Per-component overrides keyed by registry name (`keyof RecipeRegistry`). |
| `PresetConfig` | The authoring shape passed to `definePreset` (`{ components? }`). |

## Scannability caveat

Static `slotClasses` records in consumer source are fully Tailwind-scannable. In the **function
form**, only literal class *substrings* are scanned — a constructed string (`` `px-${n}` ``) is never
generated. Classes authored inside a preset package need the consumer's Tailwind `@source` to include
that package.
