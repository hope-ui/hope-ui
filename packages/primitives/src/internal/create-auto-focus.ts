import { type Accessor, createEffect, untrack } from "solid-js";

export interface CreateAutoFocusOptions {
  /** Whether autofocus is currently active. */
  active: Accessor<boolean>;
  /** The container to move focus into. */
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

/** Not barrel-exported — `create-focus-trap.ts` imports it for its Tab cycling. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
}

/**
 * Moves focus into a container when `active` turns true: `initialFocus`, else the first
 * focusable descendant, else the container itself under a temporary `tabindex="-1"` that is
 * removed again on deactivation. Gated entirely inside `createEffect`, so it naturally never
 * runs during SSR (no DOM access happens outside the effect).
 *
 * **Focusing in and trapping focus are separate concerns**, which is why this is its own
 * primitive rather than half of `createFocusTrap`. A non-modal overlay (Popover, Tooltip, a
 * non-modal Dialog) wants focus moved into it *without* Tab being caged there.
 * `createFocusTrap` composes this one; see `create-focus-trap.md` for the creation order that
 * composition depends on.
 *
 * Restoring focus on deactivation is a third concern again — `createFocusRestore`, which must
 * be created *before* this one so its `document.activeElement` snapshot precedes the `.focus()`
 * below.
 */
export function createAutoFocus(options: CreateAutoFocusOptions): void {
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
      if (!active || !container) {
        return;
      }

      // Sampled, not tracked: `initialFocus` names where focus goes *on this activation*.
      // Tracking it would re-run the whole activation block — stealing focus back — every
      // time a signal-backed target ref reassigned. Left untracked implicitly it trips
      // `STRICT_READ_UNTRACKED` for any consumer passing a real accessor, so it is spelled.
      const initial =
        untrack(() => options.initialFocus?.()) ?? getFocusableElements(container)[0] ?? container;
      let addedTabIndex = false;
      if (initial === container && !container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
        addedTabIndex = true;
      }
      initial.focus();

      return () => {
        if (addedTabIndex) {
          container.removeAttribute("tabindex");
        }
      };
    },
  );
}
