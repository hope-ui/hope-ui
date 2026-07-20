# `hydrateFixture`

Hydrates genuine server-rendered HTML in a real browser and asserts the full hydration
contract, so every hydration test states one call instead of re-deriving the `_$HY`
bootstrap, container injection, and node-reuse assertions inline.

## API

```ts
function hydrateFixture(
  serverHtml: string,
  ui: () => JSX.Element,
): { container: HTMLElement; dispose: () => void };
```

- `serverHtml` — genuine server output (real `_hk` hydration keys), obtained from the
  hydration-fixture bridge: `import ssr from "virtual:hydration-fixture?id=<subject>"` renders the
  subject's `Tree` fresh in-process each run (no committed `.html`). See `vitest-hydration-bridge.ts`
  and `__internal__/testing.md`.
- `ui` — the client tree, **structurally identical** to the one that produced `serverHtml` — in
  practice the *same* `Tree` from the subject's `<subject>.ssr-entry.tsx`, which is exactly what
  guarantees it (hydration keys are a path through the component tree, so any structural difference
  — even a component that renders nothing — shifts the keys and breaks hydration).

Returns `{ container, dispose }`. Drive interaction or run `expectNoA11yViolations(container)`
against the hydrated tree, then call `dispose()` to unmount, remove the container, and clear
the `_$HY` bootstrap.

## Example

```ts
import { expectNoA11yViolations, hydrateFixture } from "@hope-ui/internal-test-utils";
import { Tree } from "./button.ssr-entry";
import ssrFixture from "virtual:hydration-fixture?id=button";

const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

// reuse + no-console-output are already asserted by the helper.
await expectNoA11yViolations(container);
dispose();
```

Browser-project only: it needs a real DOM and the client hydrate build. There is no server
render here — the client build's `renderToStringAsync` returns `undefined`, which is why the
server HTML is passed in rather than produced.

## What it asserts

A silent fallback to a client render looks identical to a successful hydration otherwise (see
`__internal__/testing.md`), so on every call the helper asserts:

1. **Hydration is silent** — no `console.error`/`console.warn`. A SolidJS hydration mismatch
   surfaces as a console message, and a would-be reactivity diagnostic is a superset, so "zero
   output" is the check. Console is intercepted only around the `hydrate()` call and restored
   before any assertion throws (stored/restored *unbound*, the way `mount` does it, so a later
   `vi.spyOn(console, ...)` sees the real function).
2. **No element is added or dropped** — `container.querySelectorAll("*")` has the same length
   before and after. A fallback duplicates or drops nodes.
3. **Every element is reused as the same object**, in document order — each pre-hydration
   element is `===` the element at the same index afterward. This generalizes and strictly
   strengthens a per-selector `toBe(serverNode)` / `toHaveLength(1)` check. `querySelectorAll`
   returns only elements, so Solid's internal hydration comment markers can't false-positive.

## `_$HY` bootstrap

`hydrate()` reads `globalThis._$HY` unconditionally. A real app gets it from
`generateHydrationScript()`, which is a no-op in `@solidjs/web`'s client build, so a browser
test must supply it. The helper sets `{ events, completed, r }` — the only fields read on this
path — and clears it on `dispose()`. An empty `r` (the resource/asset registry) is correct:
the element registry `getNextElement()` claims from is built separately by `gatherHydratable()`
scanning the container for `[_hk]` attributes.

## Why the server render isn't inline

Hydration is two module-resolution environments: SSR needs the **server** builds of `solid-js`
and `@solidjs/web`, the client hydrate needs the **client** builds. They cannot coexist in one
Vitest project (and jsdom is deliberately not used), so the server HTML is produced by the
generation bridge — a nested Vite SSR server, configured like the `ssr` project, that the
`browser` project calls through the `virtual:hydration-fixture` module — and handed in as a
string. It is always regenerated, never cached or committed, so it can never go stale. See
`__internal__/testing.md`.
