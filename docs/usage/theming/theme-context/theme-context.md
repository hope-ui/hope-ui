# `ThemeProvider` / `useRecipe`

The runtime seam of the multi-theme system. A `ThemeProvider` injects a **theme** — a map of
recipe name → pure slot-recipe function — into context; a component reads one recipe out with
`useRecipe` and computes its slots' classes from it.

```tsx
import { ThemeProvider, useRecipe } from "@hope-ui/theming";
import { hopeRecipes } from "@hope-ui/presets/hope"; // the preset's recipe map

function App() {
  return (
    <ThemeProvider theme={hopeRecipes}>
      <MyComponent />
    </ThemeProvider>
  );
}

// Inside a component — class computed in a getter. Every recipe is a slot recipe used as-is, so
// each slot is a class *function*; a single-part component uses the `root` slot:
function MyComponent(props) {
  const recipe = useRecipe("button");
  return <button class={recipe({ variant: props.variant }).root({ class: props.class })} {...rest} />;
}
```

The recipe name (`button`) must be one the contract declares in
[`registry`](../recipes/registry.md); a theme's map (`hopeRecipes`) implements every entry there.

## API

### `ThemeProvider(props)`

| Prop | Type | Notes |
| --- | --- | --- |
| `theme` | `RecipeRegistry` | Map of recipe name → slot-recipe function (variant props → per-slot class functions). Injected as *functions*, not imported at build time. Theme is chosen at build time, so this is effectively static. |
| `children` | `JSX.Element` | — |

Renders **no DOM of its own** (it is `<ThemeContext value={theme}>`). It is built on the kernel's
isomorphic `createComponentContext`, so it is server-readable during `renderToStringAsync` — which
is what "works in SolidStart" requires.

### `useRecipe<K extends keyof RecipeRegistry>(key: K): RecipeRegistry[K]`

Returns the slot-recipe function registered under `key` in the current theme.

- Throws a friendly, `ThemeProvider`-naming error when called with no `<ThemeProvider>` above it.
- Throws a clear error when the mounted theme provides no recipe for `key` (a theme built against
  an older contract, or a JS consumer bypassing the types) instead of a downstream
  "undefined is not a function".

The returned function is a pure prop→classNames mapper, so the classes it produces are **byte-stable
across server and client** — the property the SSR/hydration round-trip depends on.

## SSR / hydration note

`ThemeProvider` emits no markup, but **wrapping a subtree in it shifts that subtree's hydration
keys (`_hk`)** — hydration keys are a path through the component tree. So a component's SSR fixture
and its hydration test must both include `<ThemeProvider>` identically, or the keys diverge.

## Related

- [`registry`](../recipes/registry.md) — the `RecipeRegistry` this reads; [`slot-recipe`](../recipes/slot-recipe.md) — the `SlotRecipeFn` shape.
- [`conformance`](../conformance/conformance.md) — the kit that verifies a theme's recipes actually emit classes.
