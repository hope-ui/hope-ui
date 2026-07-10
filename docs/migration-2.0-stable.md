# Migration checklist: SolidJS 2.0 beta → stable

`solid-zero` is built against a pinned `solid-js` / `@solidjs/signals` / `@solidjs/web`
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

- `packages/primitives/src/solid-contract.test.tsx` — unit project, where `@solidjs/web`
  resolves to its **server** build.
- `packages/primitives/src/solid-contract.browser.test.tsx` — browser project, where it
  resolves to the **client** build. The asymmetry between the two files *is* the invariant
  §3 depends on.

What they pin:

| Behavior | Depended on by |
|---|---|
| `merge` resolves a key by **presence**, not value — a present `undefined` clobbers an earlier value | `withDefaults`, and therefore every prop default |
| `createSignal(fn)` hits the `ComputeFunction` overload and becomes a memo | `createControllableState`'s boxed value |
| `useContext` **throws** with no Provider mounted | `createComponentContext`'s `try/catch` reword |
| Sibling effects run in creation order; on **re-run** their cleanups do too; on **owner disposal** cleanups are LIFO | `createFocusRestore`'s creation order *and* its `queueMicrotask` deferral |
| A microtask queued from the first cleanup lands after every sibling cleanup | `createFocusRestore`'s deferral |
| Server build exports `template`/`insert`/`spread`/`setAttribute` as throwing stubs, while `Dynamic` → `ssrElement(…, true)` emits an `_hk` key | The whole no-literal-host-JSX invariant (§3) |
| Client build exports those same four as real implementations | ditto — the asymmetry is the point |
| `applyRef` does `r.flat(Infinity).forEach(f => f && f(el))`, skipping falsy entries | `renderElement`'s ref merging; why no `mergeRefs` helper exists |

Still to re-check by hand at the migration, because nothing pins them:

- [ ] Client `dynamic()` does `sharedConfig.hydrating ? getNextElement() : createElement(...)`,
      i.e. `Dynamic` is hydration-aware at runtime, independent of the Babel `hydratable`
      flag. If that stops being true, the single-build strategy dies — see §3.
- [ ] `createUniqueId()` still diverges between `solid-js`'s server and client builds. See §4.

---

## 3. Correct the record: why the single `generate: "dom"` build works

`docs/plan.md` claims one build suffices because `@solidjs/web` "resolves to different
runtime implementations per environment behind the same exported function names". **That
reasoning is wrong**, verified against the installed `2.0.0-beta.16`: the server build's
`template`/`insert`/`spread`/`setAttribute` are `notSup` stubs that throw.

The real reason SSR works is narrower and undocumented: **no source file under
`packages/*/src` contains a literal host JSX element.** Every host element is created via
`renderElement` → `<Dynamic>` → `createComponent`, and `Dynamic` handles both SSR
(`ssrElement`, emitting `_hk` keys) and hydration (`getNextElement`) at *runtime*. Compiled
`dist/**/*.js` therefore contains zero `_$template` / `_$insert` calls.

The first component that writes a plain `<div>`, `<span>`, or SVG arrow — a Popover arrow,
a visually-hidden label — breaks SSR at runtime.

- [ ] Keep the CI grep asserting no built `dist/**/*.js` imports `template`/`insert`/
      `spread`/`setAttribute`/`use`/`addEventListener` from `@solidjs/web` (Wave 3).
- [ ] Re-verify the invariant against stable: if `Dynamic` stops being hydration-aware at
      runtime, the single-build strategy dies and we need `generate: "ssr"` +
      `hydratable: true` as a second build.

---

## 4. The Dialog hydration round-trip test — root cause, measured

`Dialog.browser.test.tsx`'s hydration test is still `it.skip`'d, but it is no longer a
mystery. Wave 3 reproduced it against `2.0.0-beta.16` and **both previously recorded
explanations are wrong**. Do not act on either:

- ~~"Separate Vite builds, so `@solidjs/web` is a different module instance."~~ Disproved:
  `Button.browser.test.tsx` now hydrates genuine server HTML, produced in the *unit* project,
  inside the *browser* project, reusing the server's DOM node. Separate builds are a non-issue.
- ~~"The hand-rolled `_$HY.r` is the hydration registry, and it is left empty."~~ Disproved:
  `r` is the **resource/asset** registry (`sharedConfig.load = id => _$HY.r[id]`). The element
  registry `getNextElement()` reads is built by `gatherHydratable()`, which scans the
  container for `[_hk]` attributes. An empty `r` is correct. (`generateHydrationScript()` is
  `voidFn` in the client build anyway, so it could not have been used here.)

### What is actually going on

**1. `renderToStringAsync` does not exist in the browser.** The client build defines it as
`throwInBrowser(renderToStringAsync)`, which `console.error`s and **returns `undefined`**. The
test then does `container.innerHTML = undefined`, writing the literal string `"undefined"`. No
`_hk` nodes, hence "Unable to find DOM nodes for hydration key". The test's own `console.error`
spy was swallowing the message that says exactly this.

**2. `createUniqueId()` allocates from a different counter in each build.**

| build | `createUniqueId()` | consumes an id? |
|---|---|---|
| `solid-js` server | `getNextChildId(owner)` | yes |
| `solid-js` client, hydrating | `sharedConfig.getNextContextId()` | yes |
| `solid-js` client, not hydrating | `` `cl-${counter++}` `` | **no** |

`vitest.config.ts` aliases `@solidjs/web` to its server build for the unit project, but leaves
`solid-js` resolving to its **browser** build. So the SSR render takes the `cl-…` branch and
consumes nothing, while the browser hydrate takes `getNextContextId()` and consumes one — every
hydration key after `Dialog.Root`'s `createUniqueId()` is off by one. Isolated to confirm: a
single bare `createUniqueId()` added to a component that otherwise hydrates cleanly is enough to
flip it to "Hydration Mismatch". This affects every future component that generates ARIA ids —
Popover, Tooltip, Select.

### What landed instead

`Button` (no `createUniqueId`) has a **real** SSR → hydrate round-trip:
`src/button/__fixtures__/button-ssr.html` is genuine server output, asserted byte-for-byte by
`Button.test.tsx` and hydrated by `Button.browser.test.tsx`, which checks the server's node is
reused rather than re-rendered. Break the fixture and both halves go red.

### To unblock Dialog

- [ ] Make the SSR half resolve `solid-js`'s **server** build too, not just `@solidjs/web`'s —
      a third Vitest project (or a Node script) whose alias covers both, emitting the fixture the
      browser test hydrates. The unit project cannot simply switch: its reactivity tests depend
      on client-build semantics (deferred writes, real effects).
- [ ] Re-check against stable first. If `solid-js`'s client `createUniqueId` stops branching on
      `sharedConfig.hydrating`, or the two builds converge, this may evaporate.
- [ ] Once green, drop the `it.skip` and delete the "retry when stable" note in CLAUDE.md.

---

## 5. Re-evaluate the build toolchain (tsdown + unplugin-solid)

`solid-primitives`' `next` branch builds with `tsdown` + `unplugin-solid`. solid-zero
deliberately stayed on Vite library mode. The reason, verified rather than assumed:

- `unplugin-solid@1.0.0` resolves its compiler via a bare `import solid from
  "babel-preset-solid"`, with `dependencies: { "babel-preset-solid": "^1.9.9" }` and
  `peerDependencies: { "solid-js": "^1.9.9" }`. Under pnpm that resolves to its own **1.x**
  copy.
- `babel-preset-solid@1.9.12` compiles `<div ref={el}/>` to
  `import { use as _$use } from "@solidjs/web"` — the exact *"does not provide an export
  named 'use'"* failure that made this repo abandon `esbuild-plugin-solid`. It also emits
  `addEventListener`, which `@solidjs/web` 2.0 renamed to `addEvent`.
- solid-primitives carries no `pnpm.overrides` to correct it, and gets away with it because
  their packages are reactive primitives that rarely compile JSX host elements. solid-zero
  ships components.
- Critically, **Vitest compiles through a different plugin** (`vite-plugin-solid`), so
  adopting `unplugin-solid` today would ship a broken `dist/` with the entire pipeline
  green.

**Revisit trigger:** `unplugin-solid` publishes a release depending on
`babel-preset-solid@^2` (or peering `solid-js@^2`).

- [ ] Check `npm view unplugin-solid dependencies peerDependencies` at migration time.
- [ ] If migrating, the Wave 3 dist-grep (§3) is the tripwire that makes it safe. Do not
      migrate without it.

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
