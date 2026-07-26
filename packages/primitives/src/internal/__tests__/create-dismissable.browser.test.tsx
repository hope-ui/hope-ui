import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createDismissable, type DismissBubbles } from "../create-dismissable";

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

/**
 * A third harness, for the same reason the second one exists: the trees above are the gate proving
 * the layer stack changed nothing for a lone layer, so they stay byte-identical.
 *
 * Two layers, **siblings** rather than parent/child. That is the shape the stack exists for: a
 * `Popover` portaled out of the `Dialog` it was opened in, whose card is not inside the dialog's
 * container and so cannot be reached by `container.contains` at all. Nesting them in the DOM would
 * make every assertion below pass for the wrong reason.
 *
 * Both containers are mounted unconditionally and only `active` is flipped, so a test can choose the
 * activation order independently of the mount order — which is the ordering the stack claims to use.
 * `createDismissable` for the inner layer is injectable so the cross-copy test can hand it a second
 * module instance of this primitive.
 */
function NestedLayers(props: {
  onOuterDismiss: () => void;
  onInnerDismiss: () => void;
  outerActive?: boolean;
  innerActive?: boolean;
  outerDismissOnEscape?: boolean;
  innerDismissOnEscape?: boolean;
  outerDismissOnFocusOutside?: boolean;
  createInner?: typeof createDismissable;
}) {
  const [outerRef, setOuterRef] = createSignal<HTMLDivElement>();
  const [innerRef, setInnerRef] = createSignal<HTMLDivElement>();
  const createInnerLayer = props.createInner ?? createDismissable;

  createDismissable({
    active: () => props.outerActive !== false,
    ref: outerRef,
    onDismiss: props.onOuterDismiss,
    get dismissOnEscape() {
      return props.outerDismissOnEscape;
    },
    get dismissOnFocusOutside() {
      return props.outerDismissOnFocusOutside;
    },
  });

  createInnerLayer({
    active: () => props.innerActive === true,
    ref: innerRef,
    onDismiss: props.onInnerDismiss,
    get dismissOnEscape() {
      return props.innerDismissOnEscape;
    },
  });

  return (
    <div>
      <button type="button" data-testid="outside">
        Outside
      </button>
      <div data-testid="outer" ref={setOuterRef}>
        <button type="button" data-testid="inside-outer">
          Inside outer
        </button>
      </div>
      <div data-testid="inner" ref={setInnerRef}>
        <button type="button" data-testid="inside-inner">
          Inside inner
        </button>
      </div>
    </div>
  );
}

/**
 * Every negative below (`not.toHaveBeenCalled`) is paired with a positive in the **same dispatch** —
 * the other layer's spy. Both handlers are `document` listeners on one event, so once the positive is
 * observed the negative is already decided; there is no async mechanism left to outrun.
 */
describe("createDismissable — nested layers", () => {
  it("dismisses only the topmost layer on Escape", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <NestedLayers onOuterDismiss={onOuterDismiss} onInnerDismiss={onInnerDismiss} innerActive />
    ));

    await userEvent.keyboard("{Escape}");

    expect(onInnerDismiss).toHaveBeenCalledOnce();
    expect(onOuterDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("dismisses only the topmost layer on an outside pointerdown", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <NestedLayers onOuterDismiss={onOuterDismiss} onInnerDismiss={onInnerDismiss} innerActive />
    ));

    await userEvent.click(page.getByTestId("outside"));

    expect(onInnerDismiss).toHaveBeenCalledOnce();
    expect(onOuterDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("does not treat a pointerdown inside the layer above as outside", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <NestedLayers onOuterDismiss={onOuterDismiss} onInnerDismiss={onInnerDismiss} innerActive />
    ));

    // The clause `exclude` cannot express: the inner container is neither inside the outer one nor
    // named by it, and it only exists once the layer above opens. This is the click that used to
    // close the dialog underneath a popover.
    await userEvent.click(page.getByTestId("inside-inner"));
    expect(onOuterDismiss).not.toHaveBeenCalled();
    expect(onInnerDismiss).not.toHaveBeenCalled();

    // The control: the same listeners, on a target that really is outside both.
    await userEvent.click(page.getByTestId("outside"));
    expect(onInnerDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("does not treat focus landing in the layer above as focus leaving", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <NestedLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        innerActive
        outerDismissOnFocusOutside
      />
    ));

    // One clause, both channels — focus-out reads the same `isOutside`, which is why it needs no
    // topmost gate of its own.
    (page.getByTestId("inside-outer").element() as HTMLElement).focus();
    (page.getByTestId("inside-inner").element() as HTMLElement).focus();
    expect(onOuterDismiss).not.toHaveBeenCalled();

    // The control: focus leaving the whole chain still closes the outer layer.
    (page.getByTestId("outside").element() as HTMLElement).focus();
    expect(onOuterDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("hands the top of the stack back when the layer above deactivates", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const [innerActive, setInnerActive] = createSignal(true);
    const { dispose } = mount(() => (
      <NestedLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        innerActive={innerActive()}
      />
    ));

    await userEvent.keyboard("{Escape}");
    expect(onInnerDismiss).toHaveBeenCalledOnce();
    expect(onOuterDismiss).not.toHaveBeenCalled();

    flush(() => setInnerActive(false));

    await userEvent.keyboard("{Escape}");
    expect(onOuterDismiss).toHaveBeenCalledOnce();
    expect(onInnerDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("orders layers by activation, not by creation", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const [outerActive, setOuterActive] = createSignal(false);
    const { dispose } = mount(() => (
      <NestedLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        outerActive={outerActive()}
        innerActive
      />
    ));

    // The "outer" layer is created first and activated last, so it is the one on top. A stack
    // ordered by creation — or by mount — would answer the other way round.
    flush(() => setOuterActive(true));

    await userEvent.keyboard("{Escape}");
    expect(onOuterDismiss).toHaveBeenCalledOnce();
    expect(onInnerDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("lets a topmost layer that opted out of Escape consume it anyway", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <NestedLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        innerActive
        innerDismissOnEscape={false}
      />
    ));

    // Opting out of a dismissal channel does not drop the layer out of the ordering: it still holds
    // the top of the stack, so Escape reaches nothing at all rather than falling through to the
    // layer underneath.
    await userEvent.keyboard("{Escape}");
    expect(onInnerDismiss).not.toHaveBeenCalled();
    expect(onOuterDismiss).not.toHaveBeenCalled();

    // The control: the same layer still holds the top for the channel it did not opt out of.
    await userEvent.click(page.getByTestId("outside"));
    expect(onInnerDismiss).toHaveBeenCalledOnce();
    expect(onOuterDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("keeps a non-topmost layer that opted out of Escape in the ordering", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const [innerActive, setInnerActive] = createSignal(true);
    const { dispose } = mount(() => (
      <NestedLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        innerActive={innerActive()}
        outerDismissOnEscape={false}
      />
    ));

    await userEvent.keyboard("{Escape}");
    expect(onInnerDismiss).toHaveBeenCalledOnce();

    flush(() => setInnerActive(false));

    // Now topmost, and still opted out — but still in the stack, which the pointerdown proves.
    await userEvent.keyboard("{Escape}");
    expect(onOuterDismiss).not.toHaveBeenCalled();
    await userEvent.click(page.getByTestId("outside"));
    expect(onOuterDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("shares its layer stack with a separate module instance of itself", async () => {
    // The reason the stack lives on `document` rather than at module scope, and the same argument
    // `create-hide-outside.browser.test.tsx` and `create-scroll-lock.browser.test.tsx` make for
    // theirs: nothing guarantees a consumer has one installed copy of `@hope-ui/primitives`. With
    // two module-scope stacks, a `Popover` from copy B would never be topmost over a `Dialog` from
    // copy A, and one Escape would close both.
    const copy: typeof import("../create-dismissable") = await import(
      // @ts-expect-error — Vite serves `?instance=2` as a distinct module instance, which is
      // the whole point here; TypeScript only sees an unresolvable specifier.
      "../create-dismissable?instance=2"
    );
    expect(copy.createDismissable).not.toBe(createDismissable);

    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <NestedLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        innerActive
        createInner={copy.createDismissable}
      />
    ));

    await userEvent.keyboard("{Escape}");
    expect(onInnerDismiss).toHaveBeenCalledOnce();
    expect(onOuterDismiss).not.toHaveBeenCalled();

    await userEvent.click(page.getByTestId("inside-inner"));
    expect(onOuterDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => (
      <NestedLayers onOuterDismiss={() => {}} onInnerDismiss={() => {}} innerActive />
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});

/**
 * A fourth harness: two layers that are both always active, with `bubbles` on the **lower** one.
 * Separate from `NestedLayers` because the option is the opposite question — not "who is topmost"
 * but "what does a layer that is *not* topmost still react to" — and because every test here needs
 * both layers up for the whole test, with no activation flag to reason about.
 */
function BubblingLayers(props: {
  onOuterDismiss: () => void;
  onInnerDismiss: () => void;
  outerBubbles?: DismissBubbles;
}) {
  const [outerRef, setOuterRef] = createSignal<HTMLDivElement>();
  const [innerRef, setInnerRef] = createSignal<HTMLDivElement>();

  createDismissable({
    active: () => true,
    ref: outerRef,
    onDismiss: props.onOuterDismiss,
    get bubbles() {
      return props.outerBubbles;
    },
  });

  createDismissable({
    active: () => true,
    ref: innerRef,
    onDismiss: props.onInnerDismiss,
  });

  return (
    <div>
      <button type="button" data-testid="outside">
        Outside
      </button>
      <div data-testid="outer" ref={setOuterRef}>
        <button type="button" data-testid="inside-outer">
          Inside outer
        </button>
      </div>
      <div data-testid="inner" ref={setInnerRef}>
        <button type="button" data-testid="inside-inner">
          Inside inner
        </button>
      </div>
    </div>
  );
}

describe("createDismissable — bubbles", () => {
  it("does not reach the layer underneath when absent", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <BubblingLayers onOuterDismiss={onOuterDismiss} onInnerDismiss={onInnerDismiss} />
    ));

    // The control for every case below: both channels default to topmost-only. Base UI defaults
    // `outsidePress` to `true` instead; this is the assertion that says hope-ui does not.
    await userEvent.keyboard("{Escape}");
    await userEvent.click(page.getByTestId("outside"));

    expect(onInnerDismiss).toHaveBeenCalledTimes(2);
    expect(onOuterDismiss).not.toHaveBeenCalled();
    dispose();
  });

  it("reaches the layer underneath on both channels when true", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <BubblingLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        outerBubbles
      />
    ));

    await userEvent.keyboard("{Escape}");
    expect(onOuterDismiss).toHaveBeenCalledOnce();

    await userEvent.click(page.getByTestId("outside"));
    expect(onOuterDismiss).toHaveBeenCalledTimes(2);
    expect(onInnerDismiss).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("reaches it on Escape only, with { escapeKey: true }", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <BubblingLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        outerBubbles={{ escapeKey: true }}
      />
    ));

    await userEvent.keyboard("{Escape}");
    expect(onOuterDismiss).toHaveBeenCalledOnce();

    await userEvent.click(page.getByTestId("outside"));
    expect(onInnerDismiss).toHaveBeenCalledTimes(2);
    expect(onOuterDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("reaches it on an outside pointerdown only, with { outsidePress: true }", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <BubblingLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        outerBubbles={{ outsidePress: true }}
      />
    ));

    await userEvent.keyboard("{Escape}");
    expect(onOuterDismiss).not.toHaveBeenCalled();

    await userEvent.click(page.getByTestId("outside"));
    expect(onOuterDismiss).toHaveBeenCalledOnce();
    expect(onInnerDismiss).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("still does not count a press inside the layer above as outside", async () => {
    const onOuterDismiss = vi.fn();
    const onInnerDismiss = vi.fn();
    const { dispose } = mount(() => (
      <BubblingLayers
        onOuterDismiss={onOuterDismiss}
        onInnerDismiss={onInnerDismiss}
        outerBubbles
      />
    ));

    // `bubbles` opts out of the topmost *gate*, not out of what "outside" means — otherwise turning
    // it on would make every click inside the popover close the dialog behind it.
    await userEvent.click(page.getByTestId("inside-inner"));
    expect(onOuterDismiss).not.toHaveBeenCalled();
    expect(onInnerDismiss).not.toHaveBeenCalled();

    await userEvent.click(page.getByTestId("outside"));
    expect(onOuterDismiss).toHaveBeenCalledOnce();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => (
      <BubblingLayers onOuterDismiss={() => {}} onInnerDismiss={() => {}} outerBubbles />
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});
