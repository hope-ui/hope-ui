# Migration checklist: SolidJS 2.0 beta → stable

`hope-ui` is built against a pinned `solid-js` / `@solidjs/signals` / `@solidjs/web`
beta (see `pnpm-workspace.yaml`'s catalog) and **is not published until SolidJS 2.0 ships
stable**. The plan is: build on beta → wait for stable → fix the beta→stable breakage →
publish 1.0.

This file is the living checklist for that pass. Anything discovered along the way that
"we'll deal with at stable" belongs here rather than in a comment nobody will re-read.

---

## 1. Release-blocking: peer ranges publish as an exact pin

Both published packages declare:

```jsonc
"peerDependencies": { "solid-js": "catalog:", "@solidjs/web": "catalog:" }
```

`changeset publish` shells out to `pnpm publish`, which **substitutes `catalog:` with the
catalog's literal version**. The catalog does double duty as the development pin, so on
publish day the peer range becomes an exact `2.0.0`, and every consumer on `2.0.1` gets a
peer conflict.

This is correct today (nothing is published, and the beta genuinely must be pinned). It
becomes a landmine at exactly the moment nobody is looking at `pnpm-workspace.yaml`.

- [ ] Add a named catalog for peer ranges, e.g. `catalogs.solidPeer` → `^2.0.0`, and point
      both packages' `peerDependencies` at `catalog:solidPeer`. Keep the exact pin for
      `devDependencies`.
- [ ] Add `publint` and `@arethetypeswrong/core` to the release job so the published
      manifest is checked mechanically rather than by eye.
- [ ] Verify on a `pnpm pack` tarball, not on the source tree.

---

## 2. The `solid-js` / `@solidjs/web` internals this codebase silently depends on

`@solidjs/web` renamed runtime helpers *within* the beta line (`use` → `ref`,
`addEventListener` → `addEvent`). Several undocumented runtime behaviors are load-bearing
here. **They are now pinned by characterization tests**, so stable breaking any of them shows
up as a red test naming the code that depended on it, rather than as a mysterious component
bug days into the migration:

- `packages/primitives/src/solid-contract.test.ts` — unit project, `solid-js` client build.
- `packages/primitives/src/solid-contract.ssr.test.tsx` — `ssr` project, where both packages
  resolve to their **server** builds.
- `packages/primitives/src/solid-contract.browser.test.tsx` — browser project, client build.

What they pin:

| Behavior | Depended on by |
|---|---|
| `merge` resolves a key by **presence**, not value — a present `undefined` clobbers an earlier value | `withDefaults`, and therefore every prop default |
| `createSignal(fn)` hits the `ComputeFunction` overload and becomes a memo | `createControllableState`'s boxed value |
| `useContext` **throws** with no Provider mounted | `createComponentContext`'s `try/catch` reword |
| Sibling effects run in creation order; on **re-run** their cleanups do too; on **owner disposal** cleanups are LIFO | `createFocusRestore`'s creation order *and* its `queueMicrotask` deferral |
| A microtask queued from the first cleanup lands after every sibling cleanup | `createFocusRestore`'s deferral |
| `Dynamic` → `ssrElement(…, true)` emits an `_hk` hydration key server-side | `renderElement`; everything it renders hydrates against that key |
| `applyRef` does `r.flat(Infinity).forEach(f => f && f(el))`, skipping falsy entries | `renderElement`'s ref merging; why no `mergeRefs` helper exists |

Still to re-check by hand at the migration, because nothing pins them:

- [ ] Client `dynamic()` does `sharedConfig.hydrating ? getNextElement() : createElement(...)`,
      i.e. `Dynamic` is hydration-aware at runtime. If that stops being true, everything
      `renderElement` renders stops hydrating — see §3.
- [ ] `createUniqueId()` still diverges between `solid-js`'s server and client builds. See §4.

---

## 3. Distribution: ship source under the `"solid"` condition (supersedes the old invariant)

This entry used to record two successive theories about why a *single* pre-compiled
`generate: "dom"` build survives SSR. The first ("`@solidjs/web` exposes the same function
names per environment") was wrong: the server build's `template`/`insert`/`spread`/
`setAttribute` are `notSup` stubs that throw, and `generate: "dom"` hoists a `_$template()`
call to module scope, so a literal `<div>` throws at *import* under SSR. The second promoted
**"no source file may contain a literal host JSX element"** to a load-bearing invariant,
enforced by a `dist`-import grep (`scripts/check-dist-imports.mjs`).

**Both are retired.** The crash was a property of shipping *one pre-compiled dom build*, not
of SSR. The library now ships JSX-preserved **source only** under the `"solid"` export
condition (`dist/<name>/index.jsx`, built by **tsdown** — see `tsdown.config.base.ts`), with
**no** dom-compiled fallback. A `vite-plugin-solid` consumer (SolidStart, create-solid — every
Solid app) compiles the source **per environment** — `generate: "ssr"` server-side,
`generate: "dom"` + hydratable client-side — so literal host elements compile correctly on each
side. The grep, the invariant, and the "route every element through `renderElement`" rule are
all gone. `renderElement` → `<Dynamic>` stays as the `as`/render-prop polymorphism helper. Full
rationale: `docs/plan.md`, "Distribution model".

- [ ] Re-verify against stable that a `vite-plugin-solid` consumer still receives the
      `"solid"` condition and compiles our `.jsx` per environment (server `ssr`, client
      `dom` + hydrate). If the `solid` resolve condition or per-env compilation changes,
      revisit. There is no dom fallback, so this path is load-bearing — a real SolidStart
      example app (once `@solidjs/start` is on 2.0) is the end-to-end check.
- [ ] Consider whether a `"default"` dom-compiled fallback is now worth shipping (for
      non-`vite-plugin-solid` consumers). It was dropped pre-1.0 to avoid re-opening the
      `babel-preset-solid` compiler question; a 2.0-stable toolchain may make it cheap.
- [ ] Re-verify `Dynamic` is still hydration-aware at runtime (below) — `renderElement`
      relies on it to emit and consume `_hk` keys.

---

## 4. The Dialog hydration round-trip test — solved, and what it cost

**This is done.** `dialog.browser.test.tsx` runs a real SSR → hydrate round-trip; nothing is
skipped. Kept here because the *diagnosis* is the reusable part, and because two recorded root
causes were wrong for months and were actively instructing the next person.

Both are disproved. Do not resurrect either:

- ~~"Separate Vite projects, so `@solidjs/web` is a different module instance."~~ Wrong.
  Genuine server HTML produced in one Vitest project hydrates fine in another.
- ~~"The hand-rolled `_$HY.r` is the hydration registry, and it is left empty."~~ Wrong. `r` is
  the **resource/asset** registry (`sharedConfig.load = id => _$HY.r[id]`). The element registry
  `getNextElement()` reads is built by `gatherHydratable()`, which scans the container for
  `[_hk]` attributes. An empty `r` is correct. (`generateHydrationScript()` is `voidFn` in the
  client build anyway, so it could never have been the fix.)

### What was actually going on — three layers

**1. `renderToStringAsync` does not exist in the browser.** The client build defines it as
`throwInBrowser(renderToStringAsync)`, which `console.error`s and **returns `undefined`**. The
test did `container.innerHTML = undefined`, writing the literal string `"undefined"`. No `_hk`
nodes, hence *"Unable to find DOM nodes for hydration key: 1010"*. The test's own
`console.error` spy was swallowing the message that said exactly this.

**2. `createUniqueId()` allocates from a different counter in each build.**

| build | `createUniqueId()` | consumes an id? |
|---|---|---|
| `solid-js` server | `getNextChildId(owner)` | yes |
| `solid-js` client, hydrating | `sharedConfig.getNextContextId()` | yes |
| `solid-js` client, not hydrating | `` `cl-${counter++}` `` | **no** |

The first two bottom out in the same `nextChildIdFor(owner)`, so a real server and a real
hydrating client agree. But `vitest.config.ts` aliased only `@solidjs/web` to its server build
and left `solid-js` on its browser build, so the SSR half took the `cl-…` branch, consumed
nothing, and every key after `Dialog.Root`'s `createUniqueId()` was off by one. That hybrid was
never a design — it was an incomplete alias nobody had reason to notice.

**3. Aliasing both packages is not enough.** `@solidjs/web/dist/server.js` is externalized and
loaded by Node, so *its* `import { createRoot, getOwner } from "solid-js"` bypasses Vite's
alias entirely. Two `solid-js` instances, two module-scope `currentOwner`s, and every
`createUniqueId()` throwing *"cannot be used outside of a reactive context"* — the **same error
an earlier attempt hit and attributed to hand-constructing the component tree**. The fix is
`server: { deps: { inline: ["@solidjs/web", "solid-js"] } }` on the `ssr` project.

### What landed

A third Vitest project, `ssr` — node, no DOM, both packages on their server builds. `unit` kept
its client builds (its reactivity tests need real effects and deferred writes) and **lost the
`@solidjs/web` alias entirely**, because the SSR tests that needed it moved out. Net: one weird
alias removed, three projects that each mean one thing. See `docs/testing.md`.

Both `Button` and `Dialog` now have real round-trips against committed fixtures
(`src/*/__tests__/__fixtures__/*-ssr.html`), asserted byte-for-byte by the `ssr` project and
hydrated by the `browser` project. Corrupt a fixture and both halves go red.

### Still worth re-checking at stable

- [ ] `createUniqueId()` still bottoms out in the same `nextChildIdFor(owner)` in both builds.
      `solid-contract.ssr.test.tsx` pins the server half; the client half is only observable
      through a passing hydration test.
- [ ] `@solidjs/web`'s server build still needs inlining. If Vitest or Vite change how
      node_modules ESM is externalized, the symptom is `createUniqueId cannot be used outside of
      a reactive context` — not a resolution error.

---

## 5. Build toolchain: tsdown (adopted), and the compiler hazard that shapes it

The publishable packages build with **tsdown** (rolldown + oxc), configured in
`tsdown.config.base.ts`. It emits **JSX-preserved source** (`transform.jsx: "preserve"`) — it
runs *no Solid compiler*, so `babel-preset-solid`'s version never enters the published output.
That is the whole reason tsdown is safe here where a *compiling* toolchain would not be:

- `unplugin-solid@1.0.0` (tsdown's usual Solid integration, and what `solid-primitives` uses)
  resolves its compiler via a bare `import solid from "babel-preset-solid"`, with
  `dependencies: { "babel-preset-solid": "^1.9.9" }`. Under pnpm that resolves to its own
  **1.x** copy — and `babel-preset-solid@1.9.12` compiles `<div ref={el}/>` to
  `import { use as _$use } from "@solidjs/web"` (verified), the exact *"does not provide an
  export named 'use'"* failure that made this repo abandon `esbuild-plugin-solid`; it also
  emits `addEventListener`, renamed to `addEvent` in 2.0. `esbuild-plugin-solid@0.5.0` has the
  same `babel-preset-solid@^1.x` dep. So any toolchain that *compiles* our JSX with those
  plugins ships a broken `dist/` under Solid 2.0.
- hope-ui sidesteps this entirely by **not compiling** in the published build — tsdown +
  `jsx: "preserve"` uses no Solid plugin (`unplugin-solid` is not installed). The tests +
  Storybook compile with `vite-plugin-solid@3` (`babel-preset-solid@2.x`), the one 2.0-correct
  compiler.

**Revisit triggers:**

- [ ] If a `"default"` dom-compiled fallback is ever added (§3), it *will* need a real Solid
      compiler. Use `vite-plugin-solid@3`/`babel-preset-solid@2.x` (or an `unplugin-solid`
      release depending on `babel-preset-solid@^2` — check
      `npm view unplugin-solid dependencies` at that time), and add a guard (grep the built
      output for `use`/`addEventListener` from `@solidjs/web`, or import it and assert it loads)
      so a 1.x preset can't ship a broken fallback green. The `check:dist-imports` grep that
      once served this role was removed with the literal-element rule; the source-only build
      doesn't need it.
- [ ] tsdown's dts (rolldown-plugin-dts) trips over `@pandacss/types` → `pkg-types` →
      `typescript@5.9` when bundling declarations; `deps.neverBundle` externalizes that chain
      (§3, `tsdown.config.base.ts`). Re-check whether newer tsdown/rolldown-plugin-dts fixes the
      underlying bug so the workaround can be narrowed.

---

## 6. Fragile-by-graph tooling to re-check

- [ ] `vitest.setup.jest-dom-optout.ts` exists solely because `vite-plugin-solid` injects
      `@testing-library/jest-dom/vitest` as a **bare** setup-file specifier into any
      non-browser Vitest project whenever it can `require.resolve` that optional peer — and
      Vitest then resolves it against the repo root, where pnpm doesn't expose it. Adding
      Storybook (which depends on jest-dom) was enough to break the whole unit project. The
      plugin's only opt-out is a setup-file path matching `/jest-dom/`. If a future
      `vite-plugin-solid` changes that guard, the bare-specifier error returns — loudly,
      which is the point.
- [ ] `storybook-solidjs-vite`'s framework preset auto-adds an **unconfigured**
      `vite-plugin-solid` unless a plugin named `solid` is already present, and its
      `viteFinal` runs *before* ours. `.storybook/main.ts` therefore filters it out and
      substitutes ours. Re-check on every Storybook major: if they change the plugin name or
      the ordering, we'd silently double-compile, or lose `refresh: { disabled: true }` and
      reintroduce the `solid-refresh` prop-forwarding bug.
