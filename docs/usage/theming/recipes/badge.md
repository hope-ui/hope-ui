# `badge` — the Badge recipe contract

The variant vocabulary and slots of the Badge recipe, owned by `@hope-ui/theming` (the look-&-feel
authority). Types only — no runtime, no CSS.

`@hope-ui/components`' `Badge` consumes this contract via `useRecipe("badge")`; each preset
(`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it, checked by
`hopeRecipes satisfies RecipeRegistry`. This file also exports the assembled recipe type
`BadgeRecipe` (`SlotRecipeFn<BadgeRecipeVariants, BadgeSlot>`), which the
[`recipe-registry`](../registry/recipe-registry.md) references as its `badge` entry — so the registry
stays a flat list of named recipe types and this file owns the Badge shape. It additionally exports
[`BadgeThemeableProps`](#badgethemeableprops), the `badge` entry of the
[`themeable-props-registry`](../registry/themeable-props-registry.md).

Badge is a **static, non-interactive** inline label (a styled `<span>`), so — unlike Button — the
recipe has no interaction ladder (`-hovered`/`-pressed`), no loader, and no chrome content. Its axes
are purely visual.

## Vocabulary

| Type | Members | Notes |
| --- | --- | --- |
| `BadgeVariant` | `solid` · `inverted` · `soft` · `subtle` · `outline` · `dot` | Every variant honors `colorScheme`. `inverted` is the literal swap of the `solid` pair; `subtle` is `soft` plus a soft role border; `dot` is neutral chrome with a role-colored dot. |
| `BadgeColorScheme` | `primary` · `neutral` · `success` · `info` · `warning` · `danger` | Semantic role color scheme. |
| `BadgeSize` | `xs` · `sm` · `md` · `lg` | Density/scale. |
| `BadgeShape` | `sharp` · `rounded` · `pill` · `circle` | Corner treatment. `circle` is fully rounded + square aspect, for a single glyph/count. |
| `BadgeSlot` | `root` · `label` · `startDecorator` · `endDecorator` · `dot` | The recipe's slots. |

## `BadgeRecipeVariants`

The recipe's variant props — all optional:

```ts
interface BadgeRecipeVariants {
  variant?: BadgeVariant;
  colorScheme?: BadgeColorScheme;
  size?: BadgeSize;
  shape?: BadgeShape;
  fullWidth?: boolean;
}
```

A theme's recipe accepts these and returns one class function per `BadgeSlot`
(`recipe(props).root()`), the standard slot-recipe shape.

## `BadgeThemeableProps`

The curated Badge props a preset may default app-wide via `ComponentOverride.defaultProps` — the
`badge` entry of the [`themeable-props-registry`](../registry/themeable-props-registry.md). Badge has
**no** non-variant themeable props (no chrome content, no durable behavioral policy), so it is an
exact, **empty** extension of `BadgeRecipeVariants`:

```ts
interface BadgeThemeableProps extends BadgeRecipeVariants {}
```

It exists for **contract uniformity** with Button: every component's contract file exports a
`…ThemeableProps` the components layer can `extends`, and the registry carries a `badge` entry — so
the mechanism stays identical across components even where the curated surface equals the recipe
variants. `ThemeablePropsOf<"badge">` therefore resolves to exactly the recipe variants.
