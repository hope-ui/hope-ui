import ssrFixture from "virtual:hydration-fixture?id=badge-icons";
import { expectNoA11yViolations, hydrateFixture } from "@hope-ui/internal-test-utils";
import { describe, expect, it } from "vitest";
import { Tree } from "./badge-icons.ssr-entry";

// Regression: a component inside a `<Show>`-gated slot used to land one position off from the
// server's, so hydration looked up the wrong node. The cause was the `<Show>` gate reading the raw
// prop, which builds and discards a component; Badge now resolves those props once with
// `children()`. Badge gates its label as well as its decorators, so all three are at risk here.

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
