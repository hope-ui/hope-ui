import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createDialogCloseTrigger } from "../dialog-close-trigger";
import { createDialog } from "../dialog-root";

// The hook owns only the close `onClick`, so that is all this covers: closing, and honoring a
// consumer's `preventDefault()` cancel. The accessible name and the `type="button"` default belong
// to the `CloseButton` component and are covered by its own tests.

// A minimal open dialog: a close button (labelled, so it has an accessible name) and a marker gated
// on `open()`, so the test can observe that clicking Close actually closed the dialog.
function Harness(props: { onClick?: (event: MouseEvent) => void }) {
  const state = createDialog({ defaultOpen: true });
  const close = createDialogCloseTrigger(state, { onClick: props.onClick });
  return (
    <>
      <button type="button" data-testid="close" {...close.props}>
        Close
      </button>
      <Show when={state.open()}>
        <span data-testid="open-marker" />
      </Show>
    </>
  );
}

// A close button whose only props are consumer-supplied `aria-label`/`type`, to prove the hook passes
// them through unchanged rather than owning a default of its own.
function PassthroughHarness() {
  const state = createDialog({ defaultOpen: true });
  const close = createDialogCloseTrigger(state, { "aria-label": "Custom label", type: "submit" });
  return <button data-testid="close" {...close.props} />;
}

describe("createDialogCloseTrigger", () => {
  it("closes on click", async () => {
    const { container, dispose } = mount(() => <Harness />);
    expect(container.querySelector('[data-testid="open-marker"]')).toBeTruthy();

    await userEvent.click(page.getByTestId("close"));
    expect(container.querySelector('[data-testid="open-marker"]')).toBeNull();
    dispose();
  });

  it("runs the consumer's onClick first, and preventDefault cancels the close", async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { container, dispose } = mount(() => <Harness onClick={onClick} />);

    await userEvent.click(page.getByTestId("close"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(container.querySelector('[data-testid="open-marker"]')).toBeTruthy();
    dispose();
  });

  it("owns only the close onClick — forwards the consumer's other props unchanged", async () => {
    // The hook sets no `aria-label`/`type` of its own, so a consumer's pass straight through.
    const { container, dispose } = mount(() => <PassthroughHarness />);
    const close = container.querySelector('[data-testid="close"]') as HTMLButtonElement;
    expect(close.getAttribute("aria-label")).toBe("Custom label");
    expect(close.getAttribute("type")).toBe("submit");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("has no accessibility violations", async () => {
    const { container, dispose } = mount(() => <Harness />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
