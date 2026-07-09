import { type Accessor, createEffect } from "solid-js";

export interface CreateFocusTrapOptions {
  /** Whether the trap is currently active. */
  active: Accessor<boolean>;
  /** The container element to trap focus within. */
  ref: Accessor<HTMLElement | null | undefined>;
  /** Explicit element to focus on activation, instead of the first focusable descendant. */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
  /** Whether to restore focus to the previously focused element on deactivation. Default `true`. */
  returnFocus?: boolean;
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
 * Traps Tab/Shift+Tab focus cycling within a container while `active`, refocuses the
 * container if focus is moved outside it programmatically, and restores focus to the
 * previously focused element on deactivation. Gated entirely inside `createEffect`, so
 * it naturally never runs during SSR (no DOM access happens outside the effect).
 */
export function createFocusTrap(options: CreateFocusTrapOptions): void {
  let previouslyFocused: HTMLElement | null = null;

  createEffect(
    () => options.active(),
    (active) => {
      // `ref()` is read here, inside the effect callback, rather than in the tracked
      // compute function above. A plain (non-signal) ref accessor read inside `compute`
      // is captured synchronously at the moment this `createEffect` call is evaluated —
      // which happens *before* this component's own later JSX (and its `ref` callback)
      // has run — so it would always observe the container as not-yet-set. Reading it
      // fresh here, in the deferred effect phase, sees the real post-mount value.
      const container = options.ref();
      if (!active || !container) return;

      previouslyFocused = document.activeElement as HTMLElement | null;

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
        if (options.returnFocus !== false) previouslyFocused?.focus();
      };
    },
  );
}
