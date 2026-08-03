import ssrFixture from "virtual:hydration-fixture?id=theme-context";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Tree } from "./theme-context.ssr-entry";

// The client half of the round-trip: same `Tree` the ssr test renders, run here on the real client
// runtime. The fixture bridge server-renders it fresh for this project (no committed `.html`), so the
// hydration input and the client tree cannot diverge. What these prove beyond the ssr half: the
// provider is transparent to hydration — it contributes no node, so the child hydrates in place.

describe("ThemeProvider + useRecipe on the client", () => {
  it("client-reads the injected recipe and applies its class to the DOM, injecting no <style>", async () => {
    const { container, dispose } = mount(() => <Tree />);

    const button = page.getByRole("button", { name: "go" });
    await expect.element(button).toBeInTheDocument();
    expect(container.querySelector("button")?.className).toContain("demo--size_sm");
    // No preset ever makes the provider inject a `<style>`.
    expect(container.querySelector("style")).toBeNull();

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("ThemeProvider zero-DOM hydration", () => {
  it("hydrates the server HTML in place, reusing the server node without a mismatch", async () => {
    // `ssrFixture` is genuine server output for this same `<Tree />`. Here solid-js and @solidjs/web
    // resolve to their client builds, so `hydrateFixture` hydrates that HTML instead of re-rendering
    // it, and asserts hydration was silent and reused the server nodes in place.
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // Not covered by the node-reuse check above: a `<style>` the provider might have added.
    expect(container.querySelector("style")).toBeNull();

    await expectNoA11yViolations(container);

    dispose();
  });
});
