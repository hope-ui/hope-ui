import type { JSX } from "@solidjs/web";
import { type Accessor, createEffect, merge } from "solid-js";
import { createKeepVisible, type FloatingAlign, type PresenceStatus, type Side } from "../internal";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverPositionerReturn {
  /** Spread onto the positioner element. `style` carries the kernel's positioning and the measured
   * `--anchor-width`/`--anchor-height`/`--available-width`/`--available-height`, with the consumer's
   * own object merged over it; `data-side`/`data-align`/`data-presence` are owned here. */
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    "data-side": Side;
    "data-align": FloatingAlign;
    "data-presence": PresenceStatus;
  };
  /** Gate the positioner's render on this — the **shared** presence keeps it mounted through the
   * content's exit transition. */
  mounted: Accessor<boolean>;
  /** Hand to the positioner element's `ref`; registers it as what `createFloating` measures and
   * positions. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The positioner part: the kernel-styled wrapper the floating layer is measured and moved as.
 * `Popover.Content` — the recipe card with the chrome and the enter/exit transition — is its child,
 * so the transition's `translate`/`scale` never fight the `translate()` this element carries.
 *
 * **Unlike Dialog's positioner, this one is not kernel-free.** A Dialog is absolutely positioned by
 * a recipe; a Popover is *measured*, so its position is runtime state only `createFloating` knows.
 * That is what `style`, `data-side` and `data-align` carry.
 *
 * Reflects the shared presence rather than creating one: `mounted` and `data-presence` come straight
 * from `state.contentPresence`, the same one `createPopoverContent` reflects. See `popover-root.md`.
 */
export function createPopoverPositioner(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreatePopoverPositionerReturn {
  warnOnStringStyle(props);

  // The positioner is the direct `<body>` child a modal ancestor's `createHideOutside` observer
  // sees appear, and it would hide it — leaving a card that paints on top, undimmed and legible,
  // yet `inert`: out of the accessibility tree and transparent to hit testing. Sparing the
  // positioner spares its whole subtree, `isSpared` testing containment both ways.
  //
  // Keyed on `mounted()`, not `open()`, so the layer stays spared through its exit transition —
  // the same reason `createFloating` is. A popover with no modal above it registers into an empty
  // stack and `keepVisible` no-ops.
  createKeepVisible({ active: state.contentPresence.mounted, ref: state.positionerElement });

  const elementProps = merge(props, {
    // Kernel first, consumer last — deliberately, and it is the documented escape valve for
    // `create-floating.md`'s consumer anti-pattern #4: a consumer who needs different
    // pre-positioned behavior (their own `visibility`, a `z-index`, a `pointer-events`) spreads it
    // *after* and wins, without the positioner slot growing a `position`/`left`/`top` of its own.
    get style(): JSX.CSSProperties {
      const kernel = { ...state.floating.floatingStyles(), ...anchorSizeProperties(state) };
      const consumer = props.style;
      return typeof consumer === "string" ? kernel : { ...kernel, ...consumer };
    },
    get "data-side"() {
      return state.floating.side();
    },
    get "data-align"() {
      return state.floating.align();
    },
    get "data-presence"() {
      return state.contentPresence.status();
    },
  });

  return {
    props: elementProps,
    mounted: state.contentPresence.mounted,
    setRef: (element) => state.setPositionerElement(element),
  };
}

/**
 * The measured geometry, published as custom properties so CSS can spend it — a recipe's
 * `w-(--anchor-width)`, or a consumer's `max-h-(--available-height)` on a card that scrolls. The
 * kernel deliberately writes none of this onto the element itself (that is what keeps `size` out of
 * its ResizeObserver feedback loop), so handing the numbers to CSS is the consumer's job, and this
 * is where Popover does it.
 *
 * **Unprefixed on purpose.** These name the anchor, not the popover: `--anchor-width` is kernel
 * vocabulary a future Select or Menu positioner publishes identically. `--hope-*` is the theming
 * package's *semantic token* namespace and is not what this is — the same distinction
 * `--popover-arrow-size` draws, which is component-local and therefore component-named.
 *
 * **Nothing is emitted before the first measurement**, rather than a `0px` placeholder. A real `0px`
 * would collapse whatever reads it; an absent property leaves `width: var(--anchor-width)` invalid,
 * so the browser drops that one declaration and the element keeps its natural size. It also keeps
 * the server render and the first client render identical, which is what hydration needs — `size()`
 * is `undefined` in both.
 */
function anchorSizeProperties(state: CreatePopoverReturn): JSX.CSSProperties {
  const size = state.floating.size();
  if (size === undefined) {
    return {};
  }
  return {
    "--anchor-width": `${size.anchorWidth}px`,
    "--anchor-height": `${size.anchorHeight}px`,
    "--available-width": `${size.availableWidth}px`,
    "--available-height": `${size.availableHeight}px`,
  };
}

/**
 * A string `style` has no merge seam — it cannot be spread into the kernel's object — and the
 * kernel's positioning has to win, or the layer paints at 0,0. So the consumer's is dropped, and
 * dropping it silently is how a consumer spends an afternoon on a style that never applied. Dev-only
 * and effect-gated, the shape `createButton`'s element/`nativeButton` mismatch warning uses.
 */
function warnOnStringStyle(props: JSX.HTMLAttributes<HTMLDivElement>): void {
  createEffect(
    () => props.style,
    (style) => {
      const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
      if (!isDev || typeof style !== "string") {
        return;
      }
      console.warn(
        "[hope-ui] createPopoverPositioner: a string `style` on the positioner is not supported and " +
          "was dropped — the kernel's positioning styles have to be merged into. Pass an object " +
          `instead: style={{ "z-index": 50 }}. Got: ${JSON.stringify(style)}`,
      );
    },
  );
}
