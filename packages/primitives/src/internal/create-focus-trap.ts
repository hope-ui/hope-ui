import { type Accessor, createEffect } from "solid-js";
import { createAutoFocus, getFocusableElements } from "./create-auto-focus";

export interface CreateFocusTrapOptions {
  /** Whether the trap is currently active. */
  active: Accessor<boolean>;
  /** The container element to trap focus within. */
  ref: Accessor<HTMLElement | null | undefined>;
  /** Explicit element to focus on activation, instead of the first focusable descendant. */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}

/**
 * Traps Tab/Shift+Tab focus cycling within a container while `active`, and refocuses the
 * container if focus is moved outside it programmatically. Gated entirely inside
 * `createEffect`, so it naturally never runs during SSR (no DOM access happens outside the
 * effect).
 *
 * **Moving focus in on activation is `createAutoFocus`**, composed below rather than
 * reimplemented — a non-modal overlay (Popover, Tooltip) wants that half without the cage.
 *
 * **Restoring focus on deactivation is not this primitive's job** — that's
 * `createFocusRestore`, which is a separate concern precisely because a non-modal overlay
 * (Popover, Tooltip, a non-modal Dialog) wants focus returned *without* being trapped.
 * Compose both, and create `createFocusRestore` first; see `create-focus-restore.md` for the two
 * ordering constraints that depend on it.
 */
export function createFocusTrap(options: CreateFocusTrapOptions): void {
  // Created BEFORE `createAutoFocus`, and that order is load-bearing. Sibling effects run
  // their previous cleanup in *creation* order on a re-run, so listeners-first reproduces
  // what the single welded effect used to do: remove the listeners, and only then let
  // autofocus remove the `tabindex` it added. It also puts the `focusin` handler in place
  // before autofocus fires, which is what makes an out-of-container `initialFocus` get
  // pulled back inside — the observable half of the decision. See `create-focus-trap.md`.
  createEffect(
    // Same compute as `createAutoFocus`'s, for the same reason — see the comment there.
    () => [options.active(), options.ref()] as const,
    ([active, container]) => {
      if (!active || !container) {
        return;
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Tab") {
          return;
        }

        const focusable = getFocusableElements(container);
        if (focusable.length === 0) {
          event.preventDefault();
          container.focus();
          return;
        }

        // Guaranteed non-empty by the length check above.
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        const current = document.activeElement;

        if (event.shiftKey && current === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          first.focus();
        }
      };

      const handleFocusIn = (event: FocusEvent) => {
        if (container.contains(event.target as Node)) {
          return;
        }
        const focusable = getFocusableElements(container);
        (focusable[0] ?? container).focus();
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("focusin", handleFocusIn);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("focusin", handleFocusIn);
      };
    },
  );

  createAutoFocus(options);
}
