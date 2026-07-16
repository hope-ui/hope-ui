# `button` — the Button recipe contract

The variant vocabulary and slots of the Button recipe, owned by `@hope-ui/theming` (the look-&-feel
authority). Types only — no runtime, no CSS.

`@hope-ui/components`' `Button` consumes this contract via `useRecipe("button")`; each preset
(`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it, checked by
`hopeRecipes satisfies RecipeRegistry`. This file also exports the assembled recipe type
`ButtonRecipe` (`SlotRecipeFn<ButtonRecipeVariants, ButtonSlot>`), which the
[`recipe-registry`](../registry/recipe-registry.md) references as its `button` entry — so the registry
stays a flat list of named recipe types and this file owns the Button shape. It additionally exports
[`ButtonThemeableProps`](#buttonthemeableprops), the `button` entry of the
[`themeable-props-registry`](../registry/themeable-props-registry.md).

## Vocabulary

| Type | Members | Notes |
| --- | --- | --- |
| `ButtonVariant` | `default` · `solid` · `soft` · `outline` · `ghost` · `link` | `default` is neutral chrome and ignores `color`. |
| `ButtonColor` | `primary` · `neutral` · `success` · `warning` · `danger` · `info` | Semantic role color. |
| `ButtonSize` | `xs` · `sm` · `md` · `lg` · `xl` | Heights 28 / 32 / 36 / 40 / 44px. |
| `ButtonLoaderPlacement` | `start` · `center` · `end` | **Layout only.** Where the loader sits while loading (`center` overlays it and hides the label; `start`/`end` set loader order). Mounting/unmounting the loader slot is the component's job (`<Show when={isLoading()}>`), so there is no `hidden`/`none` member. Shared by this recipe variant and the component's public `loaderPlacement` prop. |
| `ButtonSlot` | `root` · `label` · `startDecorator` · `endDecorator` · `loader` | The recipe's slots. |

## `ButtonRecipeVariants`

The recipe's variant props — all optional:

```ts
interface ButtonRecipeVariants {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  loaderPlacement?: ButtonLoaderPlacement;
}
```

A theme's recipe accepts these and returns one class function per `ButtonSlot`
(`recipe(props).root()`), the standard slot-recipe shape.

## `ButtonThemeableProps`

The curated Button props a preset may default app-wide via `ComponentOverride.defaultProps` — the
`button` entry of the [`themeable-props-registry`](../registry/themeable-props-registry.md). A
**superset of `ButtonRecipeVariants`** by construction (`extends`), so the rename from the old
variants-only `defaultVariants` loses nothing:

```ts
interface ButtonThemeableProps extends ButtonRecipeVariants {
  nativeButton?: boolean; // behavioral policy
  type?: ButtonType; // behavioral policy (from @hope-ui/primitives)
  loader?: () => JSX.Element; // chrome content, as a factory
  loadingText?: () => JSX.Element; // chrome content, as a factory
}
```

| Group | Keys | Why themeable |
| --- | --- | --- |
| Recipe variants | `variant` · `color` · `size` · `fullWidth` · `loaderPlacement` | Visual axes; inherited from `ButtonRecipeVariants`. |
| Behavioral policy | `nativeButton` · `type` | Durable config a design system legitimately sets once. |
| Chrome content | `loader` · `loadingText` | Content the component renders itself; a design system sets the brand loader once. |

**Deliberately excluded:** per-instance payload content (`children`, `startDecorator`/`endDecorator`),
transient state (`loading`, `disabled`), styling (`class`, `slotClasses`), events, and DOM attributes.

**Chrome content is a factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one
object shared by every instance, and a Solid `JSX.Element` is an already-built node that would *move* if
reused — so a factory (called per instance) is what keeps two simultaneously-loading buttons from
fighting over one loader node. The component prop widens to `JSX.Element | (() => JSX.Element)` (a bare
element still works per-instance) and resolves the two forms through
[`runIfFunction`](../../primitives/utils/run-if-function/run-if-function.md). A components-side
compile-time drift guard keeps `ButtonProps` and `ButtonThemeableProps` aligned (themeable ⊆ component
props).
