# `recipe-registry` — the recipe registry

`RecipeRegistry` is the set of recipes a hope-ui theme must provide, plus the contract-version
constant. Types + one constant; no runtime CSS. It lives in the top-level `registry/` folder — the
contract seam, a sibling of `recipes`/`presets`/`theme-context` — alongside its behavioral/chrome
counterpart, [`themeable-props-registry`](./themeable-props-registry.md), so the two contracts scale
independently as the component catalog grows. Consumers import from `@hope-ui/theming` (the root
barrel re-exports the folder); within the package the specifier is `../registry`.

`@hope-ui/theming` **owns the look-&-feel contract**: every hope-authored component's recipe is
declared here directly — one entry per component, referencing that component's contract file (in the
sibling `recipes/` folder, e.g. [`button`](../recipes/button.md)) — **not** by module augmentation. A
component consumes
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
against it. A preset's per-component *overrides* (`defaultProps`/`slotClasses`) stay keyed on
`keyof RecipeRegistry` — so a component gets those override slots from its `RecipeRegistry` entry
alone, whether or not it also declares a `ThemeablePropsRegistry` entry.

## `THEMING_CONTRACT_VERSION`

A constant a theme asserts against so a recipe map built against a different contract shape fails
loudly rather than drifting silently. Bump on any breaking change to a recipe's variant/slot shape
or the registry mechanics. Still `1` — the themeable-props widening changed only the *preset-override
authoring vocabulary*, not any recipe/slot shape.

## Related

- [`themeable-props-registry`](./themeable-props-registry.md) — the parallel, type-only registry of
  per-component behavioral/chrome default vocabulary.
- [`slot-recipe`](../recipes/slot-recipe.md) — the `SlotRecipeFn` / `SlotClassFn` shape each entry uses.
- [`theme-context`](../theme-context/theme-context.md) — `ThemeProvider` / `useRecipe` over this registry.
- [`conformance`](../conformance/conformance.md) — the runtime drift gate.
