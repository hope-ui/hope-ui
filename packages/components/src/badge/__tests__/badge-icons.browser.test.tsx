import ssrFixture from "virtual:hydration-fixture?id=badge-icons";
import { expectNoA11yViolations, hydrateFixture } from "@hope-ui/internal-test-utils";
import { describe, expect, it } from "vitest";
import { Tree } from "./badge-icons.ssr-entry";

// Regression: a Badge with an **icon component** in its `<Show>`-gated decorator slots — and a
// **component** in its `<Show>`-gated label — must hydrate cleanly. Before the fix, a component read
// inside a `<Show>`-gated slot span computed a hydration key one off from the server's, so
// `hydrate()` looked up the wrong node. `hydrateFixture` asserts the full contract — silent
// hydration, no node added/dropped, every server node reused. `ssrFixture` is genuine server HTML
// rendered fresh by the hydration-fixture bridge from the same `Tree`. See __internal__/solid-2.0-notes.md.

describe("Badge (icon components) hydration", () => {
  it("hydrates component decorators and label in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    expect(container.querySelectorAll('[data-slot="badge-start-decorator"] svg').length).toBe(1);
    expect(container.querySelectorAll('[data-slot="badge-end-decorator"] svg').length).toBe(1);
    expect(container.querySelector('[data-slot="badge-label"]')?.textContent).toBe("Live");

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
