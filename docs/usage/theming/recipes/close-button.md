# `closeButton` — the CloseButton recipe contract

The variant vocabulary and slots of the CloseButton recipe, owned by `@hope-ui/theming` (the
look-&-feel authority). Types only — no runtime, no CSS.

`@hope-ui/components`' `CloseButton` consumes this contract via `useRecipe("closeButton")`; each
preset (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it, checked by
`hopeRecipes satisfies RecipeRegistry`. This file also exports the assembled recipe type
`CloseButtonRecipe` (`SlotRecipeFn<CloseButtonRecipeVariants, CloseButtonSlot>`), which the
[`recipe-registry`](../registry/recipe-registry.md) references as its `closeButton` entry — so the
registry stays a flat list of named recipe types and this file owns the CloseButton shape. It
additionally exports [`CloseButtonThemeableProps`](#closebuttonthemeableprops), the `closeButton`
entry of the [`themeable-props-registry`](../registry/themeable-props-registry.md).

CloseButton is an **always-icon-only** button that ships a built-in X and self-labels. Its defining
decision: a close affordance must **never assert its own semantic color** — it defers to whatever
surface it sits on. So — unlike Button and Badge — the recipe has **no `variant` and no
`colorScheme`** axis. Instead the glyph inherits `currentColor`, and the hover/press wash + focus
ring are derived from `currentColor` (finished tokens the preset authors in its `tokens.css`), which
makes it legible on solid / soft / light / dark surfaces with zero configuration. Its only axis is
`size`.

## Vocabulary

| Type | Members | Notes |
| --- | --- | --- |
| `CloseButtonSize` | `sm` · `md` · `lg` | Density/scale — a compact corner affordance; smaller default than Button. |
| `CloseButtonSlot` | `root` · `icon` | The recipe's slots. `root` is the `<button>`; `icon` is the host `<span>` wrapping the glyph. |

There is deliberately **no** `CloseButtonVariant` / `CloseButtonColorScheme` type — see the intro.

## `CloseButtonRecipeVariants`

The recipe's variant props — all optional:

```ts
interface CloseButtonRecipeVariants {
  size?: CloseButtonSize;
}
```

A theme's recipe accepts these and returns one class function per `CloseButtonSlot`
(`recipe(props).root()`), the standard slot-recipe shape. The `icon` slot exists so the
hydration-keyed `<button>`'s first child is always a host `<span>`, never a component (see
`solid2-first-child-component-hydration`); it also carries the per-`size` glyph sizing
(`[&_svg]:size-*`).

## `CloseButtonThemeableProps`

The curated CloseButton props a preset may default app-wide via `ComponentOverride.defaultProps` —
the `closeButton` entry of the
[`themeable-props-registry`](../registry/themeable-props-registry.md). A **superset of
`CloseButtonRecipeVariants`** by construction (`extends`):

```ts
interface CloseButtonThemeableProps extends CloseButtonRecipeVariants {
  icon?: () => JSX.Element; // the glyph, as a factory
}
```

| Group | Keys | Why themeable |
| --- | --- | --- |
| Recipe variants | `size` | Visual axis; inherited from `CloseButtonRecipeVariants`. |
| Chrome content | `icon` | The glyph the component renders itself; a design system swaps the app-wide close icon once. |

**Deliberately excluded:** transient state (`disabled`), styling (`class`, `slotClasses`), events,
DOM attributes, and per-usage behavioral props (`nativeButton`, `type`) — all stay component props,
never themeable, for the same reasons as Button.

**The glyph is a factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one
object shared by every instance, and a Solid `JSX.Element` is an already-built node that would *move*
if reused — so a factory (called per instance) is what lets a preset swap the app-wide close icon
without two close buttons fighting over one node. The component prop widens to `JSX.Element | (() =>
JSX.Element)` (a bare element still works per-instance) and resolves the two forms through
[`runIfFunction`](../../primitives/utils/run-if-function/run-if-function.md). On the components side,
`CloseButtonProps` `Omit`s and re-declares `icon` wider, so the themeable surface and the component
props stay aligned by construction.
