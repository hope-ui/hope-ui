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

## 2. Re-verify the `@solidjs/web` internals this codebase silently depends on

`@solidjs/web` renamed runtime helpers *within* the beta line (`use` → `ref`,
`addEventListener` → `addEvent`). Four undocumented runtime behaviors are load-bearing
here. Wave 3 adds characterization tests (`solid-contract.test.ts`) that pin each one, so
stable breaking any of them shows up as a red test with a pointer rather than as a
mysterious component bug. Until those land, re-check by hand:

- [ ] `merge(defaults, props)` — a **present** key whose value is `undefined` overrides the
      default; an **absent** key does not. Dialog's `modal`/`defaultOpen` and Button's
      `type` defaults depend on this distinction.
- [ ] `applyRef` (`@solidjs/web/dist/web.js`) — `r.flat(Infinity).forEach(f => f && f(el))`,
      i.e. falsy entries in a ref array are skipped. This is why `ref={[setRef, props.ref]}`
      is safe with an absent consumer ref and no `mergeRefs` helper is needed.
- [ ] The server build (`dist/server.js`) exports `template`/`insert`/`spread`/
      `setAttribute` as **throwing stubs** ("Client-only API called on the server side"),
      while `Dynamic` → `dynamic()` → `ssrElement(c, props, undefined, true)` emits a
      hydration key. See §3.
- [ ] Client `dynamic()` does `sharedConfig.hydrating ? getNextElement() : createElement(...)`,
      i.e. `Dynamic` is hydration-aware at runtime, independent of the Babel `hydratable`
      flag.
- [ ] `useContext` throws when no Provider is mounted. `createComponentContext`'s
      `try/catch` (`packages/primitives/src/context/context.ts`) exists only to reword that
      throw; if 2.0 stable returns `undefined` instead, the friendly error silently stops
      firing and every sub-component fails later with a null-deref.

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

## 4. Retry the Dialog hydration round-trip test

`Dialog.browser.test.tsx`'s hydration test is `it.skip`'d. **`CLAUDE.md`'s recorded root
cause — "separate Vite builds, so `@solidjs/web` is a different module instance" — is
unverified and contradicted by the evidence.** A real server render of the Dialog trigger
emits `<button _hk=1010 type="button" …>`, and `1010` is exactly the hydration key in the
reported "Unable to find DOM nodes for hydration key: 1010" error. The keys exist and are
structural, not per-module-instance.

A likelier culprit is the hand-rolled bootstrap in the test itself:

```ts
(window as unknown as { _$HY?: unknown })._$HY = { events: [], completed: new WeakSet(), r: {} };
```

`r` is the hydration registry, and it is left **empty**. In a real app that object is
produced by `generateHydrationScript()`.

- [ ] Try `generateHydrationScript()` (from `@solidjs/web`) instead of the hand-rolled
      `_$HY` before touching anything else.
- [ ] Only if that fails, revisit the module-instance theory.
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
