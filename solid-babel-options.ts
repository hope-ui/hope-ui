import type { Options as SolidPluginOptions } from "vite-plugin-solid";

/** Per-project overrides for how `babel-preset-solid` compiles JSX. */
export interface SolidCompileOverrides {
  /**
   * `"dom"` (client DOM templates) or `"ssr"` (server string templates). Components write plain
   * literal host elements (`<span>`, `<svg>`), so each environment must compile them to the code
   * that environment's `@solidjs/web` build understands — exactly what a real consumer's
   * `vite-plugin-solid` does. Default `"dom"`.
   */
  generate?: "dom" | "ssr";
  /**
   * Emit hydration keys (`_hk`). Required on **both** the server render and the hydrating client so
   * `hydrate()` can claim the server's nodes instead of re-creating them. Default `false`.
   */
  hydratable?: boolean;
}

/**
 * The single source of truth for how `vite-plugin-solid` is configured in this repo.
 *
 * Two pipelines compile our JSX with `vite-plugin-solid` — the test runs
 * (`vitest.config.ts`) and Storybook (`.storybook/main.ts`) — and they must agree, because a
 * mismatch shows up as a runtime error deep inside `@solidjs/web` rather than as a config
 * error. Import this rather than spelling the options out again. (The published library build
 * no longer compiles JSX at all: tsdown ships JSX-preserved source under the `"solid"` export
 * condition and the *consumer's* `vite-plugin-solid` compiles it per environment — see
 * `__internal__/plan.md`, "Distribution model".)
 *
 * - `solid.moduleName` — `babel-preset-solid@2.x` already defaults to `"@solidjs/web"`,
 *   so this is redundant *today*. It stays explicit because the 1.x preset defaults to
 *   `"solid-js/web"`, and a silent fallback to that produces compiled output importing
 *   helpers (`use`, `addEventListener`) that `@solidjs/web` 2.0 renamed — a failure that
 *   only surfaces in the consuming bundler, never in this repo's own test run.
 *
 * - `solid.generate` / `solid.hydratable` — driven per Vitest project (see `generate` for why
 *   they must match the environment). The plugin's own `ssr` flag gates the *entire* SSR branch
 *   behind a Vite SSR build, which a node Vitest project isn't; but the plugin merges `options.solid`
 *   over its computed defaults, so setting these directly is how a project opts into SSR-compiled
 *   output. This is what lets components write plain `<span>`/`<svg>` (never `<Dynamic>`) and still
 *   pass the SSR + hydration round-trip: the `ssr` project compiles `generate: "ssr"`, the `browser`
 *   project compiles `hydratable: true` so it can hydrate that output.
 *
 * - `refresh.disabled` — Vite's `solid-refresh` HMR wrapper silently drops props
 *   (notably `children`) for components imported from another module. See CLAUDE.md,
 *   "Vite's `solid-refresh` HMR wrapper breaks prop forwarding". Tests don't need HMR.
 *   Storybook would like it, but its entire execution model is "render a component
 *   imported from another module", i.e. exactly the reproduction case — so it stays off
 *   until a story demonstrates it's safe.
 */
export function solidPluginOptions(
  overrides: SolidCompileOverrides = {},
): Partial<SolidPluginOptions> {
  return {
    solid: { moduleName: "@solidjs/web", ...overrides },
    refresh: { disabled: true },
  };
}
