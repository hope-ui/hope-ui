import { type Accessor, createEffect } from "solid-js";

/**
 * The lock's ref count and the pre-lock style snapshot live on `document.body`, keyed by a symbol
 * from the global registry — **not** at module scope.
 *
 * Nothing forces a consumer to end up with a single installed copy of this package, and two
 * module-scope counts each believing they own the body is an unreproducible field bug: with two
 * overlays open, the body's `overflow` is restored while one is still open, or never restored at
 * all. `Symbol.for` returns the same symbol in every copy, so they all share one slot.
 */
const LOCK_STATE = Symbol.for("hope-ui.scroll-lock");

interface ScrollLockState {
  /** How many active locks currently want the body unscrollable. */
  count: number;
  /** The body's own `overflow` before the first lock took hold. */
  overflow: string;
  /**
   * The body's own `padding-inline-end` before the first lock took hold.
   *
   * Logical, not `padding-right`: in a right-to-left layout the browser puts the scrollbar on the
   * **left**, so padding the right would move the page by exactly the width this exists to absorb —
   * doubling the layout shift rather than cancelling it.
   */
  paddingInlineEnd: string;
}

type ScrollLockHost = HTMLElement & { [LOCK_STATE]?: ScrollLockState };

function getState(body: ScrollLockHost): ScrollLockState {
  const existing = body[LOCK_STATE];
  if (existing !== undefined) {
    return existing;
  }

  const created: ScrollLockState = { count: 0, overflow: "", paddingInlineEnd: "" };
  body[LOCK_STATE] = created;
  return created;
}

function lockScroll(): void {
  const body = document.body as ScrollLockHost;
  const state = getState(body);

  if (state.count === 0) {
    state.overflow = body.style.overflow;
    state.paddingInlineEnd = body.style.paddingInlineEnd;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPaddingInlineEnd = Number.parseFloat(
        window.getComputedStyle(body).paddingInlineEnd || "0",
      );
      body.style.paddingInlineEnd = `${currentPaddingInlineEnd + scrollbarWidth}px`;
    }
  }

  state.count++;
}

function unlockScroll(): void {
  const body = document.body as ScrollLockHost;
  const state = getState(body);

  state.count = Math.max(0, state.count - 1);
  if (state.count > 0) {
    return;
  }

  body.style.overflow = state.overflow;
  body.style.paddingInlineEnd = state.paddingInlineEnd;
  delete body[LOCK_STATE];
}

export interface CreateScrollLockOptions {
  /** Whether the scroll lock is currently active. */
  active: Accessor<boolean>;
}

/**
 * Locks `document.body` scrolling while active, padding the body by the width of the scrollbar it
 * removes so the page does not jump. Ref-counted on `document.body`, so two overlays open at once
 * do not restore the body's styles until the last of them deactivates — even when they come from
 * different installed copies of this package. See `LOCK_STATE` above.
 */
export function createScrollLock(options: CreateScrollLockOptions): void {
  createEffect(
    () => options.active(),
    (active) => {
      if (!active) {
        return;
      }
      lockScroll();
      return () => unlockScroll();
    },
  );
}
