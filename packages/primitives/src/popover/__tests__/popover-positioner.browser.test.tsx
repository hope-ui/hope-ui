import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import type { SideOrLogical } from "../../internal";
import { createPopoverPositioner } from "../popover-positioner";
import {
  type CreatePopoverOptions,
  type CreatePopoverReturn,
  createPopover,
} from "../popover-root";

// Geometry is pinned in px and never derived from content — font metrics differ between the local
// Chromium and CI's headless shell, which also runs with a real ~15px scrollbar gutter. Assertions
// are rect *relationships* with a 1px tolerance, the convention `create-floating.browser.test.tsx`
// states.
const SIDE_OFFSET = 8;
const CONTENT_WIDTH = 120;
const CONTENT_HEIGHT = 60;
const TITLE_ID = "popover-positioner-title";

/** Far enough from every edge that a 120×60 layer fits on any side without `flip`/`shift` firing. */
const TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "200px",
  left: "300px",
  width: "80px",
  height: "24px",
};

interface HarnessProps {
  options?: CreatePopoverOptions;
  positionerProps?: JSX.HTMLAttributes<HTMLDivElement>;
  onReady?: (state: CreatePopoverReturn) => void;
}

function Harness(props: HarnessProps) {
  const state = createPopover(props.options);
  props.onReady?.(state);
  const positioner = createPopoverPositioner(state, props.positionerProps ?? {});

  return (
    <>
      <button
        type="button"
        data-testid="trigger"
        style={TRIGGER_STYLE}
        ref={state.setTriggerElement}
      >
        open
      </button>
      <Show when={positioner.mounted()}>
        <div data-testid="positioner" {...positioner.props} ref={positioner.setRef}>
          {/* The content stands in for `Popover.Content`, which Phase 5 ships alongside; this file
          only needs a fixed-size box carrying an accessible name, because `role="dialog"` without
          one is an axe `aria-dialog-name` violation. */}
          <div
            data-testid="content"
            role="dialog"
            aria-labelledby={TITLE_ID}
            style={{ width: `${CONTENT_WIDTH}px`, height: `${CONTENT_HEIGHT}px` }}
            ref={state.setContentElement}
          >
            <h2 id={TITLE_ID}>Popover title</h2>
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

const centerY = (rect: DOMRect) => rect.top + rect.height / 2;

/** Sub-pixel layout and device-pixel rounding both land inside 1px; anything larger is a real move. */
function expectWithinOnePixel(actual: number, expected: number): void {
  expect(
    Math.abs(actual - expected),
    `expected ${actual} to be within 1px of ${expected}`,
  ).toBeLessThanOrEqual(1);
}

/** `flip`/`shift` off: this file asserts the emitted side, not collision handling. */
const OPEN_OPTIONS: CreatePopoverOptions = {
  defaultOpen: true,
  sideOffset: SIDE_OFFSET,
  flip: false,
  shift: false,
};

describe("createPopoverPositioner", () => {
  it("is gated on the shared presence: absent while closed, mounted while open", () => {
    const closed = mountHarness();
    expect(closed.container.querySelector('[data-testid="positioner"]')).toBeNull();
    closed.dispose();

    const open = mountHarness({ options: OPEN_OPTIONS });
    expect(open.container.querySelector('[data-testid="positioner"]')).toBeTruthy();
    // The *shared* presence, not one of its own — the same object `createPopoverContent` reflects.
    expect(open.state().contentPresence.mounted()).toBe(true);
    open.dispose();
  });

  it("carries the kernel's positioning style plus data-side / data-align / data-presence", async () => {
    const { container, state, dispose } = mountHarness({ options: OPEN_OPTIONS });
    const positioner = elementOf(container, "positioner");

    expect(state().positionerElement()).toBe(positioner);
    expect(positioner.getAttribute("data-presence")).toBe(state().contentPresence.status());

    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    expect(positioner.getAttribute("data-side")).toBe("bottom");
    expect(positioner.getAttribute("data-align")).toBe("center");
    expect(positioner.style.position).toBe("absolute");
    expect(positioner.style.transform).toContain("translate(");
    dispose();
  });

  it("publishes the measured geometry as custom properties once positioned", async () => {
    const { container, state, dispose } = mountHarness({ options: OPEN_OPTIONS });
    const positioner = elementOf(container, "positioner");

    // Nothing before the first measurement — deliberately absent rather than `0px`, which would
    // collapse whatever reads it. An unresolved `var()` invalidates only its own declaration.
    expect(positioner.style.getPropertyValue("--anchor-width")).toBe("");

    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));

    const trigger = elementOf(container, "trigger").getBoundingClientRect();
    expectWithinOnePixel(
      Number.parseFloat(positioner.style.getPropertyValue("--anchor-width")),
      trigger.width,
    );
    expectWithinOnePixel(
      Number.parseFloat(positioner.style.getPropertyValue("--anchor-height")),
      trigger.height,
    );
    // Space before the collision boundary — a viewport-sized number, so only its sign is stable.
    expect(
      Number.parseFloat(positioner.style.getPropertyValue("--available-width")),
    ).toBeGreaterThan(0);
    expect(
      Number.parseFloat(positioner.style.getPropertyValue("--available-height")),
    ).toBeGreaterThan(0);
    dispose();
  });

  it("publishes them without sizing the layer itself — the ResizeObserver loop stays open", async () => {
    const { container, state, dispose } = mountHarness({ options: OPEN_OPTIONS });
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));

    // `trackSize` is measurement-only by contract: the kernel hands CSS the numbers and writes no
    // `width`/`max-height` of its own. Writing them here is what would close `size`'s feedback loop.
    const positioner = elementOf(container, "positioner");
    expect(positioner.style.width).toBe("");
    expect(positioner.style.maxHeight).toBe("");
    expect(elementOf(container, "content").style.maxHeight).toBe("");
    dispose();
  });

  it("merges a consumer style object over the kernel's, so a conflicting key wins", async () => {
    const { container, state, dispose } = mountHarness({
      options: OPEN_OPTIONS,
      // The documented escape valve for `create-floating.md`'s consumer anti-pattern #4: kernel
      // first, consumer last. `z-index` is additive; `position` conflicts with the kernel's own.
      positionerProps: { style: { "z-index": 60, position: "fixed" } },
    });
    const positioner = elementOf(container, "positioner");

    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    expect(positioner.style.zIndex).toBe("60");
    expect(positioner.style.position).toBe("fixed");
    // …and the rest of the kernel's object survived the merge rather than being replaced by it —
    // including the measured custom properties, which a recipe's `w-(--anchor-width)` depends on.
    expect(positioner.style.transform).toContain("translate(");
    expect(positioner.style.getPropertyValue("--anchor-width")).not.toBe("");
    dispose();
  });

  it("warns in dev on a string style rather than dropping it silently", async () => {
    // `mount` intercepts console.warn to fail on Solid diagnostics, so spy+mock before mounting
    // (the shape `create-button`'s mismatch-warning test uses).
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container, dispose } = mountHarness({
      options: OPEN_OPTIONS,
      positionerProps: { style: "z-index: 60" },
    });

    await vi.waitFor(() =>
      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining("string `style`")),
    );
    // A string has no merge seam, and the kernel's positioning has to win or the layer paints at 0,0.
    expect(elementOf(container, "positioner").style.zIndex).toBe("");
    dispose();
    consoleWarn.mockRestore();
  });

  it("forwards the consumer's own attributes onto the element", () => {
    const { container, dispose } = mountHarness({
      options: OPEN_OPTIONS,
      positionerProps: { id: "custom-positioner", title: "kept", lang: "fr" },
    });
    const positioner = elementOf(container, "positioner");

    expect(positioner.id).toBe("custom-positioner");
    expect(positioner.getAttribute("title")).toBe("kept");
    expect(positioner.getAttribute("lang")).toBe("fr");
    dispose();
  });

  it("resolves side='inline-end' against dir=rtl on the positioner, and reports a PHYSICAL side", async () => {
    const { container, state, dispose } = mountHarness({
      options: { ...OPEN_OPTIONS, side: "inline-end" },
      // `dir` reaches the positioner as an ordinary forwarded native attribute — Popover writes no
      // locale-derived `dir` of its own. `createFloating` reads
      // `getComputedStyle(floating).direction`, the same call floating-ui's `platform.isRTL` makes.
      positionerProps: { dir: "rtl" },
    });

    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));

    // The attribute alone would pass even if the layer painted on the wrong side, so the rect is
    // asserted too: inline-end under rtl is physical `left`.
    expect(elementOf(container, "positioner").getAttribute("data-side")).toBe("left");
    const trigger = elementOf(container, "trigger").getBoundingClientRect();
    const positioner = elementOf(container, "positioner").getBoundingClientRect();
    expectWithinOnePixel(trigger.left - positioner.right, SIDE_OFFSET);
    expectWithinOnePixel(centerY(positioner), centerY(trigger));
    dispose();
  });

  it("keeps side='inline-end' physical `right` under the default ltr", async () => {
    const { container, state, dispose } = mountHarness({
      options: { ...OPEN_OPTIONS, side: "inline-end" },
    });

    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    expect(elementOf(container, "positioner").getAttribute("data-side")).toBe("right");
    const trigger = elementOf(container, "trigger").getBoundingClientRect();
    const positioner = elementOf(container, "positioner").getBoundingClientRect();
    expectWithinOnePixel(positioner.left - trigger.right, SIDE_OFFSET);
    dispose();
  });

  it("re-measures when a positioning option changes, rather than needing a remount", async () => {
    const [side, setSide] = createSignal<SideOrLogical>("bottom");
    const { container, state, dispose } = mountHarness({
      options: {
        ...OPEN_OPTIONS,
        get side() {
          return side();
        },
      },
    });

    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    expect(elementOf(container, "positioner").getAttribute("data-side")).toBe("bottom");

    flush(() => setSide("top"));
    await vi.waitFor(() => {
      expect(elementOf(container, "positioner").getAttribute("data-side")).toBe("top");
      const trigger = elementOf(container, "trigger").getBoundingClientRect();
      const positioner = elementOf(container, "positioner").getBoundingClientRect();
      expectWithinOnePixel(trigger.top - positioner.bottom, SIDE_OFFSET);
    });
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, state, dispose } = mountHarness({ options: OPEN_OPTIONS });

    // After the first measurement, deliberately: axe would otherwise inspect the pre-positioned
    // `visibility: hidden` intermediate and return an `incomplete` nobody can act on.
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    await expectNoA11yViolations(container);
    dispose();
  });
});
