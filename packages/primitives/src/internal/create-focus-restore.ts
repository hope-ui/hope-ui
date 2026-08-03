import { type Accessor, createEffect } from "solid-js";

export interface CreateFocusRestoreOptions {
  /** Whether the layer that borrowed focus is currently active. */
  active: Accessor<boolean>;
}

/**
 * Remembers what was focused when `active` turns true, and focuses it again when `active` turns
 * false. That is all it does. Split out of `createFocusTrap` because **restoring focus and trapping
 * it are independent concerns**: a non-modal overlay — a popover, a tooltip — wants its focus
 * returned without Tab ever being caged inside it, and welding the two together is what once left a
 * non-modal dialog stranding focus on `<body>` after Escape.
 *
 * Two ordering constraints, both pinned against the installed `solid-js`:
 *
 * 1. **Create this before `createFocusTrap`.** Sibling effects run in creation order, so going
 *    first is what makes this snapshot of `document.activeElement` happen before the trap moves
 *    focus into its container.
 * 2. **The restore is deferred by one microtask.** Sibling *cleanups* also run in creation order,
 *    not reverse, so this one runs while the trap's `focusin` listener is still attached — focusing
 *    synchronously would fire `focusin` and the still-live trap would yank focus straight back. All
 *    cleanups run synchronously within the one reactive update, so a microtask lands after them.
 *
 * The restore is skipped when the remembered element has left the document (unmounted along with
 * the overlay) or is `<body>` (nothing meaningful had focus). Ordering is worked through in
 * __internal__/primitives/internal/create-focus-restore.md.
 */
export function createFocusRestore(options: CreateFocusRestoreOptions): void {
  createEffect(
    () => options.active(),
    (active) => {
      if (!active) {
        return;
      }

      const previouslyFocused = document.activeElement as HTMLElement | null;

      return () => {
        queueMicrotask(() => {
          if (!previouslyFocused?.isConnected) {
            return;
          }
          if (previouslyFocused === document.body) {
            return;
          }
          previouslyFocused.focus();
        });
      };
    },
  );
}
