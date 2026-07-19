import ssrFixture from "virtual:hydration-fixture?id=button-icons";
import { expectNoA11yViolations, hydrateFixture } from "@hope-ui/internal-test-utils";
import { describe, expect, it } from "vitest";
import { Tree } from "./button-icons.ssr-entry";

// Regression: a Button with an **icon component** in its `<Show>`-gated decorator slots must hydrate
// cleanly. Before the fix, a component read inside a `<Show>`-gated slot span computed a hydration
// key one off from the server's, so `hydrate()` looked up a `<span>` where it expected the icon's
// `<svg>` (`Hydration tag mismatch ... expected <svg> but found <span>`). `hydrateFixture` asserts the
// full contract — silent hydration, no node added/dropped, every server node reused — so a silent
// client-render fallback (which would look fine visually) still fails the test. `ssrFixture` is
// genuine server HTML rendered fresh by the hydration-fixture bridge from the same `Tree`. See
// docs/solid-2.0-notes.md and docs/testing.md.

describe("Button (icon components) hydration", () => {
  it("hydrates component decorators in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // Both decorator slots survived hydration with their icon component intact.
    expect(container.querySelectorAll('[data-slot="button-start-decorator"] svg').length).toBe(1);
    expect(container.querySelectorAll('[data-slot="button-end-decorator"] svg').length).toBe(1);

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
