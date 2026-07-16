import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { hydrate } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
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
  /** See `Button.browser.test.tsx` for why `_$HY` must be seeded by hand in a client-build test. */
  function bootstrapHydration(): () => void {
    const globals = globalThis as { _$HY?: unknown };
    globals._$HY = { events: [], completed: new WeakSet(), r: {} };
    return () => {
      globals._$HY = undefined;
    };
  }

  function mountServerHtml(html: string): { container: HTMLElement; remove: () => void } {
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    return { container, remove: () => container.remove() };
  }

  it("hydrates the server HTML in place, reusing the server node without a mismatch", async () => {
    // `ssrFixture` is genuine server output — the ssr test asserts it byte-for-byte against a real
    // `renderToStringAsync`. Here `solid-js`/`@solidjs/web` resolve to their client builds, so we
    // hydrate the fixture rather than re-render it. The zero-DOM provider contributes no node, so the
    // fixture is exactly the probe `<button>`; hydration must reuse it, not re-render a second one.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const teardownHydration = bootstrapHydration();
    const { container, remove } = mountServerHtml(ssrFixture);

    const serverButton = container.querySelector("button");
    const dispose = hydrate(
      () => (
        <ThemeProvider preset={preset}>
          <Probe />
        </ThemeProvider>
      ),
      container,
    );

    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();

    // One `<button>`, and it is the *same node* the server sent — a silent client-render fallback
    // would leave two, or one that isn't the server's. The provider injects no `<style>`.
    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(container.querySelector("button")).toBe(serverButton);
    expect(container.querySelector("style")).toBeNull();

    // Baseline a11y over the hydrated tree — doubles as the byte-stability proof (constraint #1):
    // an unclean hydration would have logged above.
    await expectNoA11yViolations(container);

    dispose();
    remove();
    teardownHydration();
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });
});
