import hopePreset from "@hope-ui/preset";
import { defineConfig } from "@pandacss/dev";

/**
 * Panda config for hope-ui's own styled-system. This produces the pure runtime
 * (`css`/`tokens`/`patterns` + `isCssProperty`) that `@hope-ui/components` imports and
 * bundles, plus the types. It is NOT a consumer-facing artifact — consumers add
 * `@hope-ui/preset` to their own panda.config and run codegen themselves.
 *
 * `include` only feeds our OWN dev stylesheet (`pnpm --filter @hope-ui/styled-system
 * cssgen`, used by Storybook/tests). hope-ui ships zero CSS.
 */
export default defineConfig({
  preflight: false,
  include: ["../components/src/**/*.{ts,tsx}"],
  exclude: [],
  jsxFramework: "solid",
  outdir: "styled-system",
  // Unhashed class names so the runtime css() output our components bundle matches
  // the class names a consumer's own codegen produces from the same preset.
  hash: false,
  // Minimal setup: `eject` drops Panda's default presets so preset-panda never merges in.
  // hopePreset supplies preset-base (the utility engine) + every hope token itself.
  eject: true,
  presets: [hopePreset],
});
