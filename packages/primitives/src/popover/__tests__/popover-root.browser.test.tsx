import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createRegisteredElement } from "../../internal";
import {
  type CreatePopoverOptions,
  type CreatePopoverReturn,
  createPopover,
} from "../popover-root";

// A *browser* test, like all eight of Dialog's: the root hook owns `createPresence` (effects + rAF)
// and `createFloating` (`getComputedStyle`, `computePosition`, `autoUpdate`), none of which exist in
// the node environment. Behavior belongs in the kernel, so the test environment follows the design.
//
// Geometry is pinned in px and never derived from content — font metrics differ between the local
// Chromium and CI's headless shell. Assertions are rect *relationships* with a 1px tolerance, the
// convention `create-floating.browser.test.tsx` states.
const SIDE_OFFSET = 8;
const CONTENT_WIDTH = 120;
const CONTENT_HEIGHT = 60;
const TITLE_ID = "popover-title";

/** Top-left, clear of every edge, so neither `flip` nor `shift` has anything to react to. */
const TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "40px",
  left: "40px",
  width: "80px",
  height: "24px",
};

/** Far from the trigger on **both** axes, so "which element is it anchored to" is unambiguous. */
const CUSTOM_ANCHOR_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "400px",
  left: "150px",
  width: "80px",
  height: "24px",
};

/**
 * The shape `createPopoverAnchor` will take in Phase 6: a descendant publishing its element into the
 * root's signal, and — the half this test is here for — *clearing* it on unmount.
 * `createRegisteredElement` defers the write past Solid 2.0's `[REACTIVE_WRITE_IN_OWNED_SCOPE]` ban.
 */
function HarnessAnchor(props: { state: CreatePopoverReturn }) {
  const [element, setElement] = createSignal<HTMLElement>();

  createRegisteredElement<HTMLElement>({
    ref: element,
    register: (registered) => props.state.setCustomAnchorElement(registered),
    unregister: () => props.state.setCustomAnchorElement(undefined),
  });

  return <div data-testid="anchor" style={CUSTOM_ANCHOR_STYLE} ref={setElement} />;
}

interface HarnessProps {
  onReady: (state: CreatePopoverReturn) => void;
  options?: CreatePopoverOptions;
  /** Mounts a `Popover.Anchor` stand-in, which must take over from the trigger. */
  withCustomAnchor?: boolean;
}

/**
 * Stands in for the part hooks Phase 5/6 will add: it renders the elements the root's signals expect
 * and wires their refs, so the anchor chain can be asserted against real rects rather than accessor
 * identity. The positioner is gated on the shared presence, as `Popover.Positioner` will be.
 */
function PopoverHarness(props: HarnessProps) {
  const popover = createPopover(props.options);
  props.onReady(popover);

  // Spread rather than written attribute-by-attribute, which is both what `createPopoverContent` will
  // hand back and what keeps the linter from judging `aria-labelledby` against a `role` it can only
  // see as a dynamic expression.
  const contentProps = {
    get role() {
      return popover.role();
    },
    "aria-labelledby": TITLE_ID,
  };

  return (
    <>
      <button
        type="button"
        data-testid="trigger"
        style={TRIGGER_STYLE}
        ref={popover.setTriggerElement}
      >
        open
      </button>
      <Show when={props.withCustomAnchor}>
        <HarnessAnchor state={popover} />
      </Show>
      <Show when={popover.contentPresence.mounted()}>
        <div
          data-testid="positioner"
          ref={popover.setPositionerElement}
          data-side={popover.floating.side()}
          data-align={popover.floating.align()}
          style={popover.floating.floatingStyles()}
        >
          <div
            data-testid="content"
            {...contentProps}
            style={{ width: `${CONTENT_WIDTH}px`, height: `${CONTENT_HEIGHT}px` }}
            ref={popover.setContentElement}
          >
            <h2 id={TITLE_ID}>Popover title</h2>
          </div>
        </div>
      </Show>
    </>
  );
}

/** Headless: no elements, for the state assertions that need none. `mount()` supplies the owner. */
function mountPopover(options?: CreatePopoverOptions) {
  let popover!: CreatePopoverReturn;
  const { container, dispose } = mount(() => {
    popover = createPopover(options);
    return null;
  });
  return { popover: () => popover, container, dispose };
}

function mountHarness(props: Omit<HarnessProps, "onReady"> & { withCustomAnchor?: boolean }) {
  let popover!: CreatePopoverReturn;
  const { container, dispose } = mount(() => (
    <PopoverHarness onReady={(ready) => (popover = ready)} {...props} />
  ));
  return { popover: () => popover, container, dispose };
}

function elementOf(container: HTMLElement, testId: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (element === null) {
    throw new Error(`no element with data-testid="${testId}"`);
  }
  return element;
}

const centerX = (rect: DOMRect) => rect.left + rect.width / 2;

/** Sub-pixel layout and device-pixel rounding both land inside 1px; anything larger is a real move. */
function expectWithinOnePixel(actual: number, expected: number): void {
  expect(
    Math.abs(actual - expected),
    `expected ${actual} to be within 1px of ${expected}`,
  ).toBeLessThanOrEqual(1);
}

/**
 * The layer sits `SIDE_OFFSET` below the named element and centred on it. Asserting the *rect* is the
 * point: `anchorElement()` returning a different element proves nothing about whether the positioning
 * layer noticed.
 */
function expectAnchoredTo(container: HTMLElement, testId: "trigger" | "anchor"): void {
  const anchor = elementOf(container, testId).getBoundingClientRect();
  const positioner = elementOf(container, "positioner").getBoundingClientRect();
  expectWithinOnePixel(positioner.top - anchor.bottom, SIDE_OFFSET);
  expectWithinOnePixel(centerX(positioner), centerX(anchor));
}

/** `flip`/`shift` off: this file asserts *which anchor* was used, not collision handling. */
const ANCHORED_OPTIONS: CreatePopoverOptions = {
  defaultOpen: true,
  side: "bottom",
  sideOffset: SIDE_OFFSET,
  flip: false,
  shift: false,
};

describe("createPopover", () => {
  it("defaults to closed, role=dialog, with all three dismissal toggles on", () => {
    const { popover, dispose } = mountPopover();

    expect(popover().open()).toBe(false);
    expect(popover().role()).toBe("dialog");
    expect(popover().closeOnEscape()).toBe(true);
    expect(popover().closeOnInteractOutside()).toBe(true);
    // Popover's default, and deliberately *not* the kernel's: `createDismissable`'s
    // `dismissOnFocusOutside` defaults `false` so Dialog is untouched. A non-modal layer is the case
    // the option exists for, so the flip happens here.
    expect(popover().closeOnFocusOutside()).toBe(true);
    dispose();
  });

  it("honors role=alertdialog", () => {
    const { popover, dispose } = mountPopover({ role: "alertdialog" });
    expect(popover().role()).toBe("alertdialog");
    dispose();
  });

  it("opens uncontrolled and fires onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { popover, dispose } = mountPopover({ onOpenChange });

    flush(() => popover().setOpen(true));

    expect(popover().open()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    dispose();
  });

  it("honors a controlled `open`: setOpen fires onChange but does not fork internal state", () => {
    const [open, setOpen] = createSignal(false);
    const onOpenChange = vi.fn((next: boolean) => setOpen(next));
    const { popover, dispose } = mountPopover({
      get open() {
        return open();
      },
      onOpenChange,
    });

    expect(popover().open()).toBe(false);
    flush(() => popover().setOpen(true));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(popover().open()).toBe(true);
    dispose();
  });

  it("falls back to a generated popupId until one is registered", () => {
    const { popover, dispose } = mountPopover();
    const generated = popover().popupId();
    expect(generated).toBeTruthy();

    flush(() => popover().setPopupId("custom-id"));
    expect(popover().popupId()).toBe("custom-id");

    flush(() => popover().setPopupId(undefined));
    expect(popover().popupId()).toBe(generated);
    dispose();
  });

  it("exposes title/description id registration", () => {
    const { popover, dispose } = mountPopover();
    expect(popover().titleId()).toBeUndefined();
    expect(popover().descriptionId()).toBeUndefined();

    flush(() => popover().setTitleId("the-title"));
    flush(() => popover().setDescriptionId("the-description"));

    expect(popover().titleId()).toBe("the-title");
    expect(popover().descriptionId()).toBe("the-description");
    dispose();
  });

  it("exposes a shared content presence: exited + unmounted while closed", () => {
    const { popover, dispose } = mountPopover();
    // Created eagerly while closed, so its first run observes `open === false` — the property that
    // lets `Popover.Content` animate in (a lazily-created presence would latch to `entered`).
    expect(popover().contentPresence.mounted()).toBe(false);
    expect(popover().contentPresence.status()).toBe("exited");
    expect(popover().contentElement()).toBeUndefined();
    dispose();
  });

  it("excludes the trigger from dismissal, and nothing before it registers", () => {
    const headless = mountPopover();
    expect(headless.popover().dismissExclusions()).toEqual([]);
    headless.dispose();

    const { popover, container, dispose } = mountHarness({});
    // The single exclusion a Popover needs: without it a pointerdown on the trigger dismisses in the
    // capture phase and the trigger's own `click` reopens, so the layer could never be closed by
    // clicking the control that opened it.
    expect(popover().dismissExclusions()).toEqual([elementOf(container, "trigger")]);
    dispose();
  });

  it("anchors to the trigger, hands over to a custom anchor mounted later, and back on its unmount", async () => {
    const [withCustomAnchor, setWithCustomAnchor] = createSignal(false);
    let popover!: CreatePopoverReturn;
    const { container, dispose } = mount(() => (
      <PopoverHarness
        onReady={(ready) => (popover = ready)}
        options={ANCHORED_OPTIONS}
        withCustomAnchor={withCustomAnchor()}
      />
    ));

    await vi.waitFor(() => expect(popover.floating.isPositioned()).toBe(true));
    expect(popover.anchorElement()).toBe(elementOf(container, "trigger"));
    expectAnchoredTo(container, "trigger");

    // A `Popover.Anchor` mounting *after* the trigger. The chain is a derived accessor over two
    // signals, so `createFloating`'s attach effect re-runs and `autoUpdate` re-points at it.
    flush(() => setWithCustomAnchor(true));
    expect(popover.anchorElement()).toBe(elementOf(container, "anchor"));
    await vi.waitFor(() => expectAnchoredTo(container, "anchor"));

    // ...and unmounting while the layer is open must hand positioning back rather than strand it on
    // a detached element.
    flush(() => setWithCustomAnchor(false));
    expect(popover.customAnchorElement()).toBeUndefined();
    expect(popover.anchorElement()).toBe(elementOf(container, "trigger"));
    await vi.waitFor(() => expectAnchoredTo(container, "trigger"));

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { popover, container, dispose } = mountHarness({ options: ANCHORED_OPTIONS });

    // After the first measurement, deliberately: axe would otherwise inspect the pre-positioned
    // `visibility: hidden` intermediate and return an `incomplete` nobody can act on. The popup
    // carries a title, because `role="dialog"` with no accessible name is an `aria-dialog-name`
    // violation.
    await vi.waitFor(() => expect(popover().floating.isPositioned()).toBe(true));
    await expectNoA11yViolations(container);

    dispose();
  });
});
