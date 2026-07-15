# Styling helpers (`@hope-ui/theming`)

hope-ui's recipe engine and class-merge helpers, all sourced from `tailwind-variants` (it ships its
own `clsx`-equivalent; `tailwind-merge` is its optional peer, provided by `@hope-ui/theming` as a
dependency). No separate `clsx` dependency.

## API

- `tv` — a `createTV`-bound `tailwind-variants` instance. Author recipes with
  `tv({ base, slots, variants, compoundVariants, defaultVariants })`. It is the single source of
  truth for how hope-ui recipes merge conflicting utilities, and it carries the shared
  `twMergeConfig` that registers hope's semantic color vocabulary (see below). A `tv` slot recipe is
  the theming contract's `SlotRecipeFn` **as-is** — no adapter: calling it returns one class
  *function* per slot, and a theme registers the recipe directly (`{ button: buttonRecipe }`).
- `cn(...classes)` — concatenate **with** tailwind-merge conflict resolution (last wins), for the
  rare non-recipe merge.
- `cx(...classes)` — concatenate **without** conflict resolution (clsx-style).

## Merging a consumer `class`

A component merges the consumer's `class` **through the recipe's own slot function**, not `cn` — so
the merge uses this `tv`'s `twMergeConfig` and the consumer's utilities win the conflict:

```ts
const recipe = useRecipe("button");
// root class = recipe({ size, variant, color }).root({ class: props.class })
```

Reach for `cn` only when there is no recipe in play, and `cx` when you deliberately want to keep
both of two conflicting utilities.

## The `twMergeConfig` (semantic colors)

`tv` extends tailwind-merge's `color` theme scale with the full `SEMANTIC_COLOR_TOKENS` vocabulary.
tailwind-merge's default `color` scale is the permissive `isAny`, so semantic fills already collapse
into one `bg-color` / `text-color` / `border-color` / `ring-color` group — but registering the real
token names (`primary`, `primary-soft`, `primary-hover`, `primary-outline`, `on-primary`,
`foreground-muted`, `surface-raised`, `subtle`, `focus`, …) makes conflict resolution deterministic
for the hope palette instead of relying on that fallback, and keeps working if a future
tailwind-merge tightens `isAny`. So within a recipe a base fill (`bg-primary`) is cleanly overridden
by a later variant fill (`bg-danger`) rather than both surviving.
