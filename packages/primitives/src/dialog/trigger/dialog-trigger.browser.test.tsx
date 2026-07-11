import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createDialog } from "../root/dialog-root";
import { createDialogTrigger } from "./dialog-trigger";

// Headless hook: the harness brings the markup and spreads the returned bundle.
function Harness(props: { onClick?: (event: MouseEvent) => void; withPopup?: boolean }) {
  const state = createDialog();
  const trigger = createDialogTrigger(state, { onClick: props.onClick });
  return (
    <>
      <button data-testid="trigger" {...trigger.props}>
        Open
      </button>
      {/* A real element carrying the popup id, so `aria-controls` resolves to a valid IDREF while
      open. Given an accessible name so it is not itself an axe violation. */}
      {props.withPopup ? (
        <div id={state.popupId()} role="dialog" aria-label="Dialog" data-testid="popup" />
      ) : null}
    </>
  );
}

const triggerOf = (container: Element) =>
  container.querySelector('[data-testid="trigger"]') as HTMLButtonElement;

describe("createDialogTrigger", () => {
  it("opens on click and reflects aria-expanded / aria-haspopup", async () => {
    const { container, dispose } = mount(() => <Harness />);
    const trigger = triggerOf(container);

    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await userEvent.click(page.getByTestId("trigger"));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    dispose();
  });

  it("names the popup with aria-controls only while open", async () => {
    const { container, dispose } = mount(() => <Harness withPopup />);
    const trigger = triggerOf(container);
    const popup = container.querySelector('[data-testid="popup"]') as HTMLElement;

    expect(trigger.getAttribute("aria-controls")).toBeNull();

    await userEvent.click(page.getByTestId("trigger"));
    expect(trigger.getAttribute("aria-controls")).toBe(popup.id);
    dispose();
  });

  it("runs the consumer's onClick first, and preventDefault cancels the open", async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { container, dispose } = mount(() => <Harness onClick={onClick} />);
    const trigger = triggerOf(container);

    await userEvent.click(page.getByTestId("trigger"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    dispose();
  });

  it("has no accessibility violations (closed)", async () => {
    const { container, dispose } = mount(() => <Harness />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
