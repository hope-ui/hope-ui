# SSR fixtures

`box-ssr.html` is the genuine server output of the real `Box` component — see the button
`__fixtures__/README.md` for the shared `ssr` ↔ `browser` round-trip pattern; `Box`'s follows it.

## The literal-host-element proof (`literal-box-ssr.html` + `literal-box.client.mjs`)

These two files back `../literal-ssr-hydration.browser.test.tsx`, the canonical proof of the
"SSR support = works in SolidStart" refactor (see `docs/plan.md`, "Distribution model"): a
hand-written component whose internals use a **literal host element** round-trips server →
hydrate under the ship-source distribution model.

They can't be produced by the test harness the way `box-ssr.html` is, because the harness
compiles a single way (`generate: 'dom'`, non-hydratable, everything through `<Dynamic>` at
runtime). This proof needs the *two per-environment compiles a consumer's `vite-plugin-solid`
performs* on our shipped `"solid"`-condition source, which is exactly the point. So both files
are committed generated artifacts, produced from this source:

```tsx
export function LiteralBox(props) {
  return <div class={props.class} data-testid="ssr-box">{props.children}</div>;
}
```

- **`literal-box.client.mjs`** — that source compiled with `babel-preset-solid@2.x`
  `{ generate: 'dom', hydratable: true, moduleName: '@solidjs/web' }` (the *client* compile).
  Committed as `.mjs` so the harness imports it without recompiling (which would strip the
  hydratable path). It uses `getNextElement(_tmpl$)`, the standard Solid hydration primitive.
- **`literal-box-ssr.html`** — `renderToStringAsync` (server build) of that source compiled
  with `{ generate: 'ssr', hydratable: true }` (the *server* compile), called with
  `{ class: "bg_red\\.500 p_4", children: "Hello SSR" }`. Server-safe `ssr()` helpers, so it
  renders instead of throwing on `@solidjs/web`'s server build — the whole reason the old
  "no literal host JSX element" rule is gone. The `_hk=0` is Solid's hydration key.

To regenerate after changing the source above, compile it both ways with the pinned
`babel-preset-solid` and re-run the server render (see the two per-env compiles in the git
history for this file's introduction). **Never hand-edit either file.**

See `docs/testing.md` and `docs/migration-2.0-stable.md` §3.
