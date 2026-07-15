# `button` — the Button recipe contract

The variant vocabulary and slots of the Button recipe, owned by `@hope-ui/theming` (the look-&-feel
authority). Types only — no runtime, no CSS.

`@hope-ui/components`' `Button` consumes this contract via `useRecipe("button")`; each theme
(`@hope-ui/themes/*`) implements a `tailwind-variants` recipe against it, checked by
`hopeRecipes satisfies RecipeRegistry`. This file also exports the assembled recipe type
`ButtonRecipe` (`SlotRecipeFn<ButtonRecipeVariants, ButtonSlot>`), which the
[`registry`](../registry/registry.md) references as its `button` entry — so the registry stays a
flat list of named recipe types and this file owns the Button shape.

## Vocabulary

| Type | Members | Notes |
| --- | --- | --- |
| `ButtonVariant` | `default` · `solid` · `soft` · `outline` · `ghost` · `link` | `default` is neutral chrome and ignores `color`. |
| `ButtonColor` | `primary` · `neutral` · `success` · `warning` · `danger` · `info` | Semantic role color. |
| `ButtonSize` | `xs` · `sm` · `md` · `lg` · `xl` | Heights 28 / 32 / 36 / 40 / 44px. |
| `ButtonLoading` | `none` · `center` · `start` · `end` | Internal loading layout — **not** a public component prop; the component derives it from `loading` + `loaderPlacement`. |
| `ButtonSlot` | `root` · `label` · `startDecorator` · `endDecorator` · `loader` | The recipe's slots. |

## `ButtonRecipeVariants`

The recipe's variant props — all optional:

```ts
interface ButtonRecipeVariants {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: ButtonLoading;
}
```

A theme's recipe accepts these and returns one class function per `ButtonSlot`
(`recipe(props).root()`), the standard slot-recipe shape.
