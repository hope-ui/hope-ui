import { type Accessor, createEffect } from "solid-js";

export interface CreateFocusTrapOptions {
  /** Whether the trap is currently active. */
  active: Accessor<boolean>;
  /** The container element to trap focus within. */
  ref: Accessor<HTMLElement | null | undefined>;
  /** Explicit element to focus on activation, instead of the first focusable descendant. */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
  "audio[controls]",
  "video[controls]",
].join(",");

function isVisible(element: HTMLElement): boolean {
  return element.offsetParent !== null || element.getClientRects().length > 0;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
}

/**
 * Traps Tab/Shift+Tab focus cycling within a container while `active`, and refocuses the
 * container if focus is moved outside it programmatically. Gated entirely inside
 * `createEffect`, so it naturally never runs during SSR (no DOM access happens outside the
 * effect).
 *
 * **Restoring focus on deactivation is not this primitive's job** — that's
 * `createFocusRestore`, which is a separate concern precisely because a non-modal overlay
 * (Popover, Tooltip, a non-modal Dialog) wants focus returned *without* being trapped.
 * Compose both, and create `createFocusRestore` first; see `focus-restore.md` for the two
 * ordering constraints that depend on it.
 */
export function createFocusTrap(options: CreateFocusTrapOptions): void {
  createEffect(
    // Track both `active()` and `ref()` in the compute function. `ref` must be a real
    // signal accessor (not a closure over a plain `let`): when the container is only
    // created as a reactive consequence of the same `active`/`present` signal flipping
    // (e.g. gated behind a `<Show>`), a *sibling* effect elsewhere may create/assign it
    // *after* this effect's first run for that change — a plain untracked `ref()` read
    // would permanently miss it, since `active` (its only dependency) won't change
    // again. Tracking `ref()` too means this effect reruns once the signal-backed ref
    // actually updates, regardless of firing order relative to that sibling effect.
    () => [options.active(), options.ref()] as const,
    ([active, container]) => {
      if (!active || !container) return;

      const initial = options.initialFocus?.() ?? getFocusableElements(container)[0] ?? container;
      let addedTabIndex = false;
      if (initial === container && !container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
        addedTabIndex = true;
      }
      initial.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Tab") return;

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
        if (container.contains(event.target as Node)) return;
        const focusable = getFocusableElements(container);
        (focusable[0] ?? container).focus();
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("focusin", handleFocusIn);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("focusin", handleFocusIn);
        if (addedTabIndex) container.removeAttribute("tabindex");
      };
    },
  );
}
