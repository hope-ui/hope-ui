import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createFocusTrap } from "./focus-trap";

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

  it("restores focus to the previously focused element on deactivation", async () => {
    const { dispose } = mount(() => <TestHarness />);

    await userEvent.click(page.getByTestId("toggle"));
    await expect.element(page.getByTestId("first")).toHaveFocus();

    await userEvent.click(page.getByTestId("toggle"));
    await expect.element(page.getByTestId("toggle")).toHaveFocus();

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <TestHarness />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
