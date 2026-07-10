import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type UserConfig } from "vite";
import dts from "vite-plugin-dts";
import solid from "vite-plugin-solid";
import { solidPluginOptions } from "./solid-babel-options";

interface PackageJson {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface CreateViteConfigOptions {
  /**
   * Per-entry-point subpath map (output name -> source file, relative to `packageDir`),
   * for packages that publish one subpath export per unit (e.g. `@solid-zero/components`'
   * `./button`, `./dialog`, ...) instead of a single root export. Each entry builds to
   * `dist/<name>/index.js` (and, via `vite-plugin-dts` mirroring `src`, `dist/<name>/index.d.ts`).
   * Omit for the common single-entry case (`src/index.ts` -> `dist/index.js`).
   */
  entries?: Record<string, string>;
  overrides?: UserConfig;
}

/**
 * Shared Vite library-mode build config for every `@solid-zero/*` package.
 *
 * Replaces the `tsup`/`esbuild-plugin-solid` pipeline used through Phase 0: that
 * pipeline compiles Solid JSX via `babel-preset-solid@1.x` regardless of the
 * `moduleName` override, and 1.x's compiled `ref` output imports a helper called `use`
 * that no longer exists in `@solidjs/web` 2.0 (renamed to `ref`/`applyRef`) — so any
 * file using a JSX `ref` attribute failed to even load. `esbuild-plugin-solid` has no
 * 2.0-compatible release to fix this. `vite-plugin-solid`, the first-party solidjs-org
 * plugin, does: the SolidJS team publish a 2.0-aligned build under the npm `next` tag
 * (`vite-plugin-solid@3.0.0-next.5`, pulling in a matching `babel-preset-solid@2.0.0-beta.x`
 * via its own dependency range). Using Vite for the production build too (instead of
 * only for tests) means build and test share one Solid-2.0-aware compiler pipeline.
 */
export function createViteConfig(
  packageDir: string,
  options: CreateViteConfigOptions = {},
): UserConfig {
  const packageJson = JSON.parse(
    readFileSync(join(packageDir, "package.json"), "utf-8"),
  ) as PackageJson;
  const external = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ];

  const isMultiEntry = options.entries !== undefined;
  const entry = isMultiEntry
    ? Object.fromEntries(
        Object.entries(options.entries as Record<string, string>).map(([name, relPath]) => [
          name,
          join(packageDir, relPath),
        ]),
      )
    : join(packageDir, "src/index.ts");

  return defineConfig({
    plugins: [
      solid(solidPluginOptions()),
      dts({
        entryRoot: join(packageDir, "src"),
        outDir: join(packageDir, "dist"),
        compilerOptions: {
          // `tsconfig.base.json` turns declaration maps on, but `package.json#files` is
          // `["dist"]` — so a published `Dialog.d.ts.map` would point at `../../src/…`,
          // which isn't in the tarball, and every consumer "go to definition" lands on a
          // missing file. Off for the published artifact; nothing in-repo reads them.
          declarationMap: false,
          // The one place `@solid-zero/*` must *not* resolve to source. `tsconfig.base.json`
          // maps those specifiers to `packages/*/src` so the editor and `tsc --noEmit` never
          // read a stale sibling `dist/`. `vite-plugin-dts` honours `paths` when it emits,
          // which produced `import { RenderProp } from '../../packages/primitives/src/index.ts'`
          // inside the published `Dialog.d.ts` — a path that doesn't exist in the tarball.
          // Clearing them here sends the emit back through `package.json#exports`, i.e. the
          // sibling's `dist/index.d.ts`, which turbo's `build.dependsOn: ["^build"]` has
          // already produced.
          paths: {},
        },
        // Test and story files live beside their source under `src/`, and `vite-plugin-dts`
        // mirrors that tree — without these globs it emits `Button.stories.d.ts` &c. into
        // the published `dist/`.
        exclude: [
          "**/*.test.ts",
          "**/*.test.tsx",
          "**/*.ssr.test.ts",
          "**/*.ssr.test.tsx",
          "**/*.browser.test.ts",
          "**/*.browser.test.tsx",
          "**/*.stories.ts",
          "**/*.stories.tsx",
        ],
      }),
    ],
    build: {
      target: "es2022",
      sourcemap: true,
      emptyOutDir: true,
      outDir: join(packageDir, "dist"),
      lib: {
        entry,
        formats: ["es"],
        fileName: isMultiEntry ? (_format, entryName) => `${entryName}/index.js` : () => "index.js",
      },
      rollupOptions: { external },
    },
    ...options.overrides,
  });
}
