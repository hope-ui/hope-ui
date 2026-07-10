// Intentionally empty. This file exists purely to opt the "unit" project out of
// `vite-plugin-solid`'s automatic `@testing-library/jest-dom` wiring.
//
// The plugin's `config()` hook does, for any non-browser Vitest project:
//
//   const jestDomImport = getJestDomExport(userSetupFiles);
//   if (jestDomImport) test.setupFiles = [jestDomImport];
//
// where `getJestDomExport` bails out only if an existing setup file's path matches
// `/jest-dom/`, and otherwise `require.resolve`s `"@testing-library/jest-dom/vitest"`
// *from the plugin's own location* and injects it as a bare specifier. Vitest then
// resolves that specifier against the repo root, where pnpm's isolated layout does not
// expose it — so the whole unit project fails with
// `Cannot find module '<root>/@testing-library/jest-dom/vitest'`.
//
// `@testing-library/jest-dom` is an *optional* peer of `vite-plugin-solid`. Nothing here
// depends on it directly; it only entered the graph because `storybook` depends on it, at
// which point pnpm satisfied the optional peer and the injection switched itself on. That
// made an unrelated devDependency silently break the unit suite.
//
// The unit project renders to strings under `environment: "node"` and wants no DOM
// matchers; the browser project already gets Vitest's own. Naming this file so it matches
// the plugin's `/jest-dom/` guard is the only opt-out the plugin offers, and it makes the
// behavior independent of whatever else happens to be installed.
export {};
