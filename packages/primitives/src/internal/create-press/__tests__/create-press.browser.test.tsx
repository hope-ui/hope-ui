import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { type CreatePressOptions, createPress } from "../create-press";

/** A native `<button>` wired to `createPress`, surfacing `isPressed` as `data-pressed`. */
function NativePress(props: { options?: CreatePressOptions }) {
  const { pressProps, isPressed } = createPress<HTMLButtonElement>(props.options ?? {});
  return (
    <button
      type="button"
      data-testid="target"
      data-pressed={isPressed() ? "" : undefined}
      {...pressProps}
    >
      Press me
    </button>
  );
}

/** A generic `role="button"` element (non-native), which needs synthesized keyboard clicks. */
function GenericPress(props: { options?: CreatePressOptions }) {
  const { pressProps, isPressed } = createPress<HTMLDivElement>(props.options ?? {});
  return (
    <div
      role="button"
      tabindex="0"
      data-testid="target"
      data-pressed={isPressed() ? "" : undefined}
      {...pressProps}
    >
      Press me
    </div>
  );
}

function dispatchPointer(el: Element, type: string, x: number, y: number, pointerId = 1): void {
  el.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      pointerId,
      pointerType: "mouse",
      clientX: x,
      clientY: y,
    }),
  );
}

function centerOf(el: Element): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

describe("createPress — activation", () => {
  it("fires onPress once on a real click, reporting the mouse pointer type", async () => {
    const onPress = vi.fn();
    const { dispose } = mount(() => <NativePress options={{ onPress }} />);

    await userEvent.click(page.getByTestId("target"));

    expect(onPress).toHaveBeenCalledOnce();
    expect(onPress.mock.calls[0]?.[0]).toMatchObject({ type: "press", pointerType: "mouse" });
    dispose();
  });

  it("fires onPress on Enter and on Space for a native button (browser-driven click)", async () => {
    const onPress = vi.fn();
    const { dispose } = mount(() => (
      <NativePress options={{ nativeButton: () => true, onPress }} />
    ));

    page.getByTestId("target").element().focus();
    await userEvent.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(" ");
    expect(onPress).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("synthesizes a click on Enter and Space for a non-native element", async () => {
    const onPress = vi.fn();
    const { dispose } = mount(() => (
      <GenericPress options={{ nativeButton: () => false, onPress }} />
    ));

    page.getByTestId("target").element().focus();
    await userEvent.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(" ");
    expect(onPress).toHaveBeenCalledTimes(2);
    dispose();
  });
});

describe("createPress — press lifecycle & pressed state", () => {
  it("toggles isPressed and fires start/up/end on a pointer down/up over the target", async () => {
    const onPressStart = vi.fn();
    const onPressUp = vi.fn();
    const onPressEnd = vi.fn();
    const { dispose } = mount(() => (
      <NativePress options={{ onPressStart, onPressUp, onPressEnd }} />
    ));

    const target = page.getByTestId("target");
    const el = target.element();
    const { x, y } = centerOf(el);

    dispatchPointer(el, "pointerdown", x, y);
    await expect.element(target).toHaveAttribute("data-pressed", "");
    expect(onPressStart).toHaveBeenCalledOnce();

    document.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        button: 0,
        pointerId: 1,
        clientX: x,
        clientY: y,
      }),
    );
    await expect.element(target).not.toHaveAttribute("data-pressed");
    expect(onPressUp).toHaveBeenCalledOnce();
    expect(onPressEnd).toHaveBeenCalledOnce();
    dispose();
  });

  it("cancels on drag-out (clears pressed, fires onPressEnd, no onPress) and re-arms on re-entry", async () => {
    const onPress = vi.fn();
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const { dispose } = mount(() => (
      <NativePress options={{ onPress, onPressStart, onPressEnd }} />
    ));

    const target = page.getByTestId("target");
    const el = target.element();
    const { x, y } = centerOf(el);

    dispatchPointer(el, "pointerdown", x, y);
    await expect.element(target).toHaveAttribute("data-pressed", "");

    // Drag far outside the target.
    document.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        pointerId: 1,
        clientX: -500,
        clientY: -500,
      }),
    );
    await expect.element(target).not.toHaveAttribute("data-pressed");
    expect(onPressEnd).toHaveBeenCalledOnce();

    // Re-enter — the press re-arms.
    document.dispatchEvent(
      new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: x, clientY: y }),
    );
    await expect.element(target).toHaveAttribute("data-pressed", "");
    expect(onPressStart).toHaveBeenCalledTimes(2);

    // Release outside — no click is generated by the browser, so no activation.
    document.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        pointerId: 1,
        clientX: -500,
        clientY: -500,
      }),
    );
    document.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        button: 0,
        pointerId: 1,
        clientX: -500,
        clientY: -500,
      }),
    );
    expect(onPress).not.toHaveBeenCalled();
    dispose();
  });

  it("focuses a non-native element on press start (browsers don't focus a div on click)", async () => {
    const { dispose } = mount(() => <GenericPress />);

    const target = page.getByTestId("target");
    await userEvent.click(target);
    await expect.element(target).toHaveFocus();
    dispose();
  });
});

describe("createPress — disabled", () => {
  function disabledOption(): Accessor<boolean> {
    const [disabled] = createSignal(true);
    return disabled;
  }

  it("does not fire onPress or set pressed while disabled", async () => {
    const onPress = vi.fn();
    const onPressStart = vi.fn();
    const { dispose } = mount(() => (
      <NativePress options={{ disabled: disabledOption(), onPress, onPressStart }} />
    ));

    const target = page.getByTestId("target");
    await userEvent.click(target);
    expect(onPress).not.toHaveBeenCalled();

    const { x, y } = centerOf(target.element());
    dispatchPointer(target.element(), "pointerdown", x, y);
    await expect.element(target).not.toHaveAttribute("data-pressed");
    expect(onPressStart).not.toHaveBeenCalled();
    dispose();
  });

  it("blocks keyboard activation while disabled", async () => {
    const onPress = vi.fn();
    const { dispose } = mount(() => (
      <GenericPress options={{ nativeButton: () => false, disabled: disabledOption(), onPress }} />
    ));

    page.getByTestId("target").element().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onPress).not.toHaveBeenCalled();
    dispose();
  });
});

describe("createPress — accessibility", () => {
  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <NativePress />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
