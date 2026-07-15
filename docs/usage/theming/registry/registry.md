# `registry` — the recipe registry

`RecipeRegistry` is the set of recipes a hope-ui theme must provide, plus the contract-version
constant. Types + one constant; no runtime CSS.

`@hope-ui/theming` **owns the look-&-feel contract**: every hope-authored component's recipe is
declared here directly — one entry per component, referencing that component's contract file (e.g.
[`button`](../recipes/button.md)) — **not** by module augmentation. A component consumes
`useRecipe("<name>")`; a theme implements the matching recipe and checks its map with
`satisfies RecipeRegistry`. Neither the component nor the theme can drift the contract.

## The registry

```ts
interface RecipeRegistry {
  button: SlotRecipeFn<ButtonRecipeVariants, ButtonSlot>;
}
```

Adding a component means giving it a contract file (its variant/slot types, alongside `button`) and
one entry here. `useRecipe` is keyed off this registry, and a theme's recipe map is type-checked
against it.

## `THEMING_CONTRACT_VERSION`

A constant a theme asserts against so a recipe map built against a different contract shape fails
loudly rather than drifting silently. Bump on any breaking change to a recipe's variant/slot shape
or the registry mechanics.

## Related

- [`recipe`](../styling/recipe.md) — the `SlotRecipeFn` / `SlotClassFn` shape each entry uses.
- [`theme-context`](../theme-context/theme-context.md) — `ThemeProvider` / `useRecipe` over this registry.
- [`conformance`](../conformance/conformance.md) — the runtime drift gate.
