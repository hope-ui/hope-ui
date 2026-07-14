# SSR fixtures

`flex-ssr.html` is the genuine server output of the real `Flex` component — see the button
`__fixtures__/README.md` for the shared `ssr` ↔ `browser` round-trip pattern; `Flex`'s follows it.

It is produced by a real `renderToStringAsync` via `toMatchFileSnapshot` in
`../flex.ssr.test.tsx`, so the `_hk` hydration key and the deterministic Panda class string are
exactly what `hydrate()` matches on in `../flex.browser.test.tsx`. The tree rendered in the SSR
test and the tree hydrated in the browser test must stay **structurally identical** — `_hk` is a
path through the component tree, so any change on one side must be mirrored on the other.

Regenerate deliberately with `pnpm exec vitest run --project=ssr packages/components/src/flex/__tests__/flex.ssr.test.tsx -u`,
review the diff, and commit. **Never hand-edit it.**

See `docs/testing.md`.
