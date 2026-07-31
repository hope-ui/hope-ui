import type { JSX } from "@solidjs/web";
import { type Accessor, createEffect, merge } from "solid-js";
import {
  type CreateFloatingReturn,
  createKeepVisible,
  type FloatingAlign,
  type PresenceStatus,
  type SelectionMode,
  type Side,
} from "../internal";
import type { CreateComboboxReturn } from "./combobox-root";

export interface CreateComboboxPositionerReturn {
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
 * The positioner part: the kernel-styled wrapper the popup is measured and moved as. `Content` — the
 * recipe card with the chrome and the enter/exit transition — is its child, so the transition's
 * `translate`/`scale` never fight the `translate()` this element carries.
 *
 * A modal popup **must** be positioned or it paints beneath whatever is dimming the page; see
 * `modal-backdrop.md`. Here that is the floating layer's job, and `data-side`/`data-align` are the
 * runtime placement only `createFloating` knows.
 *
 * Reflects the shared presence rather than creating one: `mounted` and `data-presence` come straight
 * from `state.contentPresence`, the same one `createComboboxContent` reflects.
 */
export function createComboboxPositioner<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreateComboboxPositionerReturn {
  warnOnStringStyle(props);

  // A Select opened *inside* a modal Dialog is a direct `<body>` child the Dialog's hide-outside
  // observer sees appear, and it would hide it — leaving a popup that paints on top, undimmed and
  // legible, yet `inert`: out of the accessibility tree and transparent to hit testing. Sparing the
  // positioner spares its whole subtree. Keyed on `mounted()`, not `open()`, so the layer stays
  // spared through its exit transition.
  createKeepVisible({ active: state.contentPresence.mounted, ref: state.positionerElement });

  const elementProps = merge(props, {
    // Kernel first, consumer last — deliberately: a consumer who needs different pre-positioned
    // behavior (their own `visibility`, a `z-index`) spreads it *after* and wins, without the
    // positioner slot growing a `position`/`left`/`top` of its own.
    get style(): JSX.CSSProperties {
      const kernel = {
        ...state.floating.floatingStyles(),
        ...anchorSizeProperties(state.floating),
      };
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
 * The measured geometry, published as custom properties so CSS can spend it. For a combobox this is
 * not a nicety: `--anchor-width` is how the popup matches the trigger's width (the one thing every
 * Select design does), and `--available-height` is what caps the list so it scrolls instead of
 * running off the viewport.
 *
 * **Unprefixed on purpose, and identical to Popover's** — these name the anchor, not the component,
 * and `popover-positioner.md` already called them "kernel vocabulary a future Select or Menu
 * positioner publishes identically". Copied rather than imported: two top-level primitive folders
 * do not reach into each other, and the four names are the contract, not the four lines.
 *
 * **Nothing is emitted before the first measurement**, rather than a `0px` placeholder. A real `0px`
 * would collapse whatever reads it; an absent property leaves `width: var(--anchor-width)` invalid,
 * so the browser drops that one declaration and the element keeps its natural size. It also keeps
 * the server render and the first client render identical, which is what hydration needs.
 */
function anchorSizeProperties(floating: CreateFloatingReturn): JSX.CSSProperties {
  const size = floating.size();
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
 * kernel's positioning has to win, or the popup paints at 0,0. So the consumer's is dropped, and
 * dropping it silently is how a consumer spends an afternoon on a style that never applied.
 * Dev-only and effect-gated.
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
        "[hope-ui] createComboboxPositioner: a string `style` on the positioner is not supported " +
          "and was dropped — the kernel's positioning styles have to be merged into. Pass an " +
          `object instead: style={{ "z-index": 50 }}. Got: ${JSON.stringify(style)}`,
      );
    },
  );
}
