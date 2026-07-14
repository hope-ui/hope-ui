# Styling helpers (`@hope-ui/theming`)

hope-ui's recipe engine and class-merge helpers, all sourced from `tailwind-variants` (it ships its
own `clsx`-equivalent; `tailwind-merge` is its optional peer, provided by `@hope-ui/theming` as a
dependency). No separate `clsx` dependency.

## API

- `tv` — a `createTV`-bound `tailwind-variants` instance. Author recipes with
  `tv({ base, slots, variants, compoundVariants, defaultVariants })`. It is the single source of
  truth for how hope-ui recipes merge conflicting utilities; the shared `twMergeConfig` that
  registers hope's semantic color groups is added here alongside the first slot recipe.
- `cn(...classes)` — concatenate **with** tailwind-merge conflict resolution (last wins). For the
  rare non-recipe merge.
- `cx(...classes)` — concatenate **without** conflict resolution (clsx-style).

## Merging a consumer `class`

Prefer merging through the recipe's slot function — it inherits the `tv` config and lets the
consumer's utilities win:

```ts
const recipe = useRecipe("button");
// class = recipe({ size, variant }).root({ class: props.class })
```

Reach for `cn` only when there is no recipe in play.
