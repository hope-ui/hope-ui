import {
  type Alignment,
  arrow as arrowMiddleware,
  autoUpdate,
  type Boundary,
  computePosition,
  flip as flipMiddleware,
  type Middleware,
  type MiddlewareData,
  offset as offsetMiddleware,
  type Padding,
  type Placement,
  type ReferenceElement,
  type Side,
  type Strategy,
  shift as shiftMiddleware,
  size as sizeMiddleware,
} from "@floating-ui/dom";
import type { JSX } from "@solidjs/web";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";

export type {
  Boundary,
  Middleware,
  MiddlewareData,
  Padding,
  Placement,
  ReferenceElement,
  Side,
  Strategy,
  VirtualElement,
} from "@floating-ui/dom";

/** Alignment along the side's cross axis. floating-ui spells the centred case as an absent suffix. */
export type FloatingAlign = "start" | "center" | "end";

/**
 * The two inline-relative sides, mirroring `inset-inline-start`/`-end`. Resolved to a physical `Side`
 * before floating-ui ever sees it — floating-ui's placement vocabulary is physical by design.
 */
export type LogicalSide = "inline-start" | "inline-end";

/**
 * What `side` accepts: floating-ui's four physical sides plus the two inline-relative ones.
 *
 * Kept distinct from `Side`, which stays the **output** vocabulary — `side()` always reports a
 * physical side, because it reports where the layer actually landed after `flip`. Base UI mirrors the
 * input vocabulary back out instead; hope-ui deliberately does not, because a recipe (including a
 * third-party preset's) selects on `data-side` and cannot know which vocabulary the consumer
 * happened to ask in. See `__internal__/reference-implementations.md` § createFloating.
 */
export type SideOrLogical = Side | LogicalSide;

export interface FloatingArrowState {
  x: number | undefined;
  y: number | undefined;
  /** 0 when perfectly centred; non-zero means the anchor is too narrow — the signal to hide the arrow. */
  centerOffset: number;
  /**
   * The side the arrow pins to — the **opposite** of `side()`. A derived value only: the -50%
   * translate and the 45° rotation are CSS the themeable component writes.
   */
  side: Side;
}

export interface FloatingSizeState {
  /** The anchor's measured width — the `--anchor-width` a Select listbox matches. */
  anchorWidth: number;
  anchorHeight: number;
  availableWidth: number;
  /** Space left before the collision boundary — the `--available-height` a long listbox caps itself with. */
  availableHeight: number;
}

export interface CreateFloatingOptions {
  /** Whether the layer is currently open. Same seam as `createDismissable`/`createFocusTrap`. */
  active: Accessor<boolean>;
  /** The element (or virtual element) to position against. */
  anchor: Accessor<ReferenceElement | null | undefined>;
  /** The **positioner** — the element `floatingStyles()` is spread onto, not the content card inside it. */
  floating: Accessor<HTMLElement | null | undefined>;
  /** Supplying this is what enables the `arrow` middleware, and so populates `arrow()`. */
  arrowElement?: Accessor<HTMLElement | null | undefined>;
  /**
   * Preferred side. Default `"bottom"`. `side()` reports the **physical** side actually used after
   * `flip`, so a logical `"inline-start"`/`"inline-end"` here comes back as `"left"`/`"right"`.
   *
   * A logical side resolves against `getComputedStyle(floating).direction` — deliberately the floating
   * element and deliberately the DOM, because that is exactly what floating-ui's own
   * `platform.isRTL(elements.floating)` reads for its alignment handling. Same element, same call: the
   * side and the alignment cannot disagree, and no `@hope-ui/i18n` import enters the positioning layer.
   * The practical consequence is that a portaled positioner inherits `dir` from wherever it is
   * portaled to, not from the anchor's subtree — floating-ui already behaves that way for alignment.
   */
  side?: SideOrLogical;
  /** Alignment along the cross axis. Default `"center"`. */
  align?: FloatingAlign;
  /** Distance from the anchor, in px. Default `0`. */
  sideOffset?: number;
  /** Skid along the alignment axis, in px. Default `0`. */
  alignOffset?: number;
  /** CSS `position` for the positioner. Default `"absolute"` — see the doc on `"fixed"`'s caveat. */
  strategy?: Strategy;
  /** Flip to the opposite side when the preferred one overflows. Default `true`. */
  flip?: boolean;
  /** Slide along the alignment axis to stay in view. Default `true`. */
  shift?: boolean;
  /** Padding kept between the layer and the collision boundary. Default `0`. */
  collisionPadding?: Padding;
  /** What the layer must stay inside. Default floating-ui's `"clippingAncestors"`. */
  collisionBoundary?: Boundary;
  /** Padding kept between the arrow and the layer's corners. Default `0`. */
  arrowPadding?: number;
  /** Position with `translate()` rather than `left`/`top`. Default `true`. */
  transform?: boolean;
  /** Run the `size` middleware and populate `size()`. Default `false`, measurement-only. */
  trackSize?: boolean;
  /** Keep the position current via scroll/resize observers. Default `true`. */
  autoUpdate?: boolean;
  /** Re-measure every animation frame — for an anchor that moves under a transform. Default `false`. */
  trackAnchorMotion?: boolean;
  /** Extra middleware, **appended** after the built-in stack. */
  middleware?: Middleware[];
}

export interface CreateFloatingReturn {
  /** The primary product — spread onto the positioner. */
  floatingStyles: Accessor<JSX.CSSProperties>;
  /** The **resolved** placement, after `flip`/`shift`. */
  placement: Accessor<Placement>;
  /** The resolved side — what `data-side` should carry. */
  side: Accessor<Side>;
  /** The resolved alignment, with floating-ui's absent suffix normalized to `"center"`. */
  align: Accessor<FloatingAlign>;
  /** Whether a measurement has landed for the current activation. `false` while closed. */
  isPositioned: Accessor<boolean>;
  x: Accessor<number>;
  y: Accessor<number>;
  strategy: Accessor<Strategy>;
  /** Arrow measurements, or `undefined` when no `arrowElement` was supplied. */
  arrow: Accessor<FloatingArrowState | undefined>;
  /** Size measurements, or `undefined` unless `trackSize` is on. */
  size: Accessor<FloatingSizeState | undefined>;
  /** Raw middleware output — the escape hatch for anything this binding doesn't surface. */
  middlewareData: Accessor<MiddlewareData>;
  /** Force a re-measure: for virtual-element rect mutations and other unobservable changes. */
  update: () => void;
}

/** Everything that shapes a `computePosition` call, resolved from the options in one place. */
interface FloatingConfig {
  /** The *requested* side, still possibly logical — `placementFor` resolves it per measurement. */
  side: SideOrLogical;
  align: FloatingAlign;
  strategy: Strategy;
  sideOffset: number;
  alignOffset: number;
  flip: boolean;
  shift: boolean;
  collisionPadding: Padding;
  collisionBoundary: Boundary;
  arrowElement: HTMLElement | null | undefined;
  arrowPadding: number;
  trackSize: boolean;
  extraMiddleware: Middleware[];
}

/** The whole measurement outcome, held as one record so a re-measure is a single signal write. */
interface FloatingPosition {
  x: number;
  y: number;
  placement: Placement;
  strategy: Strategy;
  middlewareData: MiddlewareData;
  size: FloatingSizeState | undefined;
}

/**
 * Where `size`'s `apply` callback lands its numbers. One per `computePosition` call, never a shared
 * `let`: two measurement chains can interleave at microtask granularity, and the loser would
 * otherwise overwrite the winner's numbers.
 */
interface SizeSink {
  value: FloatingSizeState | undefined;
}

const OPPOSITE_SIDE: Record<Side, Side> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

function toPlacement(side: Side, align: FloatingAlign): Placement {
  return align === "center" ? side : `${side}-${align}`;
}

/** Collapses a possibly-logical side onto floating-ui's physical vocabulary. */
function toPhysicalSide(side: SideOrLogical, isRtl: boolean): Side {
  if (side === "inline-start") {
    return isRtl ? "right" : "left";
  }
  if (side === "inline-end") {
    return isRtl ? "left" : "right";
  }
  return side;
}

function placementFor(config: FloatingConfig, isRtl: boolean): Placement {
  return toPlacement(toPhysicalSide(config.side, isRtl), config.align);
}

/**
 * The reading direction floating-ui itself would see. `platform.isRTL` in `@floating-ui/dom` is
 * `getComputedStyle(element).direction === "rtl"`, and core always hands it `elements.floating` — so
 * calling it the same way on the same element is what keeps a logical side and floating-ui's own
 * alignment handling from ever disagreeing.
 */
function isFloatingRtl(floating: HTMLElement): boolean {
  return getComputedStyle(floating).direction === "rtl";
}

/** Device pixel ratio of the element's own window. Ported from `@floating-ui/vue`'s utils. */
function getDevicePixelRatio(element: HTMLElement): number {
  return element.ownerDocument.defaultView?.devicePixelRatio || 1;
}

/** Snap to whole device pixels: a sub-pixel translate blurs text on a retina display. */
function roundByDevicePixelRatio(element: HTMLElement, value: number): number {
  const ratio = getDevicePixelRatio(element);
  return Math.round(value * ratio) / ratio;
}

/**
 * Ordering is floating-ui's own guidance: `offset` shifts the starting point, `flip` picks the side
 * from the offset geometry, `shift` slides within the side `flip` chose, and `arrow` measures against
 * the final coordinates. Radix deliberately runs `shift` *before* `flip` — preferring to slide rather
 * than jump sides — so a future `collisionPreference` option is an addition here, not a rewrite.
 *
 * Consumer middleware is appended last, which is also its documented limitation: anything that must
 * run early (`inline()`) needs `flip`/`shift` off and the whole stack supplied.
 */
function buildMiddleware(config: FloatingConfig, sink: SizeSink): Middleware[] {
  const collision = { padding: config.collisionPadding, boundary: config.collisionBoundary };
  const middleware: Middleware[] = [
    // `crossAxis` covers a centred placement, `alignmentAxis` an aligned one — floating-ui applies
    // whichever fits the resolved placement, so passing both makes `alignOffset` mean one thing.
    offsetMiddleware({
      mainAxis: config.sideOffset,
      crossAxis: config.alignOffset,
      alignmentAxis: config.alignOffset,
    }),
  ];

  if (config.flip) {
    middleware.push(flipMiddleware(collision));
  }
  if (config.shift) {
    middleware.push(shiftMiddleware(collision));
  }
  if (config.arrowElement != null) {
    middleware.push(
      arrowMiddleware({ element: config.arrowElement, padding: config.arrowPadding }),
    );
  }
  if (config.trackSize) {
    middleware.push(
      sizeMiddleware({
        ...collision,
        // Measurement only — deliberately no width/height write. Sizing the floating element here
        // is what creates `size`'s classic ResizeObserver feedback loop; the consumer decides what
        // to do with the numbers (usually a CSS custom property).
        apply({ rects, availableWidth, availableHeight }) {
          sink.value = {
            anchorWidth: rects.reference.width,
            anchorHeight: rects.reference.height,
            availableWidth,
            availableHeight,
          };
        },
      }),
    );
  }

  return [...middleware, ...config.extraMiddleware];
}

/**
 * Positions a floating layer against an anchor: a SolidJS reactive binding over
 * [`@floating-ui/dom`](https://floating-ui.com) (placement, `flip`/`shift`, `offset`, `arrow`,
 * `autoUpdate`), and the substrate every overlay component positions with — Popover, Tooltip,
 * HoverCard, Menu, Select, Combobox.
 *
 * **Positioning only.** Dismissal (`createDismissable`), focus (`createFocusTrap`), and hover intent
 * are separate primitives, the same split floating-ui draws between its own packages. A Popover
 * composes them; none of them knows about the others.
 *
 * The API vocabulary is Base UI's — `side`/`align`/`sideOffset`/`alignOffset` — which is the
 * anchor-relative way to say what floating-ui spells as a single `placement` string. The structural
 * reference is `@floating-ui/vue`, not the React port. See `__internal__/reference-implementations.md`.
 *
 * `@floating-ui/dom` is an **optional** peerDependency, so a consumer who never opens a floating
 * layer keeps a dependency-free `@hope-ui/primitives` install.
 *
 * Elements arrive as accessors because they are conditionally rendered and must be *tracked*; every
 * other option is a plain scalar the caller keeps live with a getter:
 *
 * ```ts
 * createFloating({
 *   active: state.open,
 *   anchor: state.triggerElement,
 *   floating: positioner,
 *   get side() { return props.side; },
 * });
 * ```
 *
 * **Arrow measurement only** — `{x, y, centerOffset}` plus the static side. The 45° rotation and the
 * pinning are CSS the themeable component writes. Nothing here writes a style onto any element; the
 * consumer spreads `floatingStyles()` where it wants. Full usage: `create-floating.md`.
 *
 * Client-only: `computePosition`/`autoUpdate` are reached from effect bodies alone, so nothing runs
 * under `renderToStringAsync` and the pre-positioned style is a constant both renders agree on.
 */
export function createFloating(options: CreateFloatingOptions): CreateFloatingReturn {
  const config = createMemo<FloatingConfig>(() => ({
    side: options.side ?? "bottom",
    align: options.align ?? "center",
    strategy: options.strategy ?? "absolute",
    sideOffset: options.sideOffset ?? 0,
    alignOffset: options.alignOffset ?? 0,
    flip: options.flip ?? true,
    shift: options.shift ?? true,
    collisionPadding: options.collisionPadding ?? 0,
    collisionBoundary: options.collisionBoundary ?? "clippingAncestors",
    // Tracked here rather than in an effect of its own: the arrow is conditionally rendered, so a
    // late-arriving ref must re-run the measurement that populates `arrow()`.
    arrowElement: options.arrowElement?.(),
    arrowPadding: options.arrowPadding ?? 0,
    trackSize: options.trackSize ?? false,
    extraMiddleware: options.middleware ?? [],
  }));

  // `untrack`, and not because tracking would merely be redundant: this read seeds a signal, so it
  // must happen exactly once and never re-run. A tracked read in a primitive body emits
  // `[STRICT_READ_UNTRACKED]` labelled with the *caller's* component name, which `mount()` fails on.
  // Seeding placement/strategy from the config rather than from hard-coded defaults is what makes
  // `data-side` correct on the first paint and identical on the server.
  //
  // A logical side is seeded as if `ltr`: there is no element to measure yet, and on the server there
  // is no `getComputedStyle` at all. That costs nothing visible — `isPositioned` is false until the
  // first measurement lands, and `floatingStyles()` is `visibility: hidden` until then — and it keeps
  // the server and the client's first render byte-identical, which is what hydration needs. The first
  // real measurement replaces it with the direction-resolved side, exactly as it already does for a
  // side that `flip` overrides.
  const seed = untrack(config);
  const [position, setPosition] = createSignal<FloatingPosition>({
    x: 0,
    y: 0,
    placement: placementFor(seed, false),
    strategy: seed.strategy,
    middlewareData: {},
    size: undefined,
  });
  const [isPositioned, setIsPositioned] = createSignal(false);

  // `computePosition` is async, so a resolution can land after the attachment it belongs to was torn
  // down, or after the owner was disposed. Every teardown bumps the generation *before* detaching —
  // a detach can't recall a Promise already in flight.
  let generation = 0;
  let disposed = false;
  onCleanup(() => {
    disposed = true;
    generation += 1;
  });

  // Every read here is untracked: `update` is called from `autoUpdate`'s scroll/resize/rAF callbacks,
  // and a tracked read from one of those emits `[STRICT_READ_UNTRACKED]`. The effects below own the
  // reactivity instead.
  const update = () => {
    const anchor = untrack(options.anchor);
    const floating = untrack(options.floating);
    if (anchor == null || floating == null) {
      return;
    }

    const current = untrack(config);
    const token = generation;
    const sink: SizeSink = { value: undefined };

    computePosition(anchor, floating, {
      placement: placementFor(current, isFloatingRtl(floating)),
      strategy: current.strategy,
      middleware: buildMiddleware(current, sink),
    }).then((result) => {
      if (disposed || token !== generation) {
        return;
      }
      setPosition({
        x: result.x,
        y: result.y,
        placement: result.placement,
        strategy: result.strategy,
        middlewareData: result.middlewareData,
        size: sink.value,
      });
      // A layer re-measured while closed-but-mounted — mid-exit-transition — must not report itself
      // positioned, or a reopen would skip straight to visible with stale coordinates.
      setIsPositioned(untrack(options.active));
    });
  };

  // (1) Attach `autoUpdate`. Its setup calls `update()` itself, so this is also the first
  //     measurement. Keyed on the elements, tracked in the compute for the recorded
  //     conditionally-rendered-ref hazard (see `create-focus-trap.ts`). Deliberately NOT keyed on
  //     `active`: a closing overlay stays anchored while its exit transition plays.
  createEffect(
    () =>
      [
        options.anchor(),
        options.floating(),
        options.autoUpdate ?? true,
        options.trackAnchorMotion ?? false,
      ] as const,
    ([anchor, floating, auto, animationFrame]) => {
      if (anchor == null || floating == null) {
        setIsPositioned(false);
        return;
      }
      if (!auto) {
        update();
        return () => {
          generation += 1;
        };
      }
      const detach = autoUpdate(anchor, floating, update, { animationFrame });
      return () => {
        generation += 1;
        detach();
      };
    },
  );

  // (2) Re-measure on a config change, and reset `isPositioned` on close. `active` lives here rather
  //     than in (1) because a fast close→open through `createPresence` changes no element, so nothing
  //     else would flip `isPositioned` back to true.
  //
  //     THE CREATION ORDER OF THESE TWO EFFECTS IS LOAD-BEARING. Solid 2.0 runs sibling effects in
  //     creation order (pinned in `solid-contract.test.ts`), so effect (1) has already issued the
  //     first measurement by the time this one runs — hence the latch, the same idiom as
  //     `create-presence.ts`. Swapping the two silently duplicates `computePosition` on every mount.
  let firstConfigRun = true;
  createEffect(
    () => [config(), options.active()] as const,
    ([, active]) => {
      const isInitialRun = firstConfigRun;
      firstConfigRun = false;

      if (!active) {
        setIsPositioned(false);
        return;
      }
      if (isInitialRun) {
        return;
      }
      update();
    },
  );

  const resolved = createMemo(() => {
    const [side, alignment] = position().placement.split("-") as [Side, Alignment | undefined];
    return { side, align: alignment ?? ("center" as const) };
  });
  const side = createMemo(() => resolved().side);

  return {
    floatingStyles: createMemo<JSX.CSSProperties>(() => {
      const current = position();
      const floating = options.floating();

      // `visibility`, not `display: none` — which would deadlock, since an element with no box can
      // never be measured — and not `opacity: 0`, which stays hit-testable. This branch is also the
      // one the server renders, so it must hold no client-only input.
      if (floating == null || !isPositioned()) {
        return { position: current.strategy, left: "0", top: "0", visibility: "hidden" };
      }

      const x = roundByDevicePixelRatio(floating, current.x);
      const y = roundByDevicePixelRatio(floating, current.y);

      if (options.transform ?? true) {
        const styles: JSX.CSSProperties = {
          position: current.strategy,
          left: "0",
          top: "0",
          transform: `translate(${x}px, ${y}px)`,
        };
        if (getDevicePixelRatio(floating) >= 1.5) {
          styles["will-change"] = "transform";
        }
        return styles;
      }

      return { position: current.strategy, left: `${x}px`, top: `${y}px` };
    }),
    placement: createMemo(() => position().placement),
    side,
    align: createMemo(() => resolved().align),
    isPositioned,
    x: createMemo(() => position().x),
    y: createMemo(() => position().y),
    strategy: createMemo(() => position().strategy),
    arrow: createMemo<FloatingArrowState | undefined>(() => {
      const data = position().middlewareData.arrow;
      if (data == null) {
        return undefined;
      }
      return {
        x: data.x,
        y: data.y,
        centerOffset: data.centerOffset,
        side: OPPOSITE_SIDE[side()],
      };
    }),
    size: createMemo(() => position().size),
    middlewareData: createMemo(() => position().middlewareData),
    update,
  };
}
