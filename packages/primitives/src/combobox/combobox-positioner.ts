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
 * The positioner part: the wrapper the popup is measured and moved as, and the element that reports
 * the shared presence (the mount/enter/exit lifecycle) as `data-presence`. `Content` — the styled
 * card with the chrome and the enter/exit transition — is its child, so the transition's
 * `translate`/`scale` never fight the `translate()` this element carries.
 *
 * A modal popup **must** be positioned or it paints beneath whatever is dimming the page (see
 * `__internal__/primitives/modal-backdrop/modal-backdrop.md`). `data-side`/`data-align` report the
 * placement actually chosen, which only the measurement knows.
 *
 * It *reflects* the presence the root created rather than creating one: `mounted` and
 * `data-presence` come from `state.contentPresence`, the same object `createComboboxContent` reads.
 */
export function createComboboxPositioner<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreateComboboxPositionerReturn {
  warnOnStringStyle(props);

  // A Select opened *inside* a modal Dialog is a direct `<body>` child the Dialog's hide-outside
  // observer watches appear — and it would hide it, leaving a popup that paints on top, undimmed and
  // legible, yet `inert`: out of the accessibility tree and transparent to clicks. Registering the
  // positioner into the enclosing layer's exempt set covers its whole subtree. Keyed on `mounted()`,
  // not `open()`, so it stays exempt through the exit transition.
  createKeepVisible({ active: state.contentPresence.mounted, ref: state.positionerElement });

  const elementProps = merge(props, {
    // Ours first, consumer last — deliberately: a consumer who needs different pre-positioned
    // behavior (their own `visibility`, a `z-index`) spreads it *after* and wins, without this part
    // growing a `position`/`left`/`top` option of its own.
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
 * The measured geometry, published as CSS custom properties. `--anchor-width` is how the popup
 * matches the trigger's width, and `--available-height` is what caps the list so it scrolls instead
 * of running off the viewport.
 *
 * **Unprefixed, and identical to Popover's** — the names describe the anchor, not the component, and
 * are shared vocabulary any future Select or Menu positioner publishes the same way. Duplicated
 * rather than imported: the four names are the contract, not the four lines.
 *
 * **Nothing is emitted before the first measurement**, rather than a `0px` placeholder. A real `0px`
 * would collapse whatever reads it, whereas an absent property leaves `width: var(--anchor-width)`
 * invalid — so the browser drops that one declaration and the element keeps its natural size. It
 * also keeps the server render and the first client render identical, which hydration requires.
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
 * A string `style` cannot be spread into our style object, and our positioning has to win or the
 * popup paints at 0,0 — so the consumer's is dropped. Dropping it *silently* is how someone spends
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
        "[hope-ui] createComboboxPositioner: a string `style` on the positioner is not supported " +
          "and was dropped — the kernel's positioning styles have to be merged into. Pass an " +
          `object instead: style={{ "z-index": 50 }}. Got: ${JSON.stringify(style)}`,
      );
    },
  );
}
