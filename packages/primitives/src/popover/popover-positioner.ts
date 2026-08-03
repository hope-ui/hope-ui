import type { JSX } from "@solidjs/web";
import { type Accessor, createEffect, merge } from "solid-js";
import { createKeepVisible, type FloatingAlign, type PresenceStatus, type Side } from "../internal";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverPositionerReturn {
  /** Spread onto the positioner element. `style` carries the computed position and the measured
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
 * The positioner part: the wrapper the floating layer is measured and moved as. `Popover.Content` —
 * the styled card with the chrome and the enter/exit transition — is its child, so the transition's
 * `translate`/`scale` never fight the `translate()` this element carries.
 *
 * **Unlike Dialog's positioner, this one carries styles.** A Dialog is absolutely positioned by a
 * style rule; a Popover is *measured*, so its position, `data-side` and `data-align` are runtime
 * state nothing but the measurement knows.
 *
 * It *reflects* the presence the root created rather than creating one: `mounted` and
 * `data-presence` come from `state.contentPresence`, the same object `createPopoverContent` reads.
 */
export function createPopoverPositioner(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreatePopoverPositionerReturn {
  warnOnStringStyle(props);

  // The positioner is the direct `<body>` child a modal ancestor's hide-outside observer watches
  // appear — and it would hide it, leaving a card that paints on top, undimmed and legible, yet
  // `inert`: out of the accessibility tree and transparent to clicks. Registering the positioner
  // into the enclosing layer's exempt set covers its whole subtree.
  //
  // Keyed on `mounted()`, not `open()`, so it stays exempt through the exit transition. A popover
  // with no modal above it registers into an empty stack and this no-ops.
  createKeepVisible({ active: state.contentPresence.mounted, ref: state.positionerElement });

  const elementProps = merge(props, {
    // Ours first, consumer last — deliberately: a consumer who needs different pre-positioned
    // behavior (their own `visibility`, a `z-index`, a `pointer-events`) spreads it *after* and
    // wins, without this part growing a `position`/`left`/`top` option of its own.
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
 * The measured geometry, published as CSS custom properties — for a `w-(--anchor-width)`, or a
 * `max-h-(--available-height)` on a card that scrolls. `createFloating` deliberately writes none of
 * it back onto the element, which is what keeps its ResizeObserver out of a feedback loop, so
 * handing the numbers to CSS is a job for this layer.
 *
 * **Unprefixed on purpose.** The names describe the anchor, not the popover, and any future Select
 * or Menu positioner publishes the same four. That is the opposite of `--popover-arrow-size`, which
 * is component-local and therefore component-named.
 *
 * **Nothing is emitted before the first measurement**, rather than a `0px` placeholder. A real `0px`
 * would collapse whatever reads it, whereas an absent property leaves `width: var(--anchor-width)`
 * invalid — so the browser drops that one declaration and the element keeps its natural size. It
 * also keeps the server render and the first client render identical, which hydration requires.
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
 * A string `style` cannot be spread into our style object, and our positioning has to win or the
 * layer paints at 0,0 — so the consumer's is dropped. Dropping it *silently* is how someone spends
 * an afternoon on a style that never applied. Dev-only, and inside an effect so it never runs on the
 * server.
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
