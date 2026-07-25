import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
  type CreateFloatingReturn,
  createFloating,
  type FloatingAlign,
  type FloatingArrowState,
  type FloatingSizeState,
  type Middleware,
  type Side,
  type SideOrLogical,
  type VirtualElement,
} from "../create-floating";

// Geometry is pinned in px everywhere — never derived from content. Font metrics differ between the
// local Chromium and CI's headless shell, so a content-sized anchor makes every offset assertion a
// coin flip. Assertions are rect *relationships* with a 1px tolerance, or monotone change; never an
// absolute page coordinate.
const ANCHOR_WIDTH = 80;
const ANCHOR_HEIGHT = 24;
const FLOATING_WIDTH = 120;
const FLOATING_HEIGHT = 60;
const ARROW_SIZE = 8;
const FLOATING_ID = "floating-tip";

/** Far enough from every viewport edge that neither `flip` nor `shift` has anything to react to. */
const CLEAR_OF_EDGES: JSX.CSSProperties = {
  position: "fixed",
  top: "200px",
  left: "100px",
  width: `${ANCHOR_WIDTH}px`,
  height: `${ANCHOR_HEIGHT}px`,
};

/** Flush against the top edge: there is literally zero space above, so `flip` is viewport-independent. */
const AGAINST_TOP_EDGE: JSX.CSSProperties = { ...CLEAR_OF_EDGES, top: "0" };

/** Flush against the left edge and narrow, so a wide layer must `shift` to stay in view. */
const AGAINST_LEFT_EDGE: JSX.CSSProperties = { ...CLEAR_OF_EDGES, left: "0", width: "40px" };

/** Narrow enough that the arrow cannot be centred on it — the `centerOffset` case. */
const TOO_NARROW_FOR_THE_ARROW: JSX.CSSProperties = { ...AGAINST_LEFT_EDGE, width: "4px" };

/** Inside the scroll box's 1000px spacer, below its 200px viewport until it is scrolled to. */
const INSIDE_THE_SCROLL_BOX: JSX.CSSProperties = {
  position: "absolute",
  top: "250px",
  left: "20px",
  width: `${ANCHOR_WIDTH}px`,
  height: `${ANCHOR_HEIGHT}px`,
};

interface HarnessProps {
  onReady: (api: CreateFloatingReturn) => void;
  active?: () => boolean;
  side?: SideOrLogical;
  align?: FloatingAlign;
  /** `dir` on the floating element — the direction floating-ui itself reads. */
  floatingDir?: "ltr" | "rtl";
  /** `dir` on the anchor, set independently so a test can prove which of the two actually decides. */
  anchorDir?: "ltr" | "rtl";
  sideOffset?: number;
  alignOffset?: number;
  flip?: boolean;
  shift?: boolean;
  collisionPadding?: number;
  arrowPadding?: number;
  transform?: boolean;
  trackSize?: boolean;
  autoUpdate?: boolean;
  middleware?: Middleware[];
  anchorStyle?: JSX.CSSProperties;
  floatingWidth?: number;
  withArrow?: boolean;
  /** Positions against a virtual element instead of the rendered anchor. */
  virtualAnchor?: VirtualElement;
  /** Nests the anchor in a 200px scroll box over a 1000px spacer. */
  scrollable?: boolean;
}

function FloatingHarness(props: HarnessProps) {
  const [anchorElement, setAnchorElement] = createSignal<HTMLElement>();
  const [floatingElement, setFloatingElement] = createSignal<HTMLElement>();
  const [arrowElement, setArrowElement] = createSignal<HTMLElement>();

  const api = createFloating({
    active: () => props.active?.() ?? true,
    anchor: () => props.virtualAnchor ?? anchorElement(),
    floating: floatingElement,
    // Always supplied. What enables the `arrow` middleware is the *element* arriving, which is how
    // "no arrow rendered" and "arrow ref arrives late" are both exercised through one harness.
    arrowElement,
    // Every optional scalar goes through a getter — the documented idiom, and the only shape that
    // lets an option change re-measure without a remount.
    get side() {
      return props.side;
    },
    get align() {
      return props.align;
    },
    get sideOffset() {
      return props.sideOffset;
    },
    get alignOffset() {
      return props.alignOffset;
    },
    get flip() {
      return props.flip;
    },
    get shift() {
      return props.shift;
    },
    get collisionPadding() {
      return props.collisionPadding;
    },
    get arrowPadding() {
      return props.arrowPadding;
    },
    get transform() {
      return props.transform;
    },
    get trackSize() {
      return props.trackSize;
    },
    get autoUpdate() {
      return props.autoUpdate;
    },
    get middleware() {
      return props.middleware;
    },
  });

  props.onReady(api);

  const anchor = (
    <button
      type="button"
      data-testid="anchor"
      aria-describedby={FLOATING_ID}
      ref={setAnchorElement}
      dir={props.anchorDir}
      style={props.anchorStyle ?? CLEAR_OF_EDGES}
    >
      anchor
    </button>
  );

  return (
    <>
      {props.scrollable ? (
        <div
          data-testid="scrollbox"
          style={{ position: "relative", width: "300px", height: "200px", "overflow-y": "auto" }}
        >
          <div style={{ position: "relative", height: "1000px" }}>{anchor}</div>
        </div>
      ) : (
        anchor
      )}
      <div
        data-testid="floating"
        id={FLOATING_ID}
        role="tooltip"
        ref={setFloatingElement}
        dir={props.floatingDir}
        data-side={api.side()}
        style={{
          width: `${props.floatingWidth ?? FLOATING_WIDTH}px`,
          height: `${FLOATING_HEIGHT}px`,
          ...api.floatingStyles(),
        }}
      >
        tip
        {props.withArrow ? (
          <div
            data-testid="arrow"
            ref={setArrowElement}
            style={{ position: "absolute", width: `${ARROW_SIZE}px`, height: `${ARROW_SIZE}px` }}
          />
        ) : null}
      </div>
    </>
  );
}

function elementOf(container: HTMLElement, testId: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (element === null) {
    throw new Error(`no element with data-testid="${testId}"`);
  }
  return element;
}

const anchorRectOf = (container: HTMLElement) =>
  elementOf(container, "anchor").getBoundingClientRect();
const floatingRectOf = (container: HTMLElement) =>
  elementOf(container, "floating").getBoundingClientRect();
const centerX = (rect: DOMRect) => rect.left + rect.width / 2;

/** Sub-pixel layout and device-pixel rounding both land inside 1px; anything larger is a real move. */
function expectWithinOnePixel(actual: number, expected: number): void {
  expect(
    Math.abs(actual - expected),
    `expected ${actual} to be within 1px of ${expected}`,
  ).toBeLessThanOrEqual(1);
}

function arrowOf(api: CreateFloatingReturn): FloatingArrowState {
  const arrow = api.arrow();
  if (arrow === undefined) {
    throw new Error("expected arrow() to be defined — no arrow element reached the middleware");
  }
  return arrow;
}

function sizeOf(api: CreateFloatingReturn): FloatingSizeState {
  const size = api.size();
  if (size === undefined) {
    throw new Error("expected size() to be defined — is trackSize on?");
  }
  return size;
}

describe("createFloating", () => {
  it("places the layer on the requested side, sideOffset px away, centred on the anchor", async () => {
    let api!: CreateFloatingReturn;
    const { container, dispose } = mount(() => (
      <FloatingHarness onReady={(ready) => (api = ready)} side="bottom" sideOffset={8} />
    ));

    await vi.waitFor(() => {
      expect(api.isPositioned()).toBe(true);
      const anchor = anchorRectOf(container);
      const floating = floatingRectOf(container);
      expectWithinOnePixel(floating.top - anchor.bottom, 8);
      expectWithinOnePixel(centerX(floating), centerX(anchor));
    });
    expect(api.placement()).toBe("bottom");
    expect(api.strategy()).toBe("absolute");

    dispose();
  });

  it("reports side and align from the resolved placement, normalizing the centred case", async () => {
    let centred!: CreateFloatingReturn;
    const centredMount = mount(() => (
      <FloatingHarness onReady={(ready) => (centred = ready)} side="top" />
    ));
    await vi.waitFor(() => expect(centred.isPositioned()).toBe(true));

    expect(centred.placement()).toBe("top");
    expect(centred.side()).toBe("top");
    // floating-ui spells "centred" as an absent suffix; the binding normalizes it to "center".
    expect(centred.align()).toBe("center");
    expect(elementOf(centredMount.container, "floating").getAttribute("data-side")).toBe("top");
    centredMount.dispose();

    let aligned!: CreateFloatingReturn;
    const alignedMount = mount(() => (
      <FloatingHarness onReady={(ready) => (aligned = ready)} side="bottom" align="start" />
    ));
    await vi.waitFor(() => expect(aligned.isPositioned()).toBe(true));

    expect(aligned.placement()).toBe("bottom-start");
    expect(aligned.side()).toBe("bottom");
    expect(aligned.align()).toBe("start");
    alignedMount.dispose();
  });

  // ─── Logical sides ────────────────────────────────────────────────────────────────────────────
  //
  // `flip`/`shift` are off throughout: these assert which *physical* side a logical one resolves to,
  // and the test viewport is narrow enough (~414px) that a collision would decide the side instead.

  /** Resolves a logical side and reports back the physical side it landed on, plus the rect gap. */
  async function mountLogical(props: Partial<HarnessProps>) {
    let api!: CreateFloatingReturn;
    const mounted = mount(() => (
      <FloatingHarness onReady={(ready) => (api = ready)} flip={false} shift={false} {...props} />
    ));
    await vi.waitFor(() => expect(api.isPositioned()).toBe(true));
    return { ...mounted, api };
  }

  it("resolves inline-start to the physical left under LTR", async () => {
    const { container, api, dispose } = await mountLogical({
      side: "inline-start",
      floatingDir: "ltr",
    });

    // The OUTPUT vocabulary stays physical, deliberately: `side()` reports where the layer actually
    // is, which is what an arrow's static side and a recipe's `data-side` variant need.
    expect(api.side()).toBe("left");
    expect(api.placement()).toBe("left");
    expect(elementOf(container, "floating").getAttribute("data-side")).toBe("left");
    expectWithinOnePixel(floatingRectOf(container).right, anchorRectOf(container).left);

    dispose();
  });

  it("resolves inline-start to the physical right under RTL", async () => {
    const { container, api, dispose } = await mountLogical({
      side: "inline-start",
      floatingDir: "rtl",
    });

    expect(api.side()).toBe("right");
    expect(elementOf(container, "floating").getAttribute("data-side")).toBe("right");
    expectWithinOnePixel(floatingRectOf(container).left, anchorRectOf(container).right);

    dispose();
  });

  it("resolves inline-end to the physical left under RTL", async () => {
    const { container, api, dispose } = await mountLogical({
      side: "inline-end",
      floatingDir: "rtl",
    });

    expect(api.side()).toBe("left");
    expectWithinOnePixel(floatingRectOf(container).right, anchorRectOf(container).left);

    dispose();
  });

  it("leaves an explicitly physical side alone under RTL", async () => {
    // The whole point of keeping both vocabularies: `side="left"` means left in every locale. A
    // consumer who wants the mirrored behavior asks for it by name.
    const { container, api, dispose } = await mountLogical({ side: "left", floatingDir: "rtl" });

    expect(api.side()).toBe("left");
    expectWithinOnePixel(floatingRectOf(container).right, anchorRectOf(container).left);

    dispose();
  });

  it("takes the direction from the FLOATING element, not the anchor", async () => {
    // Which element decides is the load-bearing detail. floating-ui's core always calls
    // `platform.isRTL(elements.floating)` for its alignment handling, so resolving a logical side
    // off the anchor instead would let the side and the alignment disagree — the exact divergence
    // that kept logical sides out of this kernel. Same element, one source of truth.
    const { api, dispose } = await mountLogical({
      side: "inline-start",
      anchorDir: "rtl",
      floatingDir: "ltr",
    });

    expect(api.side()).toBe("left");

    dispose();
  });

  it("flips to the opposite side when the requested one has no room", async () => {
    let api!: CreateFloatingReturn;
    const { container, dispose } = mount(() => (
      <FloatingHarness
        onReady={(ready) => (api = ready)}
        side="top"
        anchorStyle={AGAINST_TOP_EDGE}
      />
    ));

    // The anchor is flush against the viewport's top edge, so "above it" is zero px wide whatever
    // the window size is — the flip is not a layout accident of this runner's viewport.
    await vi.waitFor(() => {
      expect(api.side()).toBe("bottom");
      const anchor = anchorRectOf(container);
      const floating = floatingRectOf(container);
      expectWithinOnePixel(floating.top - anchor.bottom, 0);
    });
    expect(elementOf(container, "floating").getAttribute("data-side")).toBe("bottom");

    dispose();
  });

  it("shifts along the alignment axis to stay inside the collision padding", async () => {
    let api!: CreateFloatingReturn;
    const { container, dispose } = mount(() => (
      <FloatingHarness
        onReady={(ready) => (api = ready)}
        side="bottom"
        anchorStyle={AGAINST_LEFT_EDGE}
        floatingWidth={240}
        collisionPadding={8}
      />
    ));

    await vi.waitFor(() => {
      expect(api.isPositioned()).toBe(true);
      expect(floatingRectOf(container).left).toBeGreaterThanOrEqual(7);
    });

    // The side is untouched — only the alignment axis moved — and the centres genuinely diverged,
    // which is what distinguishes a shift from "it happened to fit".
    expect(api.side()).toBe("bottom");
    expect(
      Math.abs(centerX(floatingRectOf(container)) - centerX(anchorRectOf(container))),
    ).toBeGreaterThan(1);

    dispose();
  });

  it("leaves the layer overflowing when flip and shift are off", async () => {
    // The same two layouts as the flip/shift cases above. Proving the toggles are wired is half of
    // it; the other half is proving those two cases measured a real collision rather than landing
    // on the right answer by luck.
    let noFlip!: CreateFloatingReturn;
    const noFlipMount = mount(() => (
      <FloatingHarness
        onReady={(ready) => (noFlip = ready)}
        side="top"
        anchorStyle={AGAINST_TOP_EDGE}
        flip={false}
        shift={false}
      />
    ));
    await vi.waitFor(() => expect(noFlip.isPositioned()).toBe(true));

    expect(noFlip.placement()).toBe("top");
    expect(floatingRectOf(noFlipMount.container).top).toBeLessThan(0);
    noFlipMount.dispose();

    let noShift!: CreateFloatingReturn;
    const noShiftMount = mount(() => (
      <FloatingHarness
        onReady={(ready) => (noShift = ready)}
        side="bottom"
        anchorStyle={AGAINST_LEFT_EDGE}
        floatingWidth={240}
        collisionPadding={8}
        flip={false}
        shift={false}
      />
    ));
    await vi.waitFor(() => expect(noShift.isPositioned()).toBe(true));

    const anchor = anchorRectOf(noShiftMount.container);
    const floating = floatingRectOf(noShiftMount.container);
    expect(floating.left).toBeLessThan(0);
    expectWithinOnePixel(centerX(floating), centerX(anchor));
    noShiftMount.dispose();
  });

  it("measures the arrow and reports the static side it pins to", async () => {
    let api!: CreateFloatingReturn;
    const { dispose } = mount(() => (
      <FloatingHarness onReady={(ready) => (api = ready)} side="bottom" withArrow />
    ));

    await vi.waitFor(() => expect(api.arrow()).toBeDefined());

    const arrow = arrowOf(api);
    expect(typeof arrow.x).toBe("number");
    // A bottom placement varies the arrow along x only; y is floating-ui's "not on this axis".
    expect(arrow.y).toBeUndefined();
    // The static side is the opposite of the resolved side — the edge the arrow is pinned to.
    expect(arrow.side).toBe("top");
    expect(arrow.centerOffset).toBe(0);

    dispose();
  });

  it("re-measures when the arrow ref arrives after the first measurement", async () => {
    // `arrowElement` is read inside the config memo rather than only at setup, so an arrow that
    // mounts later (a conditionally rendered part, the usual shape) still populates `arrow()`.
    const [withArrow, setWithArrow] = createSignal(false);
    let api!: CreateFloatingReturn;
    const { dispose } = mount(() => (
      <FloatingHarness onReady={(ready) => (api = ready)} side="bottom" withArrow={withArrow()} />
    ));

    await vi.waitFor(() => expect(api.isPositioned()).toBe(true));
    expect(api.arrow()).toBeUndefined();

    setWithArrow(true);
    await vi.waitFor(() => expect(api.arrow()).toBeDefined());
    expect(arrowOf(api).side).toBe("top");

    dispose();
  });

  it("reports a non-zero centerOffset when the anchor is too narrow for the arrow", async () => {
    let api!: CreateFloatingReturn;
    const { dispose } = mount(() => (
      <FloatingHarness
        onReady={(ready) => (api = ready)}
        side="bottom"
        anchorStyle={TOO_NARROW_FOR_THE_ARROW}
        floatingWidth={240}
        collisionPadding={8}
        arrowPadding={12}
        withArrow
      />
    ));

    // A 4px anchor against the left edge: `shift` pushes the layer right, so the anchor's centre
    // falls outside the arrow's padded range and the arrow gets clamped. That clamp *is*
    // `centerOffset` — the signal a consumer hides the arrow on.
    await vi.waitFor(() => {
      expect(api.arrow()).toBeDefined();
      expect(arrowOf(api).centerOffset).not.toBe(0);
    });
    expect(Number.isFinite(arrowOf(api).centerOffset)).toBe(true);

    dispose();
  });

  it("leaves arrow() undefined when no arrow element is supplied", async () => {
    let api!: CreateFloatingReturn;
    const { dispose } = mount(() => (
      <FloatingHarness onReady={(ready) => (api = ready)} side="bottom" />
    ));

    await vi.waitFor(() => expect(api.isPositioned()).toBe(true));
    expect(api.arrow()).toBeUndefined();
    expect(api.middlewareData().arrow).toBeUndefined();

    dispose();
  });

  it("repositions when a scroll ancestor of the anchor scrolls", async () => {
    let api!: CreateFloatingReturn;
    const { container, dispose } = mount(() => (
      <FloatingHarness
        onReady={(ready) => (api = ready)}
        side="bottom"
        sideOffset={6}
        scrollable
        anchorStyle={INSIDE_THE_SCROLL_BOX}
        // Off, so the anchor↔layer relationship below holds while the anchor is partly clipped.
        flip={false}
        shift={false}
      />
    ));

    await vi.waitFor(() => expect(api.isPositioned()).toBe(true));
    const before = api.y();

    elementOf(container, "scrollbox").scrollTop = 120;

    await vi.waitFor(() => expect(api.y()).not.toBe(before));
    await vi.waitFor(() => {
      const anchor = anchorRectOf(container);
      const floating = floatingRectOf(container);
      expectWithinOnePixel(floating.top - anchor.bottom, 6);
    });

    dispose();
  });

  it("repositions when the anchor resizes", async () => {
    let api!: CreateFloatingReturn;
    const { container, dispose } = mount(() => (
      <FloatingHarness onReady={(ready) => (api = ready)} side="bottom" />
    ));

    await vi.waitFor(() => expect(api.isPositioned()).toBe(true));
    const before = api.x();

    // A width change no listener could infer — only `autoUpdate`'s ResizeObserver sees it.
    elementOf(container, "anchor").style.width = "400px";

    await vi.waitFor(() => expect(api.x()).not.toBe(before));
    await vi.waitFor(() => {
      const anchor = anchorRectOf(container);
      const floating = floatingRectOf(container);
      expectWithinOnePixel(centerX(floating), centerX(anchor));
    });

    dispose();
  });

  it("re-measures when an option changes, with no remount", async () => {
    // The case the getter idiom exists for: `side` is a live prop, so the config memo invalidates
    // and effect (2) issues a fresh measurement without any element identity changing.
    const [side, setSide] = createSignal<Side>("bottom");
    let api!: CreateFloatingReturn;
    const { container, dispose } = mount(() => (
      <FloatingHarness onReady={(ready) => (api = ready)} side={side()} sideOffset={10} />
    ));

    await vi.waitFor(() => {
      expect(api.isPositioned()).toBe(true);
      const anchor = anchorRectOf(container);
      const floating = floatingRectOf(container);
      expectWithinOnePixel(floating.top - anchor.bottom, 10);
    });

    setSide("top");

    await vi.waitFor(() => {
      expect(api.side()).toBe("top");
      const anchor = anchorRectOf(container);
      const floating = floatingRectOf(container);
      expectWithinOnePixel(anchor.top - floating.bottom, 10);
    });

    dispose();
  });

  it("resets isPositioned on deactivate and re-reports it on the next activation", async () => {
    // The fast close→open path through `createPresence`: no element changes, so effect (1) never
    // re-runs and only effect (2) can flip `isPositioned` back.
    const [active, setActive] = createSignal(true);
    let api!: CreateFloatingReturn;
    const { dispose } = mount(() => (
      <FloatingHarness onReady={(ready) => (api = ready)} active={active} />
    ));

    await vi.waitFor(() => expect(api.isPositioned()).toBe(true));

    setActive(false);
    await vi.waitFor(() => expect(api.isPositioned()).toBe(false));

    setActive(true);
    await vi.waitFor(() => expect(api.isPositioned()).toBe(true));

    dispose();
  });

  it("keeps the layer hidden until the first measurement lands", async () => {
    let api!: CreateFloatingReturn;
    const { dispose } = mount(() => <FloatingHarness onReady={(ready) => (api = ready)} />);

    // Read synchronously, before any await: this is the branch the server renders too, so it must
    // hold no client-only input. `visibility`, not `display: none` — an element with no box can
    // never be measured, which would deadlock.
    const initial = api.floatingStyles();
    expect(initial.visibility).toBe("hidden");
    expect(initial.position).toBe("absolute");
    expect(initial.transform).toBeUndefined();

    await vi.waitFor(() => {
      const positioned = api.floatingStyles();
      expect(positioned.visibility).toBeUndefined();
      expect(positioned.transform).toMatch(/^translate\(/);
    });

    dispose();
  });

  it("restyles from transform to left/top without issuing a new measurement", async () => {
    // `transform` is read in the `floatingStyles` memo, not the config memo. Toggling it must
    // re-render the style and nothing else — an appended middleware counts every `computePosition`.
    let measurements = 0;
    const countMeasurements: Middleware = {
      name: "count-measurements",
      fn: () => {
        measurements += 1;
        return {};
      },
    };
    const [transform, setTransform] = createSignal(true);
    const [side, setSide] = createSignal<Side>("bottom");
    let api!: CreateFloatingReturn;
    const { dispose } = mount(() => (
      <FloatingHarness
        onReady={(ready) => (api = ready)}
        side={side()}
        transform={transform()}
        middleware={[countMeasurements]}
        // Deterministic measurement count: one at attach, then only what a config change causes.
        autoUpdate={false}
        flip={false}
        shift={false}
      />
    ));

    await vi.waitFor(() => expect(api.isPositioned()).toBe(true));
    const afterFirstMeasurement = measurements;
    expect(afterFirstMeasurement).toBeGreaterThan(0);
    expect(api.floatingStyles().transform).toMatch(/^translate\(/);

    setTransform(false);
    await vi.waitFor(() => {
      const styles = api.floatingStyles();
      expect(styles.transform).toBeUndefined();
      expect(styles.left).toMatch(/px$/);
      expect(styles.top).toMatch(/px$/);
    });
    expect(measurements).toBe(afterFirstMeasurement);

    // The control: a config option *does* re-measure, so the counter above wasn't simply inert.
    setSide("top");
    await vi.waitFor(() => expect(api.side()).toBe("top"));
    expect(measurements).toBeGreaterThan(afterFirstMeasurement);

    dispose();
  });

  it("populates size() only when trackSize is on", async () => {
    let untracked!: CreateFloatingReturn;
    const untrackedMount = mount(() => (
      <FloatingHarness onReady={(ready) => (untracked = ready)} />
    ));
    await vi.waitFor(() => expect(untracked.isPositioned()).toBe(true));
    expect(untracked.size()).toBeUndefined();
    untrackedMount.dispose();

    let tracked!: CreateFloatingReturn;
    const trackedMount = mount(() => (
      <FloatingHarness onReady={(ready) => (tracked = ready)} trackSize />
    ));
    await vi.waitFor(() => expect(tracked.size()).toBeDefined());

    const size = sizeOf(tracked);
    expectWithinOnePixel(size.anchorWidth, anchorRectOf(trackedMount.container).width);
    expectWithinOnePixel(size.anchorHeight, ANCHOR_HEIGHT);
    expect(size.availableHeight).toBeGreaterThan(0);
    expect(size.availableWidth).toBeGreaterThan(0);
    // Measurement only: nothing was written onto the element, which is what keeps `size` out of its
    // classic ResizeObserver feedback loop.
    expect(elementOf(trackedMount.container, "floating").style.maxHeight).toBe("");
    trackedMount.dispose();
  });

  it("disconnects every observer it attached when the owner is disposed", async () => {
    const NativeResizeObserver = window.ResizeObserver;
    let constructed = 0;
    let disconnected = 0;

    class CountingResizeObserver extends NativeResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super(callback);
        constructed += 1;
      }
      disconnect(): void {
        disconnected += 1;
        super.disconnect();
      }
    }
    window.ResizeObserver = CountingResizeObserver;

    try {
      let api!: CreateFloatingReturn;
      const { dispose } = mount(() => <FloatingHarness onReady={(ready) => (api = ready)} />);
      await vi.waitFor(() => expect(api.isPositioned()).toBe(true));

      expect(constructed).toBeGreaterThan(0);
      expect(disconnected).toBe(0);

      dispose();
      expect(disconnected).toBe(constructed);
    } finally {
      window.ResizeObserver = NativeResizeObserver;
    }
  });

  it("drops a computePosition resolution that lands after dispose", async () => {
    // `mount()` cannot police this window: `dispose()` is what raises Solid's diagnostics, so a
    // write emitted *after* it has nobody to report it. A console spy plus an unhandled-rejection
    // listener are what stand in — the `computePosition` promise carries no `.catch()`, matching
    // the Vue/React ports, so the `generation`/`disposed` guard is the only thing holding.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const rejections: string[] = [];
    const recordRejection = (event: PromiseRejectionEvent) => rejections.push(String(event.reason));
    window.addEventListener("unhandledrejection", recordRejection);

    try {
      let api!: CreateFloatingReturn;
      const { dispose } = mount(() => <FloatingHarness onReady={(ready) => (api = ready)} />);

      // No await before this line: the first measurement's promise is still in flight, so its
      // resolution is guaranteed to land on a disposed owner.
      expect(api.isPositioned()).toBe(false);
      dispose();

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Without the guard the late `.then` writes through and flips this to true.
      expect(api.isPositioned()).toBe(false);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(rejections).toEqual([]);
    } finally {
      window.removeEventListener("unhandledrejection", recordRejection);
      errorSpy.mockRestore();
    }
  });

  it("positions against a virtual element and re-measures on update()", async () => {
    // The pointer-anchored shape (ContextMenu). The object is **stable** and closes over mutable
    // coords: a fresh `{ getBoundingClientRect }` per pointer event would change `anchor()`'s
    // identity and tear down `autoUpdate` on every mouse move.
    const coords = { x: 100, y: 100 };
    const virtualAnchor: VirtualElement = {
      getBoundingClientRect: () => new DOMRect(coords.x, coords.y, ANCHOR_WIDTH, ANCHOR_HEIGHT),
    };

    let api!: CreateFloatingReturn;
    const { container, dispose } = mount(() => (
      <FloatingHarness
        onReady={(ready) => (api = ready)}
        virtualAnchor={virtualAnchor}
        side="bottom"
        sideOffset={4}
        flip={false}
        shift={false}
      />
    ));

    await vi.waitFor(() => {
      expect(api.isPositioned()).toBe(true);
      const floating = floatingRectOf(container);
      expectWithinOnePixel(floating.top - (coords.y + ANCHOR_HEIGHT), 4);
      expectWithinOnePixel(centerX(floating), coords.x + ANCHOR_WIDTH / 2);
    });

    const before = api.y();
    coords.y = 320;
    // No observer can see a virtual rect mutate — `update()` is the documented escape hatch.
    api.update();

    await vi.waitFor(() => {
      expect(api.y()).not.toBe(before);
      const floating = floatingRectOf(container);
      expectWithinOnePixel(floating.top - (coords.y + ANCHOR_HEIGHT), 4);
    });

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: CreateFloatingReturn;
    const { container, dispose } = mount(() => (
      <FloatingHarness onReady={(ready) => (api = ready)} side="bottom" sideOffset={8} withArrow />
    ));

    // After the first measurement, deliberately: axe would otherwise inspect the pre-positioned
    // `visibility: hidden` intermediate and return an `incomplete` nobody can act on.
    await vi.waitFor(() => expect(api.isPositioned()).toBe(true));
    await expectNoA11yViolations(container);

    dispose();
  });
});
