# hope-ui theming

How a hope-ui component gets its styling, and how a theme provides it. This is the orientation
doc; per-symbol API detail lives in the colocated `.md` files under `packages/theming/src/`, and
the full rationale (the multi-theme feasibility analysis) is in the approved plan referenced from
`CLAUDE.md`.

## The two axes

Theming spans two package axes that never mix dependencies:

- **Runtime** (imported into app code; peer deps `solid-js` / `@solidjs/web`):
  `@hope-ui/primitives` ← `@hope-ui/theming` ← `@hope-ui/components`.
- **Config** (consumed by the *consumer's* `panda.config.ts` + `panda codegen`; peer dep
  `@pandacss/dev`): `@hope-ui/themes/{base,nova,…}`. Each theme depends *up* on `@hope-ui/theming`
  for the contract types.

`@hope-ui/theming` is the dependency-inversion seam: components read from it, themes implement it,
and neither knows about the other.

## The contract (`@hope-ui/theming`)

- **`ThemeProvider` / `useRecipe`** — a `ThemeProvider` injects a **theme** (a map of recipe name →
  pure recipe function) into context; a component reads one out with
  `const recipe = useRecipe("<name>")` and computes its class(es) in a getter. Built on the
  isomorphic `createComponentContext`, so it is server-readable during `renderToStringAsync` —
  which is the whole of "works in SolidStart" for theming.
- **`ThemeRecipes`** — an **empty, augmentable** registry. It seeds no component names and no
  variant vocabulary; a recipe becomes reachable only once a component or theme registers it.
- **`SlotRecipeFn<Variants, Slot = "root">`** — **every recipe is a slot recipe.** There is no
  single-class recipe form: a one-part component uses the `root` slot, so a caller always deals in
  `recipe(props).<slot>`, never a bare string for some components and a record for others.
- **`THEMING_CONTRACT_VERSION`** — a constant themes assert against to catch preset↔contract drift.
- **`@hope-ui/theming/conformance`** — a generic runtime kit
  (`checkSlotRecipeConformance` / `assertSlotRecipeConformance`) a theme runs post-`codegen` to
  prove each recipe actually emits a class for every slot at every variant combination it declares.

Theme is chosen at **codegen time**; runtime theme-switching is out of scope (two ejected presets
would collide on recipe names, or namespacing would ship every theme's CSS in one bundle).

## Adding a component (the shape to follow)

1. Design the component's variants and slots — its own decision, no shared vocabulary is imposed.
2. Register its recipe on the contract by augmentation:
   ```ts
   declare module "@hope-ui/theming" {
     interface ThemeRecipes {
       accordion: SlotRecipeFn<{ size?: "sm" | "md" }, "root" | "item" | "trigger">;
     }
   }
   ```
3. In the component, compute `class` in a getter from `useRecipe("accordion")(props).<slot>` — the
   `box.tsx` pattern — and render through `renderElement` for `as`/`render` polymorphism.
4. Add the matching recipe (a Panda slot recipe with `jsx` hints, internal state authored as
   conditions **nested inside** consumer-facing variants — never a top-level `state` axis) to each
   theme preset under `@hope-ui/themes/*`.

## Adding a theme

A theme is a Panda preset built on `@hope-ui/themes/base` plus its own `semanticTokens` and, once
components exist, its own slot recipes (same slots and variant *values* as every other theme — only
the emitted CSS differs). First-party themes are subpaths of `@hope-ui/themes`
(`@hope-ui/themes/nova`, …); a third party publishes its own package implementing the same
contract. For the recipe *functions* the provider injects, prefer bundling the theme's own generated
recipe runtime under a `hash: false` / no-prefix contract (so the class names equal the consumer's
own codegen), exactly as `@hope-ui/styled-system` bundles `css()` today.

## SSR / hydration

Class names are pure, deterministic mappers, so server and client produce identical markup
(`hash: false` makes them byte-identical). `ThemeProvider` renders no DOM of its own — but
**wrapping a subtree in it shifts that subtree's hydration keys (`_hk`)**, so a component's SSR
fixture and its hydration test must both include `<ThemeProvider>` identically.

## Current state

The contract and `@hope-ui/themes/{base,nova}` are built; `nova` ships tokens only (no recipes
yet). No components consume `useRecipe` yet, and there is no second theme — both arrive when the
first real component is designed. See the plan's "Implementation status & decisions" for the full
done/deferred breakdown.
