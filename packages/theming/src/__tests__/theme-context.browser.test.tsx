import ssrFixture from "virtual:hydration-fixture?id=theme-context";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Tree } from "./theme-context.ssr-entry";

// `Tree` (from `theme-context.ssr-entry.tsx`) is the single source of truth: a `<ThemeProvider>`
// wrapping a `Probe` that reads a synthetic recipe. `theme-context.ssr.test.tsx` inline-snapshots its
// server render, and the hydration-fixture bridge renders it fresh into this project (no committed
// `.html`), so the hydration input and the client tree cannot diverge. These tests prove the same
// context round-trip on the real client runtime, plus that the zero-DOM provider is transparent to
// hydration (the child hydrates in place, no mismatch).

describe("ThemeProvider + useRecipe on the client", () => {
  it("client-reads the injected recipe and applies its class to the DOM, injecting no <style>", async () => {
    const { container, dispose } = mount(() => <Tree />);

    const button = page.getByRole("button", { name: "go" });
    await expect.element(button).toBeInTheDocument();
    expect(container.querySelector("button")?.className).toContain("demo--size_sm");
    // Zero-DOM provider: no `<style>` is injected for any preset.
    expect(container.querySelector("style")).toBeNull();

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("ThemeProvider zero-DOM hydration", () => {
  it("hydrates the server HTML in place, reusing the server node without a mismatch", async () => {
    // `ssrFixture` is genuine server output — the ssr test inline-snapshots the same `<Tree />` render
    // the bridge produces here. On the client `solid-js`/`@solidjs/web` resolve to their client builds,
    // so `hydrateFixture` hydrates that HTML rather than re-rendering it. The zero-DOM provider
    // contributes no node, so the fixture is exactly the probe `<button>`. `hydrateFixture` proves
    // hydration was silent and reused the server node in place.
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // The zero-DOM provider injects no `<style>` — not something the reuse check covers.
    expect(container.querySelector("style")).toBeNull();

    // Baseline a11y over the hydrated tree.
    await expectNoA11yViolations(container);

    dispose();
  });
});
