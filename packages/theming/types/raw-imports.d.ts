/**
 * Vite serves `import x from "./file.html?raw"` as the file's contents, but the type lives in
 * `vite/client`, which this package deliberately doesn't pull into `compilerOptions.types`
 * (it would also drag in `import.meta.env` and the whole asset-module surface, none of which a
 * theming contract package should see).
 *
 * Used by `theme-context.browser.test.tsx` to hydrate the token `<style>` fixture that
 * `theme-context.ssr.test.tsx` generates — see `src/theme-context/__tests__/__fixtures__/`.
 */
declare module "*.html?raw" {
  const content: string;
  export default content;
}
