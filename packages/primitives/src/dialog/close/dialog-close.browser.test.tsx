import { expectNoA11yViolations, mount } from "@enara-ui/internal-test-utils";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createDialog } from "../root/dialog-root";
import { createDialogClose } from "./dialog-close";

// A minimal open dialog: a close button, and a marker gated on `open()` so the test can observe
// that clicking Close actually closed the dialog.
function Harness(props: { onClick?: (event: MouseEvent) => void }) {
  const state = createDialog({ defaultOpen: true });
  const close = createDialogClose(state, { onClick: props.onClick });
  return (
    <>
      <button data-testid="close" {...close.props}>
        Close
      </button>
      <Show when={state.open()}>
        <span data-testid="open-marker" />
      </Show>
    </>
  );
}

describe("createDialogClose", () => {
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

  it("defaults to type=button and has no accessibility violations", async () => {
    const { container, dispose } = mount(() => <Harness />);
    const close = container.querySelector('[data-testid="close"]') as HTMLButtonElement;
    expect(close.getAttribute("type")).toBe("button");
    await expectNoA11yViolations(container);
    dispose();
  });
});
