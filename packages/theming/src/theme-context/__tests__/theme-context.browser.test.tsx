import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { definePreset } from "../../presets";
import type { RecipeRegistry } from "../../recipes/registry";
import type { SlotRecipeFn } from "../../recipes/slot-recipe";
import { ThemeProvider, useRecipe } from "../theme-context";
import ssrFixture from "./__fixtures__/theme-context-ssr.html?raw";

// Synthetic single-"root"-slot recipe, cast into the registry — see the ssr test for the rationale.
// Proves the same context round-trip on the real client runtime, plus that the zero-DOM provider is
// transparent to hydration (the child hydrates in place, no mismatch).
type DemoVariants = { size?: "sm" | "md" };
const demo: SlotRecipeFn<DemoVariants> = (props) => ({
  root: () => `demo demo--size_${props?.size ?? "md"}`,
});
const theme = { demo } as unknown as RecipeRegistry;

// Identical to the ssr test's preset, so the tree hydrated here matches the fixture byte-for-byte.
const preset = definePreset(theme);

function Probe() {
  const recipe = useRecipe("demo" as keyof RecipeRegistry) as SlotRecipeFn<DemoVariants>;
  return (
    <button type="button" class={recipe({ size: "sm" }).root()}>
      go
    </button>
  );
}

describe("ThemeProvider + useRecipe on the client", () => {
  it("client-reads the injected recipe and applies its class to the DOM, injecting no <style>", async () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={preset}>
        <Probe />
      </ThemeProvider>
    ));

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
    // `ssrFixture` is genuine server output — the ssr test asserts it byte-for-byte against a real
    // `renderToStringAsync`. Here `solid-js`/`@solidjs/web` resolve to their client builds, so
    // `hydrateFixture` hydrates the fixture rather than re-rendering it. The zero-DOM provider
    // contributes no node, so the fixture is exactly the probe `<button>`, and the tree hydrated here
    // must stay structurally identical to the ssr test's. `hydrateFixture` proves hydration was silent
    // and reused the server node in place.
    const { container, dispose } = hydrateFixture(ssrFixture, () => (
      <ThemeProvider preset={preset}>
        <Probe />
      </ThemeProvider>
    ));

    // The zero-DOM provider injects no `<style>` — not something the reuse check covers.
    expect(container.querySelector("style")).toBeNull();

    // Baseline a11y over the hydrated tree.
    await expectNoA11yViolations(container);

    dispose();
  });
});
