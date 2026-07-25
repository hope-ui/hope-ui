import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createPopoverArrow } from "../popover-arrow";
import { createPopoverContent } from "../popover-content";
import { createPopoverPositioner } from "../popover-positioner";
import {
  type CreatePopoverOptions,
  type CreatePopoverReturn,
  createPopover,
} from "../popover-root";
import { createPopoverTitle } from "../popover-title";
import { createPopoverTrigger } from "../popover-trigger";

// Geometry is pinned in px and never derived from content — font metrics differ between the local
// Chromium and CI's headless shell, which also runs with a real ~15px scrollbar gutter. Assertions
// are rect *relationships* with a 1px tolerance, the convention `create-floating.browser.test.tsx`
// states.
const ARROW_SIZE = 8;
const CONTENT_HEIGHT = 60;

/**
 * The arrow's size reaches the element the way it will in production — through the `arrow` slot, here
 * stood in for by a consumer `style` object, which also exercises the kernel-first/consumer-last
 * merge. `--hope-popover-arrow-size` is what the pin offset reads; setting it here proves the custom
 * property is a real seam and not decoration.
 */
const ARROW_PROPS: JSX.HTMLAttributes<HTMLDivElement> = {
  style: {
    width: `${ARROW_SIZE}px`,
    height: `${ARROW_SIZE}px`,
    background: "black",
    "--hope-popover-arrow-size": `${ARROW_SIZE}px`,
  },
};

function PopupTitle(props: { state: CreatePopoverReturn }) {
  const title = createPopoverTitle(props.state, {});
  return <h2 {...title.props}>Popover title</h2>;
}

interface HarnessProps {
  options?: CreatePopoverOptions;
  arrowProps?: JSX.HTMLAttributes<HTMLDivElement>;
  triggerStyle: JSX.CSSProperties;
  contentWidth: number;
  onReady?: (state: CreatePopoverReturn) => void;
}

function Harness(props: HarnessProps) {
  const state = createPopover(props.options);
  props.onReady?.(state);
  const trigger = createPopoverTrigger(state, {});
  const positioner = createPopoverPositioner(state, {});
  const content = createPopoverContent(state, {});
  const arrow = createPopoverArrow(state, props.arrowProps ?? ARROW_PROPS);

  return (
    <>
      <button
        data-testid="trigger"
        style={props.triggerStyle}
        {...trigger.props}
        ref={trigger.setRef}
      >
        open
      </button>
      <Show when={positioner.mounted()}>
        <div data-testid="positioner" {...positioner.props} ref={positioner.setRef}>
          <div
            data-testid="content"
            {...content.props}
            // `relative`'s stand-in: the arrow is absolutely positioned inside the content at the
            // component layer, so the content has to be its offset parent here too (risk A2).
            style={{
              position: "relative",
              width: `${props.contentWidth}px`,
              height: `${CONTENT_HEIGHT}px`,
            }}
            ref={content.setRef}
          >
            <PopupTitle state={state} />
            {/* Rendered UNCONDITIONALLY, never gated on `state.floating.arrow()` — see the
            deadlock test below. */}
            <div data-testid="arrow" {...arrow.props} ref={arrow.setRef} />
          </div>
        </div>
      </Show>
    </>
  );
}

function mountHarness(props: HarnessProps) {
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

/** Clear of every edge, so neither `flip` nor `shift` has anything to react to. */
const CENTRED_TRIGGER: JSX.CSSProperties = {
  position: "fixed",
  top: "200px",
  left: "300px",
  width: "80px",
  height: "24px",
};

/**
 * Jammed against the viewport's inline start and much narrower than the popup, so `shift` slides the
 * layer back into view and the anchor's centre ends up outside the span the arrow may occupy —
 * `arrowPadding` then clamps it, which is exactly what a non-zero `centerOffset` reports.
 */
const CLAMPED_TRIGGER: JSX.CSSProperties = {
  position: "fixed",
  top: "200px",
  left: "0px",
  width: "24px",
  height: "24px",
};

const CENTRED: HarnessProps = {
  triggerStyle: CENTRED_TRIGGER,
  contentWidth: 120,
  options: { defaultOpen: true, side: "bottom", sideOffset: 8, flip: false, shift: false },
};

const CLAMPED: HarnessProps = {
  triggerStyle: CLAMPED_TRIGGER,
  contentWidth: 300,
  options: {
    defaultOpen: true,
    side: "bottom",
    sideOffset: 8,
    flip: false,
    shift: true,
    collisionPadding: 8,
    arrowPadding: 24,
  },
};

describe("createPopoverArrow", () => {
  it("is in the DOM before arrow() is defined — no element means no measurement, ever", async () => {
    const { container, state, dispose } = mountHarness(CENTRED);

    // THE DEADLOCK GUARD. Gating the element on `arrow()` is self-defeating: no element means no
    // `arrowElement` in `createFloating`'s config, means no `arrow` middleware, means `arrow()` stays
    // `undefined` forever. Asserted *before* awaiting the measurement, because after it the two are
    // indistinguishable.
    expect(state().floating.arrow()).toBeUndefined();
    const arrow = elementOf(container, "arrow");
    expect(state().arrowElement()).toBe(arrow);
    // And it starts *hidden* rather than flashing centred: an unmeasured arrow reads as clamped.
    expect(arrow.getAttribute("data-uncentered")).toBe("");

    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    await vi.waitFor(() => expect(state().floating.arrow()).toBeDefined());
    dispose();
  });

  it("reports the POPUP's side as data-side, and pins to the opposite edge in the inline style", async () => {
    const below = mountHarness(CENTRED);
    await vi.waitFor(() => expect(below.state().floating.arrow()).toBeDefined());
    const belowArrow = elementOf(below.container, "arrow");

    // Base UI's semantics: `data-side` is where the *popup* sits relative to the trigger, identical
    // to the Positioner's and the Content's, so one variant styles the card and its arrow
    // coherently. The pin edge is the opposite of it and lives only in the style.
    expect(belowArrow.getAttribute("data-side")).toBe("bottom");
    expect(belowArrow.getAttribute("data-align")).toBe("center");
    expect(belowArrow.style.top).toBe("calc(var(--hope-popover-arrow-size, 8px) / -2)");
    expect(belowArrow.style.left).toMatch(/^\d+(\.\d+)?px$/);
    // The pin is a CSS string, never a measured number: the size stays the recipe's, and the
    // primitive stays out of the CSSOM. Resolved, it is half the arrow back over the popup's edge.
    expectWithinOnePixel(
      belowArrow.getBoundingClientRect().top,
      elementOf(below.container, "content").getBoundingClientRect().top - ARROW_SIZE / 2,
    );
    below.dispose();

    const above = mountHarness({ ...CENTRED, options: { ...CENTRED.options, side: "top" } });
    await vi.waitFor(() => expect(above.state().floating.arrow()).toBeDefined());
    const aboveArrow = elementOf(above.container, "arrow");

    expect(aboveArrow.getAttribute("data-side")).toBe("top");
    expect(aboveArrow.style.bottom).toBe("calc(var(--hope-popover-arrow-size, 8px) / -2)");
    expect(aboveArrow.style.top).toBe("");
    above.dispose();
  });

  it("points at the anchor's centre when it fits, and reports data-uncentered when it does not", async () => {
    const centred = mountHarness(CENTRED);
    await vi.waitFor(() => expect(centred.state().floating.arrow()).toBeDefined());

    expect(centred.state().floating.arrow()?.centerOffset).toBe(0);
    expect(elementOf(centred.container, "arrow").hasAttribute("data-uncentered")).toBe(false);
    // The attribute is a claim about geometry, so the geometry is asserted too.
    expectWithinOnePixel(
      centerX(elementOf(centred.container, "arrow").getBoundingClientRect()),
      centerX(elementOf(centred.container, "trigger").getBoundingClientRect()),
    );
    centred.dispose();

    const clamped = mountHarness(CLAMPED);
    await vi.waitFor(() => expect(clamped.state().floating.arrow()).toBeDefined());

    expect(clamped.state().floating.arrow()?.centerOffset).not.toBe(0);
    expect(elementOf(clamped.container, "arrow").getAttribute("data-uncentered")).toBe("");
    // …and it really cannot point honestly: clamped away from the anchor's centre by more than the
    // 1px the centred case is held to.
    expect(
      Math.abs(
        centerX(elementOf(clamped.container, "arrow").getBoundingClientRect()) -
          centerX(elementOf(clamped.container, "trigger").getBoundingClientRect()),
      ),
    ).toBeGreaterThan(1);
    clamped.dispose();
  });

  it("merges the consumer's style over the kernel's and forwards their other attributes", async () => {
    const { container, state, dispose } = mountHarness({
      ...CENTRED,
      arrowProps: { ...ARROW_PROPS, id: "custom-arrow", title: "kept", lang: "fr" },
    });
    await vi.waitFor(() => expect(state().floating.arrow()).toBeDefined());
    const arrow = elementOf(container, "arrow");

    // Kernel first, consumer last — the Positioner's order, for the same reason: the size custom
    // property the pin above reads has to survive, and so does a `z-index`.
    expect(arrow.style.getPropertyValue("--hope-popover-arrow-size")).toBe(`${ARROW_SIZE}px`);
    expect(arrow.style.width).toBe(`${ARROW_SIZE}px`);
    expect(arrow.style.position).toBe("absolute");
    expect(arrow.style.top).toBe("calc(var(--hope-popover-arrow-size, 8px) / -2)");

    expect(arrow.id).toBe("custom-arrow");
    expect(arrow.getAttribute("title")).toBe("kept");
    expect(arrow.getAttribute("lang")).toBe("fr");
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, state, dispose } = mountHarness(CENTRED);

    // After the first measurement, deliberately: axe would otherwise inspect the pre-positioned
    // `visibility: hidden` intermediate and return an `incomplete` nobody can act on.
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    await expectNoA11yViolations(container, {
      // Undecidable by construction, not a markup problem: axe returns `aria-valid-attr-value` as
      // *incomplete* for **any** element carrying both `aria-haspopup` and `aria-controls`, without
      // ever resolving the IDREF (`ariaValidAttrValueEvaluate`'s `controlsWithinPopup` pre-check).
      // The IDREF itself is pinned in `popover-trigger.browser.test.tsx`.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    dispose();
  });
});
