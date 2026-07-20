/**
 * The hydration-fixture bridge (`vitest-hydration-bridge.ts`, wired into the `browser` Vitest
 * project) serves genuine, freshly-rendered server HTML as the default export of
 * `virtual:hydration-fixture?id=<subject>`. A hydration test imports that string and feeds it to
 * `hydrateFixture`, so no `.html` fixture is ever committed — see `__internal__/testing.md`.
 *
 * The type lives here because this package deliberately keeps `vite/client` out of
 * `compilerOptions.types` (it would also drag in `import.meta.env` and the whole asset-module
 * surface, none of which a theming contract package should see).
 */
declare module "virtual:hydration-fixture?id=*" {
  const serverHtml: string;
  export default serverHtml;
}
