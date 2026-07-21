import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Separator } from "./listbox-harness";

/** A listbox with a separator between two options. */
function SeparatorHarness(): JSX.Element {
  return (
    <div role="listbox" aria-label="fruits">
      <div role="option" aria-selected="false" tabindex="0">
        Apple
      </div>
      <Separator />
      <div role="option" aria-selected="false" tabindex="-1">
        Banana
      </div>
    </div>
  );
}

describe("createListboxSeparator", () => {
  it("emits role=presentation and aria-hidden (not role=separator, an invalid listbox child)", async () => {
    const { container, dispose } = mount(() => <SeparatorHarness />);

    const separator = container.querySelector('[data-testid="separator"]') as HTMLElement;
    expect(separator.getAttribute("role")).toBe("presentation");
    expect(separator.getAttribute("aria-hidden")).toBe("true");
    expect(separator.getAttribute("role")).not.toBe("separator");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("passes consumer props through", async () => {
    const { container, dispose } = mount(() => (
      <div role="listbox" aria-label="fruits">
        <div role="option" aria-selected="false" tabindex="0">
          Apple
        </div>
        <Separator class="my-separator" />
      </div>
    ));

    const separator = container.querySelector('[data-testid="separator"]') as HTMLElement;
    expect(separator.classList.contains("my-separator")).toBe(true);
    expect(separator.getAttribute("role")).toBe("presentation");
    dispose();
  });
});
