import type { JSX } from "@solidjs/web";
import { type Accessor, createEffect, merge } from "solid-js";
import type { FloatingAlign, PresenceStatus, Side } from "../internal";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverPositionerReturn {
  /** Spread onto the positioner element. `style` carries the kernel's positioning, with the
   * consumer's own object merged over it; `data-side`/`data-align`/`data-presence` are owned here. */
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

  const elementProps = merge(props, {
    // Kernel first, consumer last — deliberately, and it is the documented escape valve for
    // `create-floating.md`'s consumer anti-pattern #4: a consumer who needs different
    // pre-positioned behavior (their own `visibility`, a `z-index`, a `pointer-events`) spreads it
    // *after* and wins, without the positioner slot growing a `position`/`left`/`top` of its own.
    get style(): JSX.CSSProperties {
      const kernel = state.floating.floatingStyles();
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
