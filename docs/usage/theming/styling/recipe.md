# `recipe` — the slot-recipe shape

What a recipe *is*, independent of any component. Types only — no runtime, no CSS.

A recipe is a `tailwind-variants` slot recipe used **directly** (no adapter): calling it with variant
props returns one class *function* per slot.

| Type | Shape |
| --- | --- |
| `SlotClassFn` | `(props?: { class?: ClassValue }) => string` — one slot's class resolver. Call it for the slot's classes, or pass `{ class }` to merge a consumer override through the recipe's own tailwind-merge config. |
| `SlotRecipeFn<Variants>` | `(props?: Variants) => Record<"root", SlotClassFn>` — single-part component (the `root` slot). |
| `SlotRecipeFn<Variants, Slot>` | `(props?: Variants) => Record<Slot, SlotClassFn>` — multi-part component. |

Because this is exactly the shape `tv({ slots, … })` returns, a theme registers its `tv` recipe
as-is — see [`styling`](./styling.md). The per-component contracts
([`button`](../recipes/button.md), …) specialize this with their variant vocabulary and slots;
[`registry`](../registry/registry.md) lists which components a theme must provide.

## Usage in a component

```ts
const recipe = useRecipe("button");
// each slot is a function; call it (optionally merging a consumer class through the recipe):
// root:  recipe({ variant, color, size }).root({ class: props.class })
// label: recipe({ variant, color, size }).label()
```
