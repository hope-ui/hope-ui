import { solidPlugin } from "esbuild-plugin-solid";
import { defineConfig, type Options } from "tsup";

export function createTsupConfig(overrides: Options = {}) {
  return defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    esbuildPlugins: [solidPlugin({ solid: { moduleName: "@solidjs/web" } })],
    ...overrides,
  });
}
