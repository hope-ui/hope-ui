# `conformance` — the recipe drift gate (`@hope-ui/theming/conformance`)

The **runtime** half of the gate that keeps a theme's Panda preset from drifting out of sync with
the recipe contract. A theme author runs it in a test *after* `panda codegen`, against their
generated recipe functions.

It lives on its own subpath (`@hope-ui/theming/conformance`) so it never enters a runtime
consumer's bundle, and has no test-runner dependency — it returns a result (or throws) so the
author wraps it in whatever `it(...)` they use.

It is **generic**: it knows nothing about any specific component. The author supplies the recipe
plus the prop combinations (`cases`) and `slots` to exercise — those are the component's own
decisions.

```ts
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { accordion } from "../styled-system/recipes"; // this theme's generated fn
import type { ThemeRecipes } from "@hope-ui/theming";

it("accordion conforms", () => {
  const theme = { accordion } satisfies ThemeRecipes; // compile-time: types line up
  assertSlotRecipeConformance(theme.accordion, {
    cases: [{}, { size: "sm" }, { size: "md" }], // the component's own variant combinations
    slots: ["root", "item", "trigger"], // the component's own slots
  }); // runtime: every slot emits a class for every case
});
```

## What it checks — and what it can't

Three layers, each catching what the previous can't:

| Layer | Mechanism | Catches |
| --- | --- | --- |
| `satisfies ThemeRecipes` (author writes it) | Types | A recipe whose *shape* doesn't match the registry entry |
| `assertSlotRecipeConformance` (this kit) | Runtime | A slot/case whose fn returns **no class** (`""` or missing slot) |
| Per-theme visual / story tests | Human / snapshot | **Mapping correctness** — that a variant renders as *this theme's* intended style |

## API

### `checkSlotRecipeConformance(recipe, expectation): { ok: boolean; errors: string[] }`

For every `case` in `expectation`, calls `recipe(case)` and asserts a non-empty class string for
every `slot`. Never throws — collects every failure so a caller can report them all at once.

`expectation` is `{ cases: ReadonlyArray<Variants | undefined>; slots: readonly string[] }`.

### `assertSlotRecipeConformance(recipe, expectation): void`

Throws a single aggregated error when the recipe is non-conformant; the convenient form for a test.

## Related

- [`theme-recipes`](../theme-recipes/theme-recipes.md) — the `SlotRecipeFn` shape and registry this checks against.
- [`theme-context`](../theme-context/theme-context.md) — how components consume a (conformant) theme at runtime.
