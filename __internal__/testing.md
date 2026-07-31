# How hope-ui is tested

Three Vitest projects. **One job each, one module resolution each.** A test that doesn't obviously
belong to exactly one of them is a test doing two things.

| Project | Command | Runs in | `solid-js` / `@solidjs/web` resolve to | For |
|---|---|---|---|---|
| `unit` | `pnpm test` | Node, **no DOM** | client builds | Pure logic. No `document` exists. |
| `ssr` | `pnpm test:ssr` | Node, no DOM | **server** builds | The HTML a server sends. |
| `browser` | `pnpm test:browser` | real Chromium | client builds | DOM, focus, pointer, axe, hydration. |

Plus Storybook (`pnpm storybook`), for human eyes, not assertions.

File names pick the project, and `scripts/check-coverage-parity.mjs` enforces that every source file
has the right ones:

```
Foo.test.ts(x)          → unit
Foo.ssr.test.ts(x)      → ssr
Foo.browser.test.ts(x)  → browser
```

The `unit` project also picks up `scripts/**/*.test.mjs` — the check scripts' own tests, which need
no solid, no DOM and no aliases, so they want exactly what `unit` already is rather than a fourth
project.

## Testing a check script

A check script is an executable: it walks the repo, prints, and calls `process.exit`. Importing one
to reach a single function runs the whole check, so **the rule moves into `scripts/lib/` and the
executable keeps only the walk, the path prefixing and the exit.** Every rule now lives that way:

| Rule | Executable |
|---|---|
| `lib/rejected-alternatives.mjs` | `check-coverage-parity.mjs` |
| `lib/class-forwarding.mjs` | `check-class-forwarding.mjs` |
| `lib/recipe-purity.mjs` | `check-recipe-purity.mjs` |
| `lib/rtl-safety.mjs` | `check-rtl-safety.mjs` |
| `lib/source-projection.mjs` | all four (the shared tokenizer) |

An extracted rule is a **pure function over source text** returning
`Array<{ line: number, message: string }>` — no I/O, no module-scope accumulator, no `console`. The
structured return is what lets a test assert on line numbers; formatting stays in the executable.

Two rules for writing these tests, both learned the hard way:

- **Weight the cases toward the escape hatches, the near-misses that must stay legal, and the
  projections.** A checker that gets *stricter* breaks the build for correct code, which is as much
  a regression as one that goes quiet. Every one of these scripts names its own forbidden patterns
  in its header, so "the pattern appears in a comment and is not reported" is a real case, not a
  contrived one.
- **Verify by mutation, not by passing.** Break the rule 4–6 ways and confirm each break fails at
  least one test. A mutation that survives is a hole — three of the four suites found one that way,
  including a `splitVariants` bracket-depth case that no end-to-end test reached.

The Definition of Done does **not** reach `scripts/`. These carry tests because their failure mode
is *silent acceptance*: a physical `pr-8` mis-paints for every RTL reader while the suite stays
green, and if the checker itself regresses nothing says so.

## Why the split is by *module resolution*, not by taste

`solid-js` and `@solidjs/web` each ship **two builds**, chosen by `package.json#exports` conditions:

- **server** — produces HTML strings, `isServer` is `true`, `Portal` throws, and
  `template`/`insert`/`spread`/`setAttribute` are stubs throwing *"Client-only API called on the
  server side"*.
- **browser** — produces real DOM, `isServer` is `false`, `renderToStringAsync` is a stub that
  `console.error`s and returns `undefined`.

They also differ invisibly. `createUniqueId()` is three different functions:

| build | `createUniqueId()` | consumes a hydration id? |
|---|---|---|
| server | `getNextChildId(owner)` | yes |
| client, hydrating | `sharedConfig.getNextContextId()` | yes |
| client, not hydrating | `` `cl-${counter++}` `` | **no** |

The first two bottom out in the same `nextChildIdFor(owner)`, which is why a real server render and a
real hydrating client agree on every `_hk` key.

**Vite's default `resolve.conditions` includes `browser` regardless of Vitest's `test.environment`.**
`environment: "node"` swaps JS globals like `document`; it does not touch package `#exports`
resolution. A node project silently gets browser builds unless you alias them — the entire reason the
`ssr` project exists as its own thing.

Two fixes make it work, both commented in `vitest.config.ts`:

- **Alias both packages**, not just `@solidjs/web`. Aliasing `@solidjs/web` alone renders "server"
  HTML using the *browser* `createUniqueId`, which consumes no id — every hydration key after the
  first `createUniqueId()` is off by one.
- **`server: { deps: { inline: [...] } }`.** `@solidjs/web/dist/server.js` is externalized and loaded
  by Node, so *its* `import { createRoot } from "solid-js"` never sees the alias: two `solid-js`
  instances, two `currentOwner`s, and `createUniqueId()` throwing *"cannot be used outside of a
  reactive context"*. Inlining routes those imports back through Vite's resolver.

## Writing an SSR test

Assert on the string a server would send. `dialog.ssr.test.tsx` is the model: `renderToStringAsync`
resolves, portaled content is absent, no dangling `aria-controls` IDREF is emitted.

Every `@hope-ui/components` source file **must** have a `Foo.ssr.test.tsx` containing a real
`renderToStringAsync()` call — not in a comment, not in a string, not merely imported, not inside an
`it.skip`. `check:coverage-parity` checks all four.

Put the call in the wrong project and it fails loudly: in `unit` and `browser`,
`renderToStringAsync` is a stub that logs *"renderToStringAsync is not supported in the browser,
returning undefined"* and returns `undefined`.

## Writing a hydration test

Hydration is two environments by definition — the server renders, the browser takes over the DOM it
produced — so no single project can do both. **Neither half needs a committed file:**

| Guarantee | Where it lives |
|---|---|
| **Hydration correctness** — server HTML hydrates with node reuse, no mismatch, `_hk` agreement | the `browser` test hydrates HTML from an always-fresh **generation bridge** |
| **Byte-exact SSR regression** — a reviewable guard against `_hk`-affecting drift | `toMatchInlineSnapshot()` in the `ssr` test — inside the `.tsx`, zero files |

Server HTML is regenerated in-process every run. At 40+ components, one auto-generated `.html` per
subject churns on every `_hk`-affecting change until the diffs stop being reviewed (snapshot-rot); a
persisted or gitignored *cache* is worse, since a stale one is a silent wrong-green.

### One tree, three consumers: the render entry

Each subject has a **render entry** beside its tests, `__tests__/<subject>.ssr-entry.tsx`, exporting
the `Tree` it renders plus a `renderFixture()`:

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

### The generation bridge

`vitest-hydration-bridge.ts` (wired into the `browser` project in `vitest.config.ts`) serves a
virtual module: `import ssr from "virtual:hydration-fixture?id=<subject>"` resolves to genuine server
HTML, rendered **fresh in-process** each run. It is vite-inside-vite — the plugin runs in the
`browser` project (client builds) yet spins up one nested Vite **SSR** server configured exactly like
the `ssr` project (server-build aliases, `generate: "ssr"`, `ssr.noExternal`), `ssrLoadModule`s the
subject's entry, and calls `renderFixture()`. Same config in, so its bytes equal what the `ssr`
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
can't pass CI. `check:coverage-parity` still requires a real `renderToStringAsync()` in the `ssr` test
and a real `hydrate()` / `hydrateFixture()` in the `browser` test, on the same "not in a comment, not
in an `it.skip`" terms.

**Hydration keys are a path through the component tree.** Prepending anything before a subtree — even
a component that renders nothing — shifts its key and breaks hydration. The `hydrateFixture` suite
pins that failure directly: a prepended element makes `hydrate()` throw `Hydration Mismatch`.

## `mount()` fails on Solid reactivity diagnostics

`mount()` (from `@hope-ui/internal-test-utils`) throws from `dispose()` if SolidJS emitted
`STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE` while the tree was mounted. It is the only
diagnostic that catches the conditionally-rendered-ref race `CLAUDE.md` documents. A *deliberate*
untracked read is spelled `untrack(...)`. See `mount.md`.

## Every browser test that mounts DOM runs axe

`check:coverage-parity` requires that any `*.browser.test.*` calling `mount()` also calls
`expectNoA11yViolations()`. "Renders real DOM" isn't mechanically decidable, but `mount()` is the
harness that does it — so calling one obliges you to call the other, and a test that renders nothing
(`solid-contract.browser.test.tsx`) stays exempt with no allowlist to maintain.

axe splits results three ways: `passes`, `violations`, `incomplete`. The third is "axe ran this rule
and could not decide; a human should look". When axe genuinely can't judge (`color-contrast` over an
unresolvable background), name the rule in `allowIncomplete` at the call site with a reason. See
`axe.md`.

## The guard that isn't a test

`pnpm check:coverage-parity` enforces the Definition of Done as *behavior*, not file presence: in
every case the call must be real — not in a comment, not in a string, not merely imported, not inside
an `it.skip`. The enforced set is in `__internal__/definition-of-done.md`.

## Why `unit` has no DOM at all

Not jsdom, and deliberately. jsdom cannot be trusted for focus, keyboard or pointer behavior, so
those tests belong in `browser` against real Chromium. With no `document` in `unit`, writing one in
the wrong place is *impossible* rather than merely discouraged.

## The `browser` project keeps its scrollbars

Playwright pushes `--hide-scrollbars` on **every** headless launch (`_innerDefaultArgs`, gated on
`options.headless`), so the project used to run with no scrollbar gutter at all:
`window.innerWidth - document.documentElement.clientWidth` measured 0 with the document overflowing.
That is precisely the quantity `createScrollLock` compensates, so its arithmetic branch was
unreachable — a test could only pin *which property* the lock wrote, never the value.

`vitest.config.ts` drops the arg via `launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] }`.
Two things worth knowing before touching it:

- **It works in `chromium-headless-shell`**, the only build CI installs (`playwright install
  --with-deps --only-shell`) — a measured 15px gutter, not a full-Chromium-only capability.
- **Overlay scrollbars were a red herring.** `--disable-features=OverlayScrollbar` on its own leaves
  the gutter at 0, because `--hide-scrollbars` is what removes it.

A real gutter is also the more faithful environment — it is what a desktop reader has — and every
gutter assertion in `create-scroll-lock.browser.test.tsx` opens with `expect(gutter)
.toBeGreaterThan(0)` so that re-adding the arg fails loudly rather than passing vacuously.
