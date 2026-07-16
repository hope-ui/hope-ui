# How hope-ui is tested

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

Assert on the string a server would send. `dialog.ssr.test.tsx` is the model: it checks that
`renderToStringAsync` resolves, that portaled content is absent, that no dangling `aria-controls`
IDREF is emitted.

Every `@hope-ui/components` source file **must** have a `Foo.ssr.test.tsx` containing a real
`renderToStringAsync()` call — not in a comment, not in a string, not merely imported, not
inside an `it.skip`. `check:coverage-parity` checks all four.

Put the call in the wrong project and it fails loudly rather than silently: in `unit` and
`browser`, `renderToStringAsync` is a stub that logs *"renderToStringAsync is not supported in
the browser, returning undefined"* and returns `undefined`.

## Writing a hydration test

Hydration is, by definition, two environments: the server renders, the browser takes over the DOM
it produced. No single project can do both. But **neither half needs a committed file**. A
committed `.html` fixture used to bundle two independent guarantees; split them and each gets a
zero-file home, so a hydration subject adds no committed fixtures at any component count:

| Guarantee | Where it lives now |
|---|---|
| **Hydration correctness** — server HTML hydrates with node reuse, no mismatch, `_hk` agreement | the `browser` test hydrates HTML from an always-fresh **generation bridge** |
| **Byte-exact SSR regression** — a reviewable guard against `_hk`-affecting drift | `toMatchInlineSnapshot()` in the `ssr` test — inside the `.tsx`, zero files |

Why no committed file, and why always-fresh: at 40+ components, one auto-generated `.html` per
subject churns on every `_hk`-affecting structural change until the diffs stop being reviewed
(snapshot-rot). A persisted or gitignored *cache* would be worse — a stale one is a silent
wrong-green. So the server HTML is regenerated in-process every run.

### One tree, three consumers: the render entry

Each subject has a **render entry** beside its tests, `__tests__/<subject>.ssr-entry.tsx`,
exporting the `Tree` it renders plus a `renderFixture()`:

```ts
// button.ssr-entry.tsx
export function Tree() {
  return <ThemeProvider preset={hope}><Button>Click me</Button></ThemeProvider>;
}
export function renderFixture() {
  return renderToStringAsync(() => <Tree />);
}
```

`Tree` is the single source of truth. Three consumers share it, so the server render and the client
hydrate **cannot** structurally diverge (hydration keys are a path through the tree — a shape
mismatch fails hydration):

- `<subject>.ssr.test.tsx` renders `Tree` and `toMatchInlineSnapshot()`s the bytes;
- `<subject>.browser.test.tsx` passes `Tree` to `hydrateFixture` as the client tree;
- the **generation bridge** renders `Tree` server-side to produce the HTML the browser test hydrates.

That is a strict improvement on the old rule of two hand-kept-identical trees each carrying a
"structurally identical" comment.

### The generation bridge

`vitest-hydration-bridge.ts` (wired into the `browser` project in `vitest.config.ts`) serves a
virtual module: `import ssr from "virtual:hydration-fixture?id=<subject>"` resolves to genuine
server HTML, rendered **fresh in-process** each run. It is vite-inside-vite — the plugin runs in the
`browser` project (client builds) yet spins up one nested Vite **SSR** server configured exactly
like the `ssr` project (server-build aliases, `generate: "ssr"`, `ssr.noExternal`), `ssrLoadModule`s
the subject's entry, and calls `renderFixture()`. Same config in, so its bytes equal what the `ssr`
project's inline snapshot pins — the two halves can't drift.

### `hydrateFixture` asserts the whole contract

`hydrateFixture(serverHtml, ui)` (`@hope-ui/internal-test-utils`) injects the server HTML into a
document-attached container, hydrates `ui` against it in real Chromium, and asserts — because a
silent fallback to a client render otherwise looks identical to success:

1. no `console.error` / `console.warn` (mismatch warnings land there),
2. no element added or dropped (a fallback duplicates or replaces nodes),
3. every server node is reused as the **same object**, in document order.

It returns `{ container, dispose }` for follow-up interaction or `expectNoA11yViolations`. It also
hand-rolls the `globalThis._$HY` bootstrap `hydrate()` reads (a real app gets it from
`generateHydrationScript()`, a no-op in the client build); only `.done`/`.completed`/`.events` are
read — `.r` is the resource registry, not the element registry, which `hydrate()` builds itself by
scanning the container for `[_hk]`.

### Adding one for a new component

1. Write `__tests__/<subject>.ssr-entry.tsx` exporting `Tree` + `renderFixture`. **Never hand-write
   `_hk` markup** — a guessed key passes against markup no server would send.
2. Register the entry in `HYDRATION_ENTRIES` in `vitest-hydration-bridge.ts`, and (per package) add
   the `virtual:hydration-fixture?id=*` ambient type under `types/` if not present.
3. In `<subject>.ssr.test.tsx`: `const html = await renderToStringAsync(() => <Tree />); expect(html).toMatchInlineSnapshot();`
   then `pnpm exec vitest run --project=ssr -u` to fill the snapshot. Read it, sanity-check it.
4. In `<subject>.browser.test.tsx`: `import ssr from "virtual:hydration-fixture?id=<subject>"` and
   `hydrateFixture(ssr, () => <Tree />)`.

A snapshot mismatch fails the test, and under `CI=true` fails rather than rewriting, so stale bytes
can't pass CI. `check:coverage-parity` still requires a real `renderToStringAsync()` in the `ssr`
test and a real `hydrate()` / `hydrateFixture()` in the `browser` test, on the same "not in a
comment, not in an `it.skip`" terms — deleting a hydration suite must not stay green (Dialog's sat
`it.skip`'d for months while `CLAUDE.md` claimed it had one).

**Hydration keys are a path through the component tree.** Prepending anything before a subtree —
even a component that renders nothing — shifts its key and breaks hydration. The `hydrateFixture`
suite pins that failure directly: a prepended element makes `hydrate()` throw `Hydration Mismatch`.

## `mount()` fails on Solid reactivity diagnostics

`mount()` (from `@hope-ui/internal-test-utils`) throws from `dispose()` if SolidJS emitted
`STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE` while the tree was mounted. The
browser suite used to print 170 of the first per run, which made the next real one invisible —
and it is the only diagnostic that catches the conditionally-rendered-ref race `CLAUDE.md`
documents at length. A *deliberate* untracked read is spelled `untrack(...)`. See `mount.md`.

## Every browser test that mounts DOM runs axe

`check:coverage-parity` requires that any `*.browser.test.*` calling `mount()` also calls
`expectNoA11yViolations()`. "Renders real DOM" isn't mechanically decidable, but `mount()` is
the harness that does it — so calling one obliges you to call the other, and a test that renders
nothing (`solid-contract.browser.test.tsx`) stays exempt with no allowlist to maintain.

Before this rule, `render.browser.test.tsx` mounted six trees with zero a11y checks, while
`CLAUDE.md` said every DOM-rendering test *should* run one.

axe splits results three ways: `passes`, `violations`, `incomplete`. The third is "axe ran this
rule and could not decide; a human should look". It used to be dropped on the floor. When axe
genuinely can't judge (`color-contrast` over an unresolvable background), name the rule in
`allowIncomplete` at the call site with a reason. See `axe.md`.

## The guard that isn't a test

`pnpm check:coverage-parity` enforces the Definition of Done as *behavior*, not file presence.
Every `packages/*/src` file has a colocated test and a `.md` doc. Every component additionally
has a `.stories.tsx`, a `Foo.ssr.test.tsx` calling `renderToStringAsync()`, and a
`Foo.browser.test.tsx` calling `hydrate()`. Every browser test calling `mount()` also calls
`expectNoA11yViolations()`. In each case the call must be real — not in a comment, not in a
string, not merely imported, not inside an `it.skip`.

(There used to be a second guard, `check:dist-imports`, asserting no built `dist/**/*.js`
imported a client-only `@solidjs/web` helper — the enforcement for the retired
"no literal host JSX element" rule. It's gone: the library now ships JSX-preserved source
under the `"solid"` condition, so literal elements compile per-environment in the consumer's
build. See `docs/plan.md`, "Distribution model".)

## Why `unit` has no DOM at all

Not jsdom, and deliberately. jsdom cannot be trusted for focus, keyboard or pointer behavior,
so those tests belong in `browser` against real Chromium. With no `document` in `unit`, writing
one in the wrong place is *impossible* rather than merely discouraged.
