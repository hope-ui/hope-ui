# How solid-zero is tested

Three Vitest projects. **One job each, one module resolution each.** If a test doesn't
obviously belong to exactly one of them, that's a signal the test is doing two things.

| Project | Command | Runs in | `solid-js` / `@solidjs/web` resolve to | For |
|---|---|---|---|---|
| `unit` | `pnpm test` | Node, **no DOM** | client builds | Pure logic. No `document` exists. |
| `ssr` | `pnpm test:ssr` | Node, no DOM | **server** builds | The HTML a server sends. |
| `browser` | `pnpm test:browser` | real Chromium | client builds | DOM, focus, pointer, axe, hydration. |

Plus Storybook (`pnpm storybook`), which is for human eyes, not assertions.

File names pick the project, and `scripts/check-coverage-parity.mjs` enforces that every
source file has the right ones:

```
Foo.test.ts(x)          → unit
Foo.ssr.test.ts(x)      → ssr
Foo.browser.test.ts(x)  → browser
```

## Why the split is by *module resolution*, not by taste

`solid-js` and `@solidjs/web` each ship **two builds**, chosen by `package.json#exports`
conditions:

- the **server** build produces HTML strings, `isServer` is `true`, `Portal` throws, and
  `template`/`insert`/`spread`/`setAttribute` are stubs that throw *"Client-only API called on
  the server side"*;
- the **browser** build produces real DOM, `isServer` is `false`, and `renderToStringAsync` is
  a stub that `console.error`s and returns `undefined`.

They also differ in ways that are invisible until they aren't. `createUniqueId()` is three
different functions:

| build | `createUniqueId()` | consumes a hydration id? |
|---|---|---|
| server | `getNextChildId(owner)` | yes |
| client, hydrating | `sharedConfig.getNextContextId()` | yes |
| client, not hydrating | `` `cl-${counter++}` `` | **no** |

The first two bottom out in the same `nextChildIdFor(owner)`, which is why a real server render
and a real hydrating client agree on every `_hk` key.

**Vite's default `resolve.conditions` includes `browser` regardless of Vitest's
`test.environment`.** `environment: "node"` swaps JS globals like `document`; it does not touch
package `#exports` resolution. So a node project silently gets browser builds unless you alias
them. That is the entire reason the `ssr` project exists as its own thing.

### The bug this layout was extracted from

For months there were only two projects, and the `unit` one aliased `@solidjs/web` to its
server build — but not `solid-js`. That hybrid rendered "server" HTML using the *browser*
`createUniqueId`, which consumes no id. Every hydration key after the first `createUniqueId()`
was off by one, and `Dialog`'s hydration test sat `it.skip`'d with a recorded root cause
("separate Vite builds → different module instances") that was simply wrong.

Aliasing both packages exposed a second layer: `@solidjs/web/dist/server.js` is externalized
and loaded by Node, so *its* `import { createRoot } from "solid-js"` never saw the alias. Two
`solid-js` instances, two `currentOwner`s, and `createUniqueId()` throwing *"cannot be used
outside of a reactive context"* — the same error an earlier attempt hit and never explained.
`server: { deps: { inline: [...] } }` routes those imports back through Vite's resolver.

Both fixes live in `vitest.config.ts`, commented.

## Writing an SSR test

Assert on the string a server would send. `Dialog.ssr.test.tsx` is the model: it checks that
`renderToStringAsync` resolves, that portaled content is absent, that no dangling `aria-controls`
IDREF is emitted.

Every `@solid-zero/components` source file **must** have a `Foo.ssr.test.tsx` containing a real
`renderToStringAsync()` call — not in a comment, not in a string, not merely imported, not
inside an `it.skip`. `check:coverage-parity` checks all four.

Put the call in the wrong project and it fails loudly rather than silently: in `unit` and
`browser`, `renderToStringAsync` is a stub that logs *"renderToStringAsync is not supported in
the browser, returning undefined"* and returns `undefined`.

## Writing a hydration test

Hydration is, by definition, two environments: the server renders, the browser takes over the
DOM it produced. No single project can do both. They cooperate through a **committed fixture**:

```
src/dialog/__fixtures__/dialog-ssr.html   ← genuine server output, checked in

Dialog.ssr.test.tsx      toMatchFileSnapshot(fixture)   ← generates it, then guards it
Dialog.browser.test.tsx  hydrate(<Dialog/>, containerWithFixture)
```

Corrupt the fixture and **both** halves go red: the `ssr` one because the server no longer
produces it, the `browser` one because there is nothing to hydrate against.

### Adding one for a new component

**Never hand-write a fixture.** `_hk` keys are a path through the component tree; guessing one
is how you get a test that passes against markup no server would ever send.

1. In `Foo.ssr.test.tsx`, render and snapshot to the fixture path:
   ```ts
   const html = await renderToStringAsync(() => <FullFoo />);
   await expect(html).toMatchFileSnapshot("./__fixtures__/foo-ssr.html");
   ```
2. Run `pnpm test:ssr`. The file appears, written from a real server render. Read it, sanity
   check it, commit it.
3. In `Foo.browser.test.tsx`, `import ssrFixture from "./__fixtures__/foo-ssr.html?raw"` and
   `hydrate()` against it.

`toMatchFileSnapshot` fails on any drift, and under `CI=true` fails rather than writing — so a
missing or stale fixture can never pass CI. Update one deliberately with
`pnpm exec vitest run --project=ssr -u`.

`check:coverage-parity` requires a real `hydrate()` call in every component's
`Foo.browser.test.tsx`, on the same "not in a comment, not in an `it.skip`" terms as the SSR
half. Without that rule, deleting a component's entire hydration suite kept CI green — which is
exactly how Dialog's stayed skipped for months while `CLAUDE.md` claimed it had one.

`check:coverage-parity` requires a real `hydrate()` call in every component's
`Foo.browser.test.tsx`, on the same "not in a comment, not in an `it.skip`" terms as the SSR
half. Without that rule, deleting a component's entire hydration suite kept CI green — which is
exactly how Dialog's stayed skipped for months while `CLAUDE.md` claimed it had one.

Three things the browser half must assert, because a silent fallback to a client render looks
identical to success otherwise:

1. no `console.error` / `console.warn` (mismatch warnings land there),
2. exactly one of the element (a fallback leaves two),
3. the surviving node is *the same object* as the server's node.

`hydrate()` also reads `globalThis._$HY`, which a real app gets from
`generateHydrationScript()` — a no-op in the client build. Test files hand-roll it. Only
`.done`, `.completed` and `.events` are read; `.r` is the resource registry, not the element
registry. `hydrate()` builds the element registry itself by scanning the container for `[_hk]`
attributes.

**Hydration keys are a path through the component tree.** Inserting a component before
`Dialog.Trigger` — even one that renders nothing — shifts the trigger's key. The `ssr` and
`browser` test files therefore define structurally identical component trees, and both say so
in a comment.

## `mount()` fails on Solid reactivity diagnostics

`mount()` (from `@solid-zero/internal-test-utils`) throws from `dispose()` if SolidJS emitted
`STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE` while the tree was mounted. The
browser suite used to print 170 of the first per run, which made the next real one invisible —
and it is the only diagnostic that catches the conditionally-rendered-ref race `CLAUDE.md`
documents at length. A *deliberate* untracked read is spelled `untrack(...)`. See `mount.md`.

## `expectNoA11yViolations` fails on `incomplete` too

axe splits results three ways: `passes`, `violations`, `incomplete`. The third is "axe ran this
rule and could not decide; a human should look". It used to be dropped on the floor. When axe
genuinely can't judge (`color-contrast` over an unresolvable background), name the rule in
`allowIncomplete` at the call site with a reason. See `axe.md`.

## Two guards that aren't tests

- `pnpm check:coverage-parity` — every `packages/*/src` file has a colocated test and `.md` doc;
  every component additionally has a `.stories.tsx` and a real `.ssr.test.tsx`.
- `pnpm check:dist-imports` — no built `dist/**/*.js` imports a client-only `@solidjs/web`
  helper. This enforces the invariant SSR silently depends on: **no component may write a
  literal host JSX element** (`<div>`, `<span>`, an SVG arrow). Those compile to a module-scope
  `_$template()` call, which throws at *import* on the server. Route every host element through
  `renderElement`. Run it after `pnpm build` — it reads `dist/`.

## Why `unit` has no DOM at all

Not jsdom, and deliberately. jsdom cannot be trusted for focus, keyboard or pointer behavior,
so those tests belong in `browser` against real Chromium. With no `document` in `unit`, writing
one in the wrong place is *impossible* rather than merely discouraged.
