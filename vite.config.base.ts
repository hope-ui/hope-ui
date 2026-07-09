import { readFileSync } from "node:fs";
import { join } from "node:path";
import solid from "vite-plugin-solid";
import { defineConfig, type UserConfig } from "vite";
import dts from "vite-plugin-dts";

interface PackageJson {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
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
export function createViteConfig(packageDir: string, overrides: UserConfig = {}): UserConfig {
  const packageJson = JSON.parse(
    readFileSync(join(packageDir, "package.json"), "utf-8"),
  ) as PackageJson;
  const external = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ];

  return defineConfig({
    plugins: [
      solid({ solid: { moduleName: "@solidjs/web" } }),
      dts({
        entryRoot: join(packageDir, "src"),
        outDir: join(packageDir, "dist"),
        exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.browser.test.ts", "**/*.browser.test.tsx"],
      }),
    ],
    build: {
      target: "es2022",
      sourcemap: true,
      emptyOutDir: true,
      outDir: join(packageDir, "dist"),
      lib: {
        entry: join(packageDir, "src/index.ts"),
        formats: ["es"],
        fileName: () => "index.js",
      },
      rollupOptions: { external },
    },
    ...overrides,
  });
}
