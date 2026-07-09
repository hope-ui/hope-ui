import { playwright } from "@vitest/browser-playwright";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // No pure-logic primitives need node-environment tests yet (Phase 0 only has
    // DOM-facing components) — this stops CI failing on "no unit tests" until
    // createListState etc. land in Phase 1.
    passWithNoTests: true,
    projects: [
      {
        // `refresh: { disabled: true }` disables Vite's solid-refresh HMR wrapper for
        // components imported from other modules — tests never need HMR, and leaving
        // it on causes STRICT_READ_UNTRACKED-related prop-read bugs (e.g. `children`
        // silently failing to reach the DOM) specifically for imported components
        // that don't reproduce when the component is defined inline in the test file.
        plugins: [
          solid({ solid: { moduleName: "@solidjs/web" }, refresh: { disabled: true } }),
        ],
        test: {
          name: "unit",
          environment: "node",
          include: ["packages/*/src/**/*.test.{ts,tsx}"],
          exclude: ["**/*.browser.test.*", "**/node_modules/**", "**/dist/**"],
        },
      },
      {
        // `refresh: { disabled: true }` disables Vite's solid-refresh HMR wrapper for
        // components imported from other modules — tests never need HMR, and leaving
        // it on causes STRICT_READ_UNTRACKED-related prop-read bugs (e.g. `children`
        // silently failing to reach the DOM) specifically for imported components
        // that don't reproduce when the component is defined inline in the test file.
        plugins: [
          solid({ solid: { moduleName: "@solidjs/web" }, refresh: { disabled: true } }),
        ],
        test: {
          name: "browser",
          include: ["packages/*/src/**/*.browser.test.{ts,tsx}"],
          exclude: ["**/node_modules/**", "**/dist/**"],
          browser: {
            enabled: true,
            // Headless everywhere (locally and in CI): CI installs only the
            // "chromium-headless-shell" build (`playwright install --with-deps
            // --only-shell`), which Playwright only picks up when headless is on.
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
