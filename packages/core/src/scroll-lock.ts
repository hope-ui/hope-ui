import { type Accessor, createEffect } from "solid-js";

// Module-level ref count so concurrent locks (e.g. two overlays open at once) compose
// correctly: the body is only restored once every lock has released, and the very first
// lock is the only one that needs to snapshot the pre-lock style values.
let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

function lockScroll(): void {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPaddingRight = Number.parseFloat(
        window.getComputedStyle(document.body).paddingRight || "0",
      );
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }
  }
  lockCount++;
}

function unlockScroll(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
  }
}

export interface CreateScrollLockOptions {
  /** Whether the scroll lock is currently active. */
  active: Accessor<boolean>;
}

/**
 * Locks `document.body` scrolling while active, compensating for scrollbar-width layout
 * shift with a matching `padding-right`. Ref-counted at module scope so multiple
 * simultaneously active locks (e.g. two overlays open at once) don't restore the body's
 * styles until the last one deactivates.
 */
export function createScrollLock(options: CreateScrollLockOptions): void {
  createEffect(
    () => options.active(),
    (active) => {
      if (!active) return;
      lockScroll();
      return () => unlockScroll();
    },
  );
}
