import { type Accessor, createEffect } from "solid-js";

/**
 * The lock's ref count and the pre-lock style snapshot live on `document.body`, under a
 * cross-realm shared symbol — **not** at module scope.
 *
 * `@hope-ui/primitives` is public API, and `@hope-ui/components` depends on it as a
 * plain `dependencies` entry, which does not force a single installed instance. With two
 * copies in the tree there would be two module-scope `lockCount`s: two overlays open at
 * once, and the body's `overflow` is either restored while one is still open, or never
 * restored at all. `Symbol.for` resolves through the cross-realm global symbol registry, so
 * every copy of this module reads and writes the same slot. Base UI stores its lock state on
 * the element for the same reason. `createHideOutside` does the same with its own count.
 */
const LOCK_STATE = Symbol.for("hope-ui.scroll-lock");

interface ScrollLockState {
  /** How many active locks currently want the body unscrollable. */
  count: number;
  /** The body's own `overflow` before the first lock took hold. */
  overflow: string;
  /** The body's own `padding-right` before the first lock took hold. */
  paddingRight: string;
}

type ScrollLockHost = HTMLElement & { [LOCK_STATE]?: ScrollLockState };

function getState(body: ScrollLockHost): ScrollLockState {
  const existing = body[LOCK_STATE];
  if (existing !== undefined) {
    return existing;
  }

  const created: ScrollLockState = { count: 0, overflow: "", paddingRight: "" };
  body[LOCK_STATE] = created;
  return created;
}

function lockScroll(): void {
  const body = document.body as ScrollLockHost;
  const state = getState(body);

  if (state.count === 0) {
    state.overflow = body.style.overflow;
    state.paddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPaddingRight = Number.parseFloat(
        window.getComputedStyle(body).paddingRight || "0",
      );
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
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
  body.style.paddingRight = state.paddingRight;
  delete body[LOCK_STATE];
}

export interface CreateScrollLockOptions {
  /** Whether the scroll lock is currently active. */
  active: Accessor<boolean>;
}

/**
 * Locks `document.body` scrolling while active, compensating for scrollbar-width layout
 * shift with a matching `padding-right`. Ref-counted on `document.body` so multiple
 * simultaneously active locks (e.g. two overlays open at once) don't restore the body's
 * styles until the last one deactivates — including locks created by a *different installed
 * copy* of this package. See the note on `LOCK_STATE` above.
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
