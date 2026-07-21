import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import {
  type CreateListboxGroupReturn,
  createListboxGroup,
  createListboxGroupLabel,
} from "../index";

/** A minimal group + label inside a listbox, exposing the group handle for id assertions. */
function LabelHarness(props: {
  labelId?: string;
  onReady?: (group: CreateListboxGroupReturn) => void;
}): JSX.Element {
  const group = createListboxGroup();
  const label = createListboxGroupLabel(group, props.labelId ? { id: props.labelId } : {});
  props.onReady?.(group);
  return (
    <div role="listbox" aria-label="fruits by kind">
      <div {...group.props}>
        <div {...label.props} data-testid="label">
          Citrus
        </div>
        <div role="option" aria-selected="false" tabindex="0">
          Lemon
        </div>
      </div>
    </div>
  );
}

function labelEl(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-testid="label"]') as HTMLElement;
}
function groupEl(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="group"]') as HTMLElement;
}

describe("createListboxGroupLabel", () => {
  it("registers its generated id on the group's aria-labelledby", async () => {
    let group!: CreateListboxGroupReturn;
    const { container, dispose } = mount(() => <LabelHarness onReady={(g) => (group = g)} />);

    const generatedId = labelEl(container).id;
    expect(generatedId).toBeTruthy();

    // `createRegisteredId` defers the write to `onSettled`, so the linkage lands after mount.
    await vi.waitFor(() => {
      expect(group.labelId()).toBe(generatedId);
      expect(groupEl(container).getAttribute("aria-labelledby")).toBe(generatedId);
    });
    await expectNoA11yViolations(container);
    dispose();
  });

  it("honors a consumer-supplied id", async () => {
    const { container, dispose } = mount(() => <LabelHarness labelId="citrus-heading" />);

    expect(labelEl(container).id).toBe("citrus-heading");
    await vi.waitFor(() =>
      expect(groupEl(container).getAttribute("aria-labelledby")).toBe("citrus-heading"),
    );
    dispose();
  });
});
