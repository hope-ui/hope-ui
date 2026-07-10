import type { Options as SolidPluginOptions } from "vite-plugin-solid";

/**
 * The single source of truth for how `vite-plugin-solid` is configured in this repo.
 *
 * Three separate pipelines compile our JSX — the library build (`vite.config.base.ts`),
 * the test runs (`vitest.config.ts`), and Storybook (`.storybook/main.ts`) — and they
 * must agree, because a mismatch shows up as a runtime error deep inside `@solidjs/web`
 * rather than as a config error. Import this rather than spelling the options out again.
 *
 * - `solid.moduleName` — `babel-preset-solid@2.x` already defaults to `"@solidjs/web"`,
 *   so this is redundant *today*. It stays explicit because the 1.x preset defaults to
 *   `"solid-js/web"`, and a silent fallback to that produces compiled output importing
 *   helpers (`use`, `addEventListener`) that `@solidjs/web` 2.0 renamed — a failure that
 *   only surfaces in the consuming bundler, never in this repo's own test run.
 *
 * - `refresh.disabled` — Vite's `solid-refresh` HMR wrapper silently drops props
 *   (notably `children`) for components imported from another module. See CLAUDE.md,
 *   "Vite's `solid-refresh` HMR wrapper breaks prop forwarding". Tests don't need HMR.
 *   Storybook would like it, but its entire execution model is "render a component
 *   imported from another module", i.e. exactly the reproduction case — so it stays off
 *   until a story demonstrates it's safe.
 */
export function solidPluginOptions(): Partial<SolidPluginOptions> {
  return {
    solid: { moduleName: "@solidjs/web" },
    refresh: { disabled: true },
  };
}
