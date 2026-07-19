# `alert` — the Alert recipe contract

The variant vocabulary and slots of the Alert recipe, owned by `@hope-ui/theming` (the look-&-feel
authority). Types only — no runtime, no CSS.

`@hope-ui/components`' `Alert` consumes this contract via `useRecipe("alert")`; each preset
(`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it, checked by
`hopeRecipes satisfies RecipeRegistry`. This file also exports the assembled recipe type
`AlertRecipe` (`SlotRecipeFn<AlertRecipeVariants, AlertSlot>`), which the
[`recipe-registry`](../registry/recipe-registry.md) references as its `alert` entry — so the registry
stays a flat list of named recipe types and this file owns the Alert shape. It additionally exports
[`AlertThemeableProps`](#alertthemeableprops), the `alert` entry of the
[`themeable-props-registry`](../registry/themeable-props-registry.md).

Alert is a **static, non-interactive** status surface (a compound `<div>`), so — like Badge — the
recipe has no interaction ladder (`-hovered`/`-pressed`), no focus ring. Its axes are the visual
variant × colorScheme × size, plus the exit-transition chrome keyed on the `data-state` attribute the
component writes.

## Vocabulary

| Type | Members | Notes |
| --- | --- | --- |
| `AlertVariant` | `default` · `solid` · `soft` · `subtle` · `outline` | `default` is a role-neutral raised surface whose *icon + title* carry the role color (a dedicated compound variant on those two slots); `solid`/`soft`/`subtle`/`outline` are Badge's fills (minus `dot`/`inverted`) on the whole surface. |
| `AlertColorScheme` | `primary` · `neutral` · `success` · `info` · `warning` · `danger` | Semantic role color scheme. |
| `AlertSize` | `sm` · `md` · `lg` | Density/scale. |
| `AlertSlot` | `root` · `icon` · `content` · `title` · `description` · `actions` · `close` | The recipe's slots. `close` carries placement only; the button chrome comes from CloseButton's own recipe. |

## `AlertRecipeVariants`

The recipe's variant props — all optional:

```ts
interface AlertRecipeVariants {
  variant?: AlertVariant;
  colorScheme?: AlertColorScheme;
  size?: AlertSize;
}
```

A theme's recipe accepts these and returns one class function per `AlertSlot`
(`recipe(props).root()`), the standard slot-recipe shape.

## `AlertThemeableProps`

The curated Alert props a preset may default app-wide via `ComponentOverride.defaultProps` — the
`alert` entry of the [`themeable-props-registry`](../registry/themeable-props-registry.md). It extends
the recipe variants with the four **preset-overridable default status glyphs**:

```ts
interface AlertThemeableProps extends AlertRecipeVariants {
  infoIcon?: () => JSX.Element;
  successIcon?: () => JSX.Element;
  warningIcon?: () => JSX.Element;
  dangerIcon?: () => JSX.Element;
}
```

The glyphs are **flat, discrete factory keys** — never a nested `statusIcons` map: `mergeComponentOverrides`
merges `defaultProps` shallowly per key, so a nested map would drop a partial override. Each is a
**factory** (`() => JSX.Element`), never a bare node (a preset value is shared by every instance, and a
Solid node would *move* if reused), resolved per instance via `runIfFunction`. Only the four status
roles carry a built-in glyph; `primary`/`neutral` ship none. `ThemeablePropsOf<"alert">` therefore
resolves to the recipe variants plus these four keys.
