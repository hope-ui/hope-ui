# `theme-recipes` — the theming contract

Pure types + one constant. The shared vocabulary `@hope-ui/components` reads through `useRecipe`
and every theme implements and augments. Imports nothing; emits no CSS.

It is deliberately **empty of component knowledge** — no component's API or styling has been
designed yet, so it pins no recipe names and no variant values. It fixes only the *shape* a recipe
takes and the machinery to register and read them.

## The registry

```ts
// Empty by design — populated by augmentation.
interface ThemeRecipes {}
```

A recipe becomes reachable through `useRecipe` only once a component or theme registers it:

```ts
declare module "@hope-ui/theming" {
  interface ThemeRecipes {
    // one entry per component; the variant vocabulary is that component's own decision
    accordion: SlotRecipeFn<{ size?: "sm" | "md" }, "root" | "item" | "trigger">;
  }
}
```

## Every recipe is a slot recipe

hope-ui has **no single-class recipe form**. Even a component with one visual part uses a slot
recipe, and that part is the `root` slot (the default type parameter). This keeps every component
uniform — a consumer/theme always deals in `recipe(props).<slot>`, never a bare string for some
components and a record for others.

| Type | Shape |
| --- | --- |
| `SlotRecipeFn<Variants>` | `(props?: Variants) => Record<"root", string>` — single-part component |
| `SlotRecipeFn<Variants, Slot>` | `(props?: Variants) => Record<Slot, string>` — multi-part component |

A slot recipe is emitted by Panda **as a unit**: once the recipe is used at a variant combination,
every slot's CSS for that combination is emitted (no per-slot tree-shaking within a used recipe).

## `THEMING_CONTRACT_VERSION`

A constant a theme asserts against so a preset built against a different contract shape fails
loudly rather than drifting silently (a Panda preset carries no TS-contract awareness on its own).
Bump on any breaking change to the recipe shape or the registry mechanics.

## Related

- [`theme-context`](../theme-context/theme-context.md) — `ThemeProvider` / `useRecipe` over this registry.
- [`conformance`](../conformance/conformance.md) — the runtime drift gate.
