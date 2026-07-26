import type { JSX } from "@solidjs/web";
import { merge } from "solid-js";
import type { FloatingAlign, FloatingArrowState, Side } from "../internal";
import type { CreatePopoverReturn } from "./popover-root";

/**
 * Half the arrow's own size, pulled back so the square straddles the popup's edge. A **CSS string**,
 * never a measured number: the size stays owned by the recipe (the `arrow` slot sets the custom
 * property; `8px` is the fallback for a headless consumer who sets nothing), and the primitive stays
 * out of the CSSOM. Reading the size back would cost an effect, a resize observer and a re-render,
 * to arrive at the number CSS already has.
 *
 * **Unprefixed on purpose.** `--hope-*` is the theming package's *semantic token* vocabulary, authored
 * by a preset in `theme.css`; this is a component-local geometry channel between a recipe and this
 * hook, the same role calendar's `--cell-size` plays. The distinction is enforced, not stylistic:
 * `check:recipe-purity` rejects any bracketed arbitrary value naming `--hope-`, so a `--hope-`-named
 * property here would be one no preset recipe could ever set.
 *
 * The other half of the agreement is the `arrow` slot, which sets this property *and* sizes its box
 * from it (`packages/presets/src/hope/recipes/popover.ts`, pinned by that recipe's test). Renaming it
 * here means renaming it there.
 */
const PIN_OFFSET = "calc(var(--popover-arrow-size, 8px) / -2)";

const px = (value: number | undefined) => (value == null ? undefined : `${value}px`);

export interface CreatePopoverArrowReturn {
  /** Spread onto the arrow element. `style` carries the measured offsets and the pin, with the
   * consumer's own object merged over it; the three `data-*` are owned here. */
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    "data-side": Side;
    "data-align": FloatingAlign;
    "data-uncentered": string | undefined;
  };
  /** Hand to the arrow element's `ref`. Registering it is what enables floating-ui's `arrow`
   * middleware, and so what populates the measurements this hook reads. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The arrow part: the little square that points at the anchor. Carries the *measurements* —
 * `createFloating` writes no styles — while the 45° rotation, the size and the background are the
 * `arrow` slot's, and how a clamped arrow disappears is the recipe's call via `data-uncentered`.
 *
 * ## Render the element unconditionally
 *
 * **Never gate it on `state.floating.arrow()`.** No element means no `arrowElement` in
 * `createFloating`'s config, which means no `arrow` middleware, which means `arrow()` stays
 * `undefined` forever — the same deadlock as gating the floating element on `isPositioned()`. A late
 * ref is fine: `createFloating` tracks `arrowElement` in its config memo, so the measurement re-runs
 * when the element shows up.
 *
 * ## `data-side` is the popup's side, not the pin edge
 *
 * Identical to the Positioner's and the Content's, so one variant styles the card and its arrow
 * coherently — Base UI's semantics for `PopoverArrowDataAttributes.side` ("which side the popup is
 * positioned relative to the trigger"). The pin edge is the *opposite* of it, and it lives only in
 * the inline style, off `arrow().side`.
 *
 * ## `data-uncentered` starts present
 *
 * It is absent only once a measurement has resolved `centerOffset` to exactly `0`. Deliberate: an
 * unmeasured arrow reads as clamped, so a recipe hiding it starts hidden rather than flashing in a
 * centred position it will not keep.
 */
export function createPopoverArrow(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreatePopoverArrowReturn {
  const elementProps = merge(props, {
    // Kernel first, consumer last, the same order and for the same reason as the Positioner's: a
    // consumer's `z-index`, or the `--popover-arrow-size` the pin above reads, must survive.
    // A string `style` has no merge seam, so it is dropped in favour of the pin — see
    // `popover-arrow.md`.
    get style(): JSX.CSSProperties {
      const kernel = pinnedStyle(state.floating.arrow());
      const consumer = props.style;
      return typeof consumer === "string" ? kernel : { ...kernel, ...consumer };
    },
    get "data-side"() {
      return state.floating.side();
    },
    get "data-align"() {
      return state.floating.align();
    },
    get "data-uncentered"() {
      return state.floating.arrow()?.centerOffset === 0 ? undefined : "";
    },
  });

  return {
    props: elementProps,
    setRef: (element) => state.setArrowElement(element),
  };
}

/**
 * `x` and `y` are mutually exclusive — floating-ui fills in only the axis the placement varies along
 * — so the unused one resolves to `undefined` and the attribute is simply absent.
 */
function pinnedStyle(arrow: FloatingArrowState | undefined): JSX.CSSProperties {
  const style: JSX.CSSProperties = {
    position: "absolute",
    left: px(arrow?.x),
    top: px(arrow?.y),
  };
  // Assigned rather than spelled as a literal key: the pin edge is runtime state, and it must land
  // *after* the two above, so that the axis floating-ui left empty is the one the pin claims.
  style[arrow?.side ?? "top"] = PIN_OFFSET;
  return style;
}
