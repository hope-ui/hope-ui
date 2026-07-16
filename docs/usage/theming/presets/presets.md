# `presets` — the preset machinery

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
| `components` | `PresetComponentOverrides` | Per-component `defaultVariants` + global `slotClasses`. |

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
    button: { defaultVariants: { size: "sm" }, slotClasses: { root: "rounded-full" } },
  },
});
```

To change token *values*, author your own `--hope-*` CSS (or override individual variables in your
app's stylesheet) — tokens are not part of the `definePreset` config.

### Merge precedence

| Slice | Rule |
| --- | --- |
| `recipes` | Always the base's — a `config` never carries recipes. |
| `components[k].defaultVariants` | Deep-merged **per variant key** — overriding one default keeps the base's others. |
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
| `RecipeVariantsOf<K>` | The variant props recipe `K` accepts (extracted from its signature). |
| `RecipeSlotsOf<K>` | The slot names recipe `K` returns. |
| `SlotClasses<K>` | `Partial<Record<slot, ClassValue>>` — a per-slot class record. |
| `SlotClassesInput<K>` | `SlotClasses<K>` **or** `(variants) => SlotClasses<K>` (preset-only function form). |
| `ComponentOverride<K>` | `{ defaultVariants?, slotClasses? }` for one component. |
| `PresetComponentOverrides` | Per-component overrides keyed by registry name. |
| `PresetConfig` | The authoring shape passed to `definePreset` (`{ components? }`). |

## Scannability caveat

Static `slotClasses` records in consumer source are fully Tailwind-scannable. In the **function
form**, only literal class *substrings* are scanned — a constructed string (`` `px-${n}` ``) is never
generated. Classes authored inside a preset package need the consumer's Tailwind `@source` to include
that package.
