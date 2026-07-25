import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, flush } from "solid-js";
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

/**
 * A second harness rather than props on the first: the six tests above are the gate proving the
 * new options are inert by default, so the tree they run against stays byte-identical.
 *
 * `trigger` stands in for the control that opened the layer — the case `exclude` exists for. The
 * wrapper around `excluded-child` is what proves exclusion covers a subtree, not just the listed
 * element itself.
 */
function OutsideHarness(props: {
  onDismiss: () => void;
  excludeTrigger?: boolean;
  dismissOnFocusOutside?: boolean;
}) {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement>();
  const [wrapperRef, setWrapperRef] = createSignal<HTMLDivElement>();

  createDismissable({
    active: () => true,
    ref: containerRef,
    onDismiss: props.onDismiss,
    exclude: () => {
      if (!props.excludeTrigger) {
        return [];
      }
      const trigger = triggerRef();
      const wrapper = wrapperRef();
      return trigger && wrapper ? [trigger, wrapper] : [];
    },
    get dismissOnFocusOutside() {
      return props.dismissOnFocusOutside;
    },
  });

  return (
    <div>
      <button type="button" data-testid="trigger" ref={setTriggerRef}>
        Trigger
      </button>
      <div ref={setWrapperRef}>
        <button type="button" data-testid="excluded-child">
          Excluded child
        </button>
      </div>
      <button type="button" data-testid="outside">
        Outside
      </button>
      <div data-testid="container" ref={setContainerRef}>
        <button type="button" data-testid="inside">
          Inside
        </button>
        <button type="button" data-testid="inside-removable">
          Inside, removable
        </button>
      </div>
    </div>
  );
}

describe("createDismissable — exclude", () => {
  it("does not call onDismiss on a pointerdown on an excluded element", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <OutsideHarness onDismiss={onDismiss} excludeTrigger />);

    await userEvent.click(page.getByTestId("trigger"));
    expect(onDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("does not call onDismiss on a pointerdown inside an excluded element's subtree", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <OutsideHarness onDismiss={onDismiss} excludeTrigger />);

    await userEvent.click(page.getByTestId("excluded-child"));
    expect(onDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("still calls onDismiss on a pointerdown outside every excluded element", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <OutsideHarness onDismiss={onDismiss} excludeTrigger />);

    await userEvent.click(page.getByTestId("outside"));
    expect(onDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("dismisses on an element dropped from the array — read live, not sampled once", async () => {
    const onDismiss = vi.fn();
    const [excludeTrigger, setExcludeTrigger] = createSignal(true);
    const { dispose } = mount(() => (
      <OutsideHarness onDismiss={onDismiss} excludeTrigger={excludeTrigger()} />
    ));

    await userEvent.click(page.getByTestId("trigger"));
    expect(onDismiss).not.toHaveBeenCalled();

    flush(() => setExcludeTrigger(false));

    await userEvent.click(page.getByTestId("trigger"));
    expect(onDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("dismisses on any outside pointerdown when exclude is absent", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <OutsideHarness onDismiss={onDismiss} />);

    await userEvent.click(page.getByTestId("trigger"));
    expect(onDismiss).toHaveBeenCalledOnce();
    dispose();
  });
});

describe("createDismissable — dismissOnFocusOutside", () => {
  it("does not call onDismiss when focus moves outside, by default", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <OutsideHarness onDismiss={onDismiss} />);

    (page.getByTestId("inside").element() as HTMLElement).focus();
    (page.getByTestId("outside").element() as HTMLElement).focus();

    expect(document.activeElement).toBe(page.getByTestId("outside").element());
    expect(onDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("calls onDismiss when focus moves outside and the option is on", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <OutsideHarness onDismiss={onDismiss} dismissOnFocusOutside />);

    (page.getByTestId("inside").element() as HTMLElement).focus();
    expect(onDismiss).not.toHaveBeenCalled();

    (page.getByTestId("outside").element() as HTMLElement).focus();
    expect(onDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("does not call onDismiss when focus moves onto an excluded element", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => (
      <OutsideHarness onDismiss={onDismiss} dismissOnFocusOutside excludeTrigger />
    ));

    (page.getByTestId("inside").element() as HTMLElement).focus();
    (page.getByTestId("trigger").element() as HTMLElement).focus();
    expect(onDismiss).not.toHaveBeenCalled();

    (page.getByTestId("excluded-child").element() as HTMLElement).focus();
    expect(onDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("does not call onDismiss when focus falls to <body>", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <OutsideHarness onDismiss={onDismiss} dismissOnFocusOutside />);

    const removable = page.getByTestId("inside-removable").element() as HTMLElement;
    removable.focus();
    expect(document.activeElement).toBe(removable);

    // Removing the focused element drops focus to `<body>`, which is *outside* the container. It
    // must not dismiss, and `focusin` is what makes that true: measured against this repo's
    // Chromium, this path fires `focusout` only, so the event never arrives at all rather than
    // arriving and being filtered. The implementation this pins against is `focusout` +
    // `relatedTarget` — `relatedTarget` is `null` here, and reading that as "focus went outside"
    // dismisses a layer nobody left.
    removable.remove();
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    expect(document.activeElement).toBe(document.body);
    expect(onDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("does not call onDismiss when focus moves within the container", async () => {
    const onDismiss = vi.fn();
    const { dispose } = mount(() => <OutsideHarness onDismiss={onDismiss} dismissOnFocusOutside />);

    (page.getByTestId("inside").element() as HTMLElement).focus();
    (page.getByTestId("inside-removable").element() as HTMLElement).focus();
    expect(onDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => (
      <OutsideHarness onDismiss={() => {}} dismissOnFocusOutside excludeTrigger />
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});
