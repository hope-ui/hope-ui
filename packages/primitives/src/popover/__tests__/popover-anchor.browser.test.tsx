import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createPopoverAnchor } from "../popover-anchor";
import { createPopoverContent } from "../popover-content";
import { createPopoverPositioner } from "../popover-positioner";
import {
  type CreatePopoverOptions,
  type CreatePopoverReturn,
  createPopover,
} from "../popover-root";
import { createPopoverTitle } from "../popover-title";
import { createPopoverTrigger } from "../popover-trigger";

// Geometry is pinned in px and never derived from content: font metrics differ between the local
// Chromium and CI's headless shell, which also runs with a real ~15px scrollbar gutter. So the
// assertions compare rect *relationships* with a 1px tolerance.
const SIDE_OFFSET = 8;
const CONTENT_WIDTH = 120;
const CONTENT_HEIGHT = 60;

/** Top-left, clear of every edge, so neither `flip` nor `shift` has anything to react to. */
const TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "40px",
  left: "40px",
  width: "80px",
  height: "24px",
};

/** Far from the trigger on **both** axes, so "which element is it anchored to" is unambiguous. */
const ANCHOR_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "400px",
  left: "150px",
  width: "80px",
  height: "24px",
};

function PopupTitle(props: { state: CreatePopoverReturn }) {
  const title = createPopoverTitle(props.state, {});
  return <h2 {...title.props}>Popover title</h2>;
}

/** Its own component, so the registration's cleanup is scoped to the anchor's unmount — the half
 * of this hook the handover-back test exists for. */
function HarnessAnchor(props: {
  state: CreatePopoverReturn;
  anchorProps?: JSX.HTMLAttributes<HTMLDivElement>;
}) {
  const anchor = createPopoverAnchor(props.state, props.anchorProps ?? {});
  return <div data-testid="anchor" {...anchor.props} style={ANCHOR_STYLE} ref={anchor.setRef} />;
}

interface HarnessProps {
  options?: CreatePopoverOptions;
  anchorProps?: JSX.HTMLAttributes<HTMLDivElement>;
  withAnchor?: boolean;
  onReady?: (state: CreatePopoverReturn) => void;
}

function Harness(props: HarnessProps) {
  const state = createPopover(props.options);
  props.onReady?.(state);
  const trigger = createPopoverTrigger(state, {});
  const positioner = createPopoverPositioner(state, {});
  const content = createPopoverContent(state, {});

  return (
    <>
      <button data-testid="trigger" style={TRIGGER_STYLE} {...trigger.props} ref={trigger.setRef}>
        open
      </button>
      <Show when={props.withAnchor}>
        <HarnessAnchor state={state} anchorProps={props.anchorProps} />
      </Show>
      <Show when={positioner.mounted()}>
        <div data-testid="positioner" {...positioner.props} ref={positioner.setRef}>
          <div
            data-testid="content"
            {...content.props}
            style={{ width: `${CONTENT_WIDTH}px`, height: `${CONTENT_HEIGHT}px` }}
            ref={content.setRef}
          >
            <PopupTitle state={state} />
          </div>
        </div>
      </Show>
    </>
  );
}

function mountHarness(props: HarnessProps = {}) {
  let state!: CreatePopoverReturn;
  const result = mount(() => <Harness {...props} onReady={(ready) => (state = ready)} />);
  return { ...result, state: () => state };
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
 * The layer sits `SIDE_OFFSET` below the named element and centred on it. Asserting the **rect** is
 * the whole point: `state.anchorElement()` returning a different accessor proves nothing about
 * whether the positioning layer noticed.
 */
function expectAnchoredTo(container: HTMLElement, testId: "trigger" | "anchor"): void {
  const anchor = elementOf(container, testId).getBoundingClientRect();
  const positioner = elementOf(container, "positioner").getBoundingClientRect();
  expectWithinOnePixel(positioner.top - anchor.bottom, SIDE_OFFSET);
  expectWithinOnePixel(centerX(positioner), centerX(anchor));
}

/** `flip`/`shift` off: this file asserts *which anchor* was used, not collision handling. */
const OPEN_OPTIONS: CreatePopoverOptions = {
  defaultOpen: true,
  side: "bottom",
  sideOffset: SIDE_OFFSET,
  flip: false,
  shift: false,
};

/** One frame is enough for a dismissal that was going to happen to have happened. */
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe("createPopoverAnchor", () => {
  it("takes over positioning from the trigger, and hands it back when it unmounts", async () => {
    const [withAnchor, setWithAnchor] = createSignal(false);
    let state!: CreatePopoverReturn;
    const { container, dispose } = mount(() => (
      <Harness
        onReady={(ready) => (state = ready)}
        options={OPEN_OPTIONS}
        withAnchor={withAnchor()}
      />
    ));

    await vi.waitFor(() => expect(state.floating.isPositioned()).toBe(true));
    expectAnchoredTo(container, "trigger");

    flush(() => setWithAnchor(true));
    expect(state.customAnchorElement()).toBe(elementOf(container, "anchor"));
    await vi.waitFor(() => expectAnchoredTo(container, "anchor"));

    // The unregister half, and the reason this hook uses `createRegisteredElement` rather than just
    // registering: without the clear, `anchorElement()` keeps naming a detached element and the open
    // layer strands wherever it last was.
    flush(() => setWithAnchor(false));
    expect(state.customAnchorElement()).toBeUndefined();
    await vi.waitFor(() => expectAnchoredTo(container, "trigger"));

    dispose();
  });

  it("contributes no ARIA, no data-* and no handler of its own", () => {
    const { container, dispose } = mountHarness({ options: OPEN_OPTIONS, withAnchor: true });
    const anchor = elementOf(container, "anchor");

    // A positioning reference, not a control. The only attributes on it are the ones this test put
    // there, so a future `aria-*`/`data-side` sneaking in fails here rather than in a screen reader.
    expect([...anchor.getAttributeNames()].sort()).toEqual(["data-testid", "style"]);
    dispose();
  });

  it("is deliberately NOT dismiss-excluded: clicking it closes the popover", async () => {
    // The dismissal exclusion exists to fix the trigger's toggle race, and nothing else. An Anchor
    // is a bare wrapper a consumer may put around a whole section, so exempting it would turn that
    // region into a dead zone where outside-click silently stops working.
    const { container, state, dispose } = mountHarness({ options: OPEN_OPTIONS, withAnchor: true });
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));

    await userEvent.click(page.getByTestId("anchor"));
    await nextFrame();

    expect(state().open()).toBe(false);
    expect(container.querySelector('[data-testid="content"]')).toBeNull();
    dispose();
  });

  it("forwards the consumer's own attributes onto the element", () => {
    const { container, dispose } = mountHarness({
      options: OPEN_OPTIONS,
      withAnchor: true,
      anchorProps: { id: "custom-anchor", title: "kept", lang: "fr" },
    });
    const anchor = elementOf(container, "anchor");

    expect(anchor.id).toBe("custom-anchor");
    expect(anchor.getAttribute("title")).toBe("kept");
    expect(anchor.getAttribute("lang")).toBe("fr");
    dispose();
  });

  it("has no baseline accessibility violations while anchoring an open popover", async () => {
    const { container, state, dispose } = mountHarness({ options: OPEN_OPTIONS, withAnchor: true });

    // After the first measurement, deliberately: axe would otherwise inspect the pre-positioned
    // `visibility: hidden` intermediate and return an `incomplete` nobody can act on.
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    await expectNoA11yViolations(container, {
      // Not a markup problem: axe cannot decide `aria-valid-attr-value` for ANY element that
      // carries both `aria-haspopup` and `aria-controls` — it never resolves the IDREF, because a
      // popup may be added on demand. The IDREF itself is pinned in
      // `popover-trigger.browser.test.tsx`.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    dispose();
  });
});
