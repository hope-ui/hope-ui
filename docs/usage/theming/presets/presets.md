# `presets` — the preset machinery

The pure, DOM-free core of hope-ui's preset theming API: the `Preset` type, `definePreset`/`isPreset`,
and the typed token/component-override vocabulary. No DOM, no CSS emission (that is
[`token-css`](./token-css.md)), no Solid runtime (that is [`theme-context`](../theme-context/theme-context.md)).
Everything is exported from the `@hope-ui/theming` root barrel.

## What a `Preset` is

A `Preset` is the single object `ThemeProvider` consumes. It owns everything the runtime needs — the
`recipes` (a `RecipeRegistry`) **plus** typed overrides — and is branded so it is distinguishable at
runtime from a bare recipe map.

| Field | Type | Notes |
| --- | --- | --- |
| `recipes` | `RecipeRegistry` | The recipe map (`{ button: … }`). Always taken from the base. |
| `tokens` | `PresetTokens` | Semantic color overrides, **stored exactly as authored**. |
| `components` | `PresetComponentOverrides` | Per-component `defaultVariants` + global `slotClasses`. |
| `darkMode` | `DarkMode` | `".dark"` (selector, default) · `"media"` · `"none"`. |

`tokens` and `components` are always present objects (possibly empty); `darkMode` is always resolved.
The brand is `Symbol.for("hope-ui.preset")` — resolved through the cross-realm global symbol registry,
so a preset built by one installed copy of `@hope-ui/theming` is recognized by another.

## `definePreset(base, config?)`

Derive a preset. `base` is normally a `Preset` (e.g. `hope`); theme authors bootstrap a **root**
preset by passing a raw `RecipeRegistry` (the one place a registry is passed directly). `config`
deep-merges over the base, **config winning**:

```ts
import { definePreset } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";

const app = definePreset(hope, {
  tokens: {
    colors: {
      primary: { light: "--color-violet-600", dark: "--color-violet-400" }, // palette var ref, per-mode
      warningSoft: "--color-amber-100",                                     // string = both modes
      onPrimary: { light: "#fff" },                                         // raw color; dark omitted → inherits base
    },
  },
  components: {
    button: { defaultVariants: { size: "sm" }, slotClasses: { root: "rounded-full" } },
  },
  darkMode: ".dark",
});
```

Token keys are the **camelCase** spelling of the fixed semantic vocabulary (`ColorTokenKey`) — a
closed union, so an unknown key is a compile error and the keys autocomplete. The value transforms
(a `--…` reference → `var(--…)`, camelCase → `--hope-<kebab>`) happen at render time in
[`token-css`](./token-css.md); a preset stores tokens verbatim.

### Merge precedence

| Slice | Rule |
| --- | --- |
| `recipes` | Always the base's — a `config` never carries recipes. |
| `tokens` | **Per token.** An override replaces that whole token's value; sibling tokens are kept. |
| `components[k].defaultVariants` | Deep-merged **per variant key** — overriding one default keeps the base's others. |
| `components[k].slotClasses` | Replaced **wholesale** (config's if present, else base's) — the function form can't be deep-merged, so both forms follow one rule. |
| `darkMode` | `config ?? base ?? ".dark"`. |

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
| `ColorTokenKey` | camelCase of the kebab `SemanticColorToken` vocabulary — a closed union. |
| `TokenValue` | `string` (both modes) **or** `{ light: string; dark?: string }`. |
| `PresetTokens` | `{ colors? }`. |
| `DarkMode` | `string` selector (default `".dark"`) · `"media"` · `"none"`. |
| `ComponentOverride<K>` | `{ defaultVariants?, slotClasses? }` for one component. |
| `PresetComponentOverrides` | Per-component overrides keyed by registry name. |
| `PresetConfig` | The authoring shape passed to `definePreset` (all fields optional). |

## Scannability caveat

Static `slotClasses` records in consumer source are fully Tailwind-scannable. In the **function
form**, only literal class *substrings* are scanned — a constructed string (`` `px-${n}` ``) is never
generated. Classes authored inside a preset package need the consumer's Tailwind `@source` to include
that package.
