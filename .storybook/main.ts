import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "storybook-solidjs-vite";
import type { PluginOption } from "vite";
import solid from "vite-plugin-solid";
import { solidPluginOptions } from "../solid-babel-options";

// Same alias vitest.config.ts uses, for the same reason: `@hope-ui/components` depends
// on `@hope-ui/primitives` as a real workspace package, which resolves to its *built*
// `dist/`. Without this, editing a primitive has no effect on a story until the package is
// rebuilt, and stories silently exercise the last build.
const primitivesSrcDir = join(import.meta.dirname, "../packages/primitives/src");
const themingSrcDir = join(import.meta.dirname, "../packages/theming/src");
const presetsSrcDir = join(import.meta.dirname, "../packages/presets/src");
const componentsSrcDir = join(import.meta.dirname, "../packages/components/src");

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
    // Tailwind v4 compiles `.storybook/tailwind.css` (the dev stylesheet), replacing the old
    // Panda `cssgen` step. `@tailwindcss/vite`'s `@source` scans the components' source + stories.
    plugins.push(tailwindcss());

    // Same wildcard the `vitest.config.ts` alias uses: `@hope-ui/primitives` publishes one
    // subpath per primitive folder, so `@hope-ui/primitives/render` -> `.../src/render/index.ts`.
    // A regex alias needs the array form, so normalize whatever Storybook handed us (object or
    // array) and prepend ours (first match wins in `@rollup/plugin-alias`).
    const existingAlias = config.resolve?.alias;
    const aliasArray = Array.isArray(existingAlias)
      ? existingAlias
      : Object.entries(existingAlias ?? {}).map(([find, replacement]) => ({ find, replacement }));

    return {
      ...config,
      plugins,
      resolve: {
        ...config.resolve,
        alias: [
          {
            find: /^@hope-ui\/components\/(.+)$/,
            replacement: join(componentsSrcDir, "$1/index.ts"),
          },
          {
            find: /^@hope-ui\/primitives\/(.+)$/,
            replacement: join(primitivesSrcDir, "$1/index.ts"),
          },
          // `@hope-ui/theming` has a root barrel: two exact-anchored aliases, not a wildcard.
          {
            find: /^@hope-ui\/theming\/conformance$/,
            replacement: join(themingSrcDir, "conformance.ts"),
          },
          {
            find: /^@hope-ui\/theming$/,
            replacement: join(themingSrcDir, "index.ts"),
          },
          // The hope preset's runtime recipe map — the JS half passed to `<ThemeProvider>`.
          {
            find: /^@hope-ui\/presets\/hope$/,
            replacement: join(presetsSrcDir, "hope/index.ts"),
          },
          ...aliasArray,
        ],
      },
    };
  },
};

export default config;
