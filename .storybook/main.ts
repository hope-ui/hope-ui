import { join } from "node:path";
import type { StorybookConfig } from "storybook-solidjs-vite";
import type { PluginOption } from "vite";
import solid from "vite-plugin-solid";
import { solidPluginOptions } from "../solid-babel-options";

// Same alias vitest.config.ts uses, for the same reason: `@solid-zero/components` depends
// on `@solid-zero/primitives` as a real workspace package, which resolves to its *built*
// `dist/`. Without this, editing a primitive has no effect on a story until the package is
// rebuilt, and stories silently exercise the last build.
const primitivesSrcEntry = join(import.meta.dirname, "../packages/primitives/src/index.ts");

const config: StorybookConfig = {
  stories: ["../packages/*/src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "storybook-solidjs-vite", options: {} },
  viteFinal(config) {
    // `storybook-solidjs-vite`'s framework preset adds its own `vite-plugin-solid` with
    // default options, and its `viteFinal` runs before this one — so by the time we get
    // the config, an unconfigured `solid` plugin is already in it. Pushing a second one
    // would double-compile every file, so swap it for ours instead. In particular the
    // default leaves `solid-refresh` enabled, which is the documented cause of `children`
    // silently vanishing for components imported from another module (CLAUDE.md) — i.e.
    // exactly what every story does.
    const plugins = (config.plugins ?? []).filter(
      (plugin) =>
        !(plugin && typeof plugin === "object" && "name" in plugin && plugin.name === "solid"),
    ) as PluginOption[];
    plugins.push(solid(solidPluginOptions()));

    return {
      ...config,
      plugins,
      resolve: {
        ...config.resolve,
        alias: { ...config.resolve?.alias, "@solid-zero/primitives": primitivesSrcEntry },
      },
    };
  },
};

export default config;
