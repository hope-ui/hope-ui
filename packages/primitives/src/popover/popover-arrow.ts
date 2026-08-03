import type { JSX } from "@solidjs/web";
import { merge } from "solid-js";
import type { FloatingAlign, FloatingArrowState, Side } from "../internal";
import type { CreatePopoverReturn } from "./popover-root";

/**
 * Half the arrow's own size, pulled back so the square straddles the popup's edge. A **CSS string**,
 * never a measured number: the size stays owned by the stylesheet, which sets
 * `--popover-arrow-size` (`8px` is the fallback for a headless consumer who sets nothing). Measuring
 * it back would cost an effect, a resize observer and a re-render to arrive at a number CSS already
 * has.
 *
 * **Unprefixed on purpose.** `--hope-*` is the theming package's *semantic token* vocabulary, and
 * `check:recipe-purity` forbids a recipe from naming one in an arbitrary value — so a `--hope-`
 * name here would be a property no preset recipe could ever set. This is a component-local channel
 * between the stylesheet and this hook, like calendar's `--cell-size`.
 *
 * The other half of the agreement is the `arrow` style rule, which sets this property *and* sizes
 * its box from it (`packages/presets/src/hope/recipes/popover.ts`, pinned by that recipe's test).
 * Renaming it here means renaming it there.
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
  /** Hand to the arrow element's `ref`. Registering it is what makes the arrow get measured at all,
   * and so what populates the offsets this hook reads. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The arrow part: the little square that points at the anchor. It carries only the *measurements* —
 * the 45° rotation, the size and the background belong to the stylesheet, as does what a clamped
 * arrow does about it, via `data-uncentered`.
 *
 * **Render the element unconditionally — never gate it on `state.floating.arrow()`.** That is a
 * deadlock: no element means no arrow measurement is requested, which means `arrow()` stays
 * `undefined` forever. A late ref is fine, because the element is tracked reactively and the
 * measurement re-runs once it shows up.
 *
 * **`data-side` is the popup's side, not the pin edge.** It is identical to the Positioner's and the
 * Content's, so one style rule can dress the card and its arrow coherently. The pin edge is the
 * *opposite* of it and lives only in the inline style.
 *
 * **`data-uncentered` starts present**, and goes absent only once a measurement resolves the offset
 * to exactly `0`. Deliberate: an unmeasured arrow reads as clamped, so a rule hiding it starts
 * hidden rather than flashing in a centred position it will not keep.
 */
export function createPopoverArrow(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreatePopoverArrowReturn {
  const elementProps = merge(props, {
    // Ours first, consumer last, the same order and reason as the Positioner's: a consumer's
    // `z-index`, or the `--popover-arrow-size` the pin above reads, has to survive. A string `style`
    // cannot be merged into, so it is dropped in favour of the pin.
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
 * `x` and `y` are mutually exclusive: only the axis the placement varies along is measured, so the
 * other resolves to `undefined` and its declaration is simply absent.
 */
function pinnedStyle(arrow: FloatingArrowState | undefined): JSX.CSSProperties {
  const style: JSX.CSSProperties = {
    position: "absolute",
    left: px(arrow?.x),
    top: px(arrow?.y),
  };
  // Assigned rather than written as a literal key: the pin edge is runtime state, and it has to land
  // *after* the two above so it claims the axis the measurement left empty.
  style[arrow?.side ?? "top"] = PIN_OFFSET;
  return style;
}
