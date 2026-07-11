import { type Accessor, createEffect } from "solid-js";

export interface CreateFocusRestoreOptions {
  /** Whether the layer that borrowed focus is currently active. */
  active: Accessor<boolean>;
}

/**
 * Remembers what was focused when `active` turns true, and focuses it again when `active`
 * turns false. That's all. Split out of `createFocusTrap` because **restore and trap are
 * independent concerns**: an overlay can want its focus returned without trapping focus
 * inside itself. Popover and Tooltip are exactly that — non-modal, restore-without-trap —
 * and welding the two together is what forced a non-modal Dialog to strand focus on
 * `<body>` after Escape.
 *
 * ## Two ordering constraints, both verified against the installed `solid-js`
 *
 * 1. **Call this _before_ `createFocusTrap`.** Sibling effects run in creation order, so
 *    creating the restore effect first is what guarantees its `document.activeElement`
 *    snapshot happens before the trap moves focus into its container.
 *
 * 2. **The restore itself is deferred by one microtask.** Sibling effect *cleanups* also
 *    run in creation order — not reverse — so this cleanup runs while the trap's own
 *    `focusin` listener is still attached. Focusing the trigger synchronously would fire
 *    `focusin`, and the still-live trap would yank focus straight back into its container.
 *    Cleanups are synchronous within a flush, so a microtask queued here lands after every
 *    sibling cleanup has run and the listener is gone.
 *
 * The restore is skipped when the remembered element has left the document (its subtree was
 * unmounted along with the overlay) or is `<body>` (nothing meaningful had focus).
 */
export function createFocusRestore(options: CreateFocusRestoreOptions): void {
  createEffect(
    () => options.active(),
    (active) => {
      if (!active) return;

      const previouslyFocused = document.activeElement as HTMLElement | null;

      return () => {
        queueMicrotask(() => {
          if (!previouslyFocused?.isConnected) return;
          if (previouslyFocused === document.body) return;
          previouslyFocused.focus();
        });
      };
    },
  );
}
