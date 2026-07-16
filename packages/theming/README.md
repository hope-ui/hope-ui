# @hope-ui/theming

The **theming contract** and dependency-inversion seam for [hope-ui](../../README.md).
[`@hope-ui/components`](../components/README.md) reads recipes *from* it;
[`@hope-ui/presets`](../presets/README.md) implement *it*; neither package knows about the other.
It owns the look-&-feel contract (the closed, hand-declared `RecipeRegistry`), the semantic-token
vocabulary, and the Tailwind styling seam.

It depends on [`@hope-ui/primitives`](../primitives/README.md) for `createComponentContext` — which
is why primitives can't fold into components (that would make a `components → theming → components`
cycle).

## Install

> Not yet published — see the repo [status](../../README.md#status).

```bash
pnpm add @hope-ui/theming
```

Peer dependencies: `solid-js` and `@solidjs/web` (`2.0.0-beta.x`). Bundled: `tailwind-variants` and
`tailwind-merge` (the styling seam).

## Subpath exports

| Import | Contents |
| ------ | -------- |
| `@hope-ui/theming` | The contract kernel: `ThemeProvider`/`useRecipe`/`useDefaults`/`useSlots`/`useTheme`; `definePreset`/`isPreset` and the `Preset` type; the `RecipeRegistry` + `ThemeablePropsRegistry` types and `THEMING_CONTRACT_VERSION`; `SlotRecipeFn`/`SlotClassFn` and each component's recipe/themeable-props types; `SEMANTIC_COLOR_TOKENS` + `SemanticColorContract`; and the `tv`/`cn`/`cx` styling helpers. |
| `@hope-ui/theming/conformance` | A generic runtime conformance kit — `checkSlotRecipeConformance`/`assertSlotRecipeConformance` (recipe axis) and `checkSemanticTokenConformance`/`assertSemanticTokenConformance` (token axis). Kept off the main subpath so it never enters a runtime consumer's bundle. |

## How it works

- **`ThemeProvider` / `useRecipe`.** `<ThemeProvider preset={…}>` injects a preset into context;
  a component reads one recipe out with `useRecipe("<name>")` and computes its slot classes in a
  getter. Built on the isomorphic `createComponentContext`, so it is server-readable during
  `renderToStringAsync` — that is the whole of "works in SolidStart" for theming. The provider
  renders no DOM of its own.
- **`RecipeRegistry`.** The single source of truth for every hope-authored component's recipe
  (variant vocabulary + slots). A component does **not** `declare module` its own recipe — both the
  component and every preset import the contract types from here (no module augmentation).
- **Every recipe is a slot recipe.** There is no single-class form; a one-part component uses the
  `root` slot, so a caller always deals in `recipe(props).<slot>()`.
- **`defaultProps` + `ThemeablePropsRegistry`.** A preset can default a component's *themeable-props
  surface* (recipe variants plus reuse-safe chrome factories) app-wide; `useDefaults` merges them at
  `instance ?? preset ?? builtin` precedence. The registry is intentionally non-exhaustive.
- **Semantic tokens.** `SEMANTIC_COLOR_TOKENS` is the design-system-agnostic role vocabulary every
  preset implements (`primary`, `surface`, `foreground`, `on-primary`, `focus`, `scrim`, …), read as
  Tailwind utilities (`bg-primary`, `text-on-primary`). Because presets ship CSS variables rather
  than typed objects, completeness is enforced at the CSS level by the conformance kit, not by `tsc`.

## Usage

Reading a recipe inside a component (`button` is the recipe registered today):

```tsx
import { useRecipe } from "@hope-ui/theming";
import { renderElement } from "@hope-ui/primitives/utils";

function Button(props) {
  const recipe = useRecipe("button");
  return renderElement("button", props, {
    get class() {
      return recipe(props).root({ class: props.class });
    },
  });
}
```

Declaring a **new** component's contract (in this package, then implemented by each preset):

```ts
// recipes/accordion.ts
export interface AccordionRecipeVariants { size?: "sm" | "md"; }
export type AccordionSlot = "root" | "item" | "trigger";

// registry/recipe-registry.ts
interface RecipeRegistry {
  accordion: SlotRecipeFn<AccordionRecipeVariants, AccordionSlot>;
}
```

## Docs

Per-symbol API detail lives under [`docs/usage/theming/`](../../docs/usage/theming/) (including the
authoritative [semantic-token reference](../../docs/usage/theming/semantic-tokens/semantic-tokens.md)).
The orientation doc — the two axes, the contract, and how a preset implements it — is
[`docs/theming.md`](../../docs/theming.md).

## License

MIT.
