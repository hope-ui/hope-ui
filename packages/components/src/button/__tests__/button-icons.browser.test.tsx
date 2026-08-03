import ssrFixture from "virtual:hydration-fixture?id=button-icons";
import { expectNoA11yViolations, hydrateFixture } from "@hope-ui/internal-test-utils";
import { describe, expect, it } from "vitest";
import { Tree } from "./button-icons.ssr-entry";

// Regression: an icon *component* inside a `<Show>`-gated decorator slot used to land one position
// off from the server's, so hydration looked up a `<span>` where the icon's `<svg>` should have been
// ("Hydration tag mismatch … expected <svg> but found <span>"). The cause was the `<Show>` gate
// reading the raw prop, which builds and discards a component; Button now resolves those props once
// with `children()`. `hydrateFixture` fails on a silent client-render fallback too, which would
// otherwise look perfectly fine on screen.

describe("Button (icon components) hydration", () => {
  it("hydrates component decorators in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

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
