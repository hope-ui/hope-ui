import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createFocusTrap } from "../focus-trap";

function TestHarness() {
  const [active, setActive] = createSignal(false);
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();

  createFocusTrap({ active, ref: containerRef });

  return (
    <div>
      <button type="button" data-testid="toggle" onClick={() => setActive((value) => !value)}>
        Toggle
      </button>
      <button type="button" data-testid="outside-after">
        After
      </button>
      <div data-testid="container" ref={setContainerRef}>
        <button type="button" data-testid="first">
          First
        </button>
        <button type="button" data-testid="second">
          Second
        </button>
        <button type="button" data-testid="last">
          Last
        </button>
      </div>
    </div>
  );
}

describe("createFocusTrap", () => {
  it("moves focus to the first focusable descendant on activation", async () => {
    const { dispose } = mount(() => <TestHarness />);

    await userEvent.click(page.getByTestId("toggle"));
    await expect.element(page.getByTestId("first")).toHaveFocus();
    dispose();
  });

  it("cycles Tab from the last element to the first, and Shift+Tab from the first to the last", async () => {
    const { dispose } = mount(() => <TestHarness />);

    await userEvent.click(page.getByTestId("toggle"));
    await userEvent.click(page.getByTestId("last"));
    await userEvent.keyboard("{Tab}");
    await expect.element(page.getByTestId("first")).toHaveFocus();

    await userEvent.click(page.getByTestId("first"));
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(page.getByTestId("last")).toHaveFocus();

    dispose();
  });

  it("refocuses the container if focus escapes it programmatically", async () => {
    const { dispose } = mount(() => <TestHarness />);

    await userEvent.click(page.getByTestId("toggle"));
    page.getByTestId("outside-after").element().focus();
    await expect.element(page.getByTestId("first")).toHaveFocus();

    dispose();
  });

  it("does not restore focus on deactivation — that is createFocusRestore's job", async () => {
    // The trap used to own focus restore, behind a `returnFocus` option. Splitting them is
    // what lets a non-modal overlay (Popover, Tooltip, `<Dialog modal={false}>`) restore
    // focus without trapping it. See focus-restore.md.
    const { dispose } = mount(() => <TestHarness />);

    await userEvent.click(page.getByTestId("toggle"));
    await expect.element(page.getByTestId("first")).toHaveFocus();

    // Clicking the toggle focuses it, the still-live trap pulls focus back to `first`, and
    // only then does the click handler deactivate. Focus therefore stays inside the
    // container: nothing returns it to the toggle.
    await userEvent.click(page.getByTestId("toggle"));
    await expect.element(page.getByTestId("first")).toHaveFocus();
    await expect.element(page.getByTestId("toggle")).not.toHaveFocus();

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <TestHarness />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
