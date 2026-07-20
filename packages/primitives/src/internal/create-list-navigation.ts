import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";
import { createKeyboardHandler } from "../utils/keymap";
import type { CreateListFocusReturn } from "./create-list-focus";

export type Orientation = "vertical" | "horizontal";
export type TextDirection = "ltr" | "rtl";

export interface CreateListNavigationOptions<V = unknown> {
  /** The shared focus instance this navigation drives. */
  focus: CreateListFocusReturn<V>;
  /** Arrow-key axis. `"vertical"` (default) maps Up/Down; `"horizontal"` maps Left/Right. Reactive. */
  orientation?: Accessor<Orientation>;
  /** Whether moving past the last item wraps to the first (and vice versa). Default `false`. Reactive. */
  wrap?: Accessor<boolean>;
  /** Text direction. In `"rtl"` a horizontal list swaps Left/Right. Default `"ltr"`. Reactive. */
  textDirection?: Accessor<TextDirection>;
}

export interface CreateListNavigationReturn {
  /** Move to the next focusable item (or the first, if none is active). */
  next(): void;
  /** Move to the previous focusable item (or the last, if none is active). */
  prev(): void;
  /** Move to the first focusable item. */
  first(): void;
  /** Move to the last focusable item. */
  last(): void;
  /** The index `next()` would move to, without moving. `-1` if there is nowhere to go. */
  peekNext(): number;
  /** The index `prev()` would move to, without moving. `-1` if there is nowhere to go. */
  peekPrev(): number;
  /**
   * An orientation- and direction-aware `onKeyDown` handler for the container: Arrow keys along the
   * current `orientation` (Left/Right flipped under RTL), plus Home/End. It calls `preventDefault`
   * only on keys it actually acts on, so an off-axis arrow still scrolls. Compose it in front of /
   * behind other handlers with `composeEventHandlers`.
   */
  onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent>;
}

/**
 * Arrow-key navigation over the shared focus instance — `next`/`prev`/`first`/`last`, wrap,
 * orientation, RTL, and skip-disabled. It holds no state of its own; it reads `focus.items()` and
 * `focus.activeIndex()`, skips items `focus.isFocusable` rejects, and moves the active item via
 * `focus.focusIndex`. Because focus defers real `.focus()` until the element exists, navigating past
 * a virtualized window's edge "just works" — the target scrolls in, then focuses.
 *
 * Modeled on Angular Aria's `list-navigation` (its reasoning and public surface, adapted, not its
 * code); the edge-case checklist (skip-disabled, wrap, RTL) is cross-checked against react-aria's
 * `ListKeyboardDelegate` and floating-ui-react's `useListNavigation`.
 */
export function createListNavigation<V = unknown>(
  options: CreateListNavigationOptions<V>,
): CreateListNavigationReturn {
  const { focus } = options;
  const orientation = () => options.orientation?.() ?? "vertical";
  const wrap = () => options.wrap?.() ?? false;
  const isRtl = () => (options.textDirection?.() ?? "ltr") === "rtl";

  const firstFocusable = (): number => {
    const items = focus.items();
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (item && focus.isFocusable(item)) {
        return index;
      }
    }
    return -1;
  };
  const lastFocusable = (): number => {
    const items = focus.items();
    for (let index = items.length - 1; index >= 0; index--) {
      const item = items[index];
      if (item && focus.isFocusable(item)) {
        return index;
      }
    }
    return -1;
  };

  // The next focusable index from `current` in `direction`, honoring wrap. Scans at most one full
  // pass, so a list with no focusable item terminates. Returns `-1` when there is nowhere to move.
  const step = (direction: 1 | -1): number => {
    const items = focus.items();
    const length = items.length;
    if (length === 0) {
      return -1;
    }

    const current = focus.activeIndex();
    if (current < 0) {
      return direction > 0 ? firstFocusable() : lastFocusable();
    }

    let index = current;
    for (let taken = 0; taken < length; taken++) {
      index += direction;
      if (index < 0 || index >= length) {
        if (!wrap()) {
          return -1;
        }
        index = (index + length) % length;
      }
      if (index === current) {
        return -1; // wrapped all the way back — no other focusable item
      }
      const item = items[index];
      if (item && focus.isFocusable(item)) {
        return index;
      }
    }
    return -1;
  };

  const peekNext = () => step(1);
  const peekPrev = () => step(-1);

  const goto = (index: number) => {
    if (index >= 0) {
      focus.focusIndex(index);
    }
  };

  const next = () => goto(peekNext());
  const prev = () => goto(peekPrev());
  const first = () => goto(firstFocusable());
  const last = () => goto(lastFocusable());

  const keys = createKeyboardHandler<HTMLElement>()
    .on("ArrowDown", (event) => {
      if (orientation() !== "vertical") {
        return;
      }
      event.preventDefault();
      next();
    })
    .on("ArrowUp", (event) => {
      if (orientation() !== "vertical") {
        return;
      }
      event.preventDefault();
      prev();
    })
    .on("ArrowRight", (event) => {
      if (orientation() !== "horizontal") {
        return;
      }
      event.preventDefault();
      isRtl() ? prev() : next();
    })
    .on("ArrowLeft", (event) => {
      if (orientation() !== "horizontal") {
        return;
      }
      event.preventDefault();
      isRtl() ? next() : prev();
    })
    .on("Home", (event) => {
      event.preventDefault();
      first();
    })
    .on("End", (event) => {
      event.preventDefault();
      last();
    });

  return {
    next,
    prev,
    first,
    last,
    peekNext,
    peekPrev,
    onKeyDown: keys.onKeyDown,
  };
}
