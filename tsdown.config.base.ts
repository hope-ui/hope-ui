import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type UserConfig } from "tsdown";

interface PackageJson {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  /** The per-subpath entry map, e.g. `{ box: "src/box/index.ts", ... }`. */
  hope?: { entries?: Record<string, string> };
}

/**
 * Shared tsdown build config for every publishable `@hope-ui/*` package.
 *
 * hope-ui ships **JSX-preserved source** only (the `"solid"` export condition): the consumer's
 * own `vite-plugin-solid` compiles each element per environment (server `ssr`, client `dom` +
 * hydrate), which is what "SSR support = works in SolidStart" requires. There is deliberately
 * **no** dom-compiled fallback — every SolidJS app (SolidStart, `npm init solid`) is Vite +
 * `vite-plugin-solid`, so the `"solid"` condition always resolves. A non-`vite-plugin-solid`
 * consumer gets no match and fails loudly; that's acceptable until a Solid-2.0-stable toolchain
 * makes a compiled fallback worth shipping. See `docs/plan.md`, "Distribution model".
 *
 * tsdown (rolldown + oxc) is used with `transform.jsx: "preserve"`: oxc's parser keeps JSX
 * intact while rolldown leaves `solid-js`/`@solidjs/web`/`@hope-ui/primitives` external — the
 * consumer resolves those, and
 * `@hope-ui/primitives` via *its own* `"solid"` condition. No Solid compiler runs here at all,
 * so the `babel-preset-solid@1.x` hazard (`esbuild-plugin-solid`/`unplugin-solid`, see
 * `docs/migration-2.0-stable.md` §5) simply doesn't apply to a preserve-only build.
 *
 * Entries come from `package.json`'s `hope.entries`; one `dist/<name>/index.jsx` (source) plus
 * `dist/<name>/index.d.ts` (types) per subpath.
 */
export function createTsdownConfig(packageDir: string): UserConfig {
  const pkg = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as PackageJson;

  const entries = pkg.hope?.entries;
  if (entries === undefined) {
    throw new Error(`createTsdownConfig: ${packageDir}/package.json has no hope.entries`);
  }

  // One tsdown entry per subpath: `box` (src/box/index.ts) → the output key `box/index`, which
  // under `outDir: dist` + the `.jsx` extension lands at `dist/box/index.jsx`, with its bundled
  // `dist/box/index.d.ts` beside it. A `.` entry name is the package root (e.g. `@hope-ui/theming`,
  // a single cohesive contract package rather than a bag of unrelated components) → output key
  // `index` → `dist/index.jsx`.
  const entry = Object.fromEntries(
    Object.entries(entries).map(([name, relPath]) => [
      name === "." ? "index" : `${name}/index`,
      relPath,
    ]),
  );

  return defineConfig({
    entry,
    format: "esm",
    platform: "browser",
    outDir: join(packageDir, "dist"),
    // Keep `solid-js`/`@solidjs/web` and **every `@hope-ui/*` sibling** external so the consumer
    // resolves them (each `@hope-ui/*` via *its own* `"solid"` condition). This matters wherever a
    // published package imports another: `@hope-ui/components` → `@hope-ui/theming`, and
    // `@hope-ui/themes/hope/recipes` → `@hope-ui/theming` (for `tv`/`slotRecipe`). Applies to the
    // **dts** build too, so the emitted declarations reference those siblings by bare specifier,
    // never a src path.
    deps: {
      neverBundle: [/^solid-js/, /^@solidjs\//, /^@hope-ui\//],
    },
    // Ship source: keep JSX for the consumer's per-environment compile.
    inputOptions(options) {
      options.transform = { ...options.transform, jsx: "preserve" };
      return options;
    },
    // No `.jsx.map`: a source map of shipped source would point at the unshipped `.tsx`.
    // (Declaration maps are disabled via `declarationMap: false` in each package's tsconfig,
    // for the same tarball reason — `files: ["dist"]` wouldn't contain the mapped sources.)
    outputOptions(options) {
      options.sourcemap = false;
      return options;
    },
    outExtensions: () => ({ js: ".jsx" }),
    dts: true,
    sourcemap: false,
    // Bundle each subpath into one `.jsx`, with common code deduped into shared `.jsx` chunks the
    // entries import relatively — the consumer's compiler handles those the same as the entries.
    unbundle: false,
  }) as UserConfig;
}
