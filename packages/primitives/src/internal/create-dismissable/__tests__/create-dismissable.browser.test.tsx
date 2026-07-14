import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createDismissable } from "../create-dismissable";

function TestHarness(props: {
  onDismiss: () => void;
  dismissOnEscape?: boolean;
  dismissOnOutsidePointerDown?: boolean;
}) {
  const [active] = createSignal(true);
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();

  createDismissable({
    active,
    ref: containerRef,
    onDismiss: props.onDismiss,
    dismissOnEscape: props.dismissOnEscape,
    dismissOnOutsidePointerDown: props.dismissOnOutsidePointerDown,
  });

  return (
    <div>
      <button type="button" data-testid="outside">
        Outside
      </button>
      <div data-testid="container" ref={setContainerRef}>
        <button type="button" data-testid="inside">
          Inside
        </button>
      </div>
    </div>
  );
}

describe("createDismissable", () => {
  it("calls onDismiss when Escape is pressed", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <TestHarness onDismiss={onDismiss} />);

    // Focus something inside the mounted frame first so the keyboard event is
    // actually routed there, instead of wherever focus happened to be before.
    await userEvent.click(page.getByTestId("inside"));
    await userEvent.keyboard("{Escape}");
    expect(onDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("does not call onDismiss on Escape when dismissOnEscape is false", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <TestHarness onDismiss={onDismiss} dismissOnEscape={false} />);

    await userEvent.click(page.getByTestId("inside"));
    await userEvent.keyboard("{Escape}");
    expect(onDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("calls onDismiss when a pointerdown occurs outside the container", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <TestHarness onDismiss={onDismiss} />);

    await userEvent.click(page.getByTestId("outside"));
    expect(onDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("does not call onDismiss when a pointerdown occurs inside the container", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <TestHarness onDismiss={onDismiss} />);

    await userEvent.click(page.getByTestId("inside"));
    expect(onDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("does not call onDismiss on outside pointerdown when dismissOnOutsidePointerDown is false", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => (
      <TestHarness onDismiss={onDismiss} dismissOnOutsidePointerDown={false} />
    ));

    await userEvent.click(page.getByTestId("outside"));
    expect(onDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <TestHarness onDismiss={() => {}} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
