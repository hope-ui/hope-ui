/**
 * Vite serves `import x from "./file.html?raw"` as the file's contents, but the type lives in
 * `vite/client`, which this package deliberately doesn't pull into `compilerOptions.types`
 * (it would also drag in `import.meta.env` and the whole asset-module surface, none of which
 * a component library should see).
 *
 * Used by `Button.test.tsx` / `Button.browser.test.tsx` to share one SSR fixture across the
 * unit and browser projects — see `src/button/__fixtures__/README.md`.
 */
declare module "*.html?raw" {
  const content: string;
  export default content;
}
