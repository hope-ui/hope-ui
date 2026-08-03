import type { JSX } from "@solidjs/web";
import { createEffect, createSignal, merge, omit, untrack } from "solid-js";
import { composeEventHandlers } from "../utils";
import type { CreateCalendarReturn } from "./calendar-root";

export interface CreateCalendarGroupReturn {
  /** Spread onto the `role="group"` container — the accessible name plus the calendar-wide state
   * `data-*`, and the focus-out half of the abandonment policy. */
  props: JSX.HTMLAttributes<HTMLElement>;
  /** Hand to the container element's `ref`. It is what "outside" is measured against, so without it
   * the outside-pointer half of the abandonment policy stays dormant — and what the dev direction
   * warning measures the layout against, so without it that warning stays silent. */
  setRef: (element: HTMLElement) => void;
}

/**
 * The `role="group"` container part: the calendar's accessible name, its calendar-wide state hooks
 * (`data-disabled` / `data-readonly` / `data-required`), and — the reason this part exists at all —
 * the abandonment policy, which decides what becomes of a range the user walks away from mid-selection.
 *
 * A range with an anchor but no second endpoint is a state the user can neither see nor leave: the
 * next click anywhere completes a range they had forgotten starting. So both ways of walking away
 * resolve it, per `state.commitBehavior()` — `"select"` (default) completes the tentative range at the
 * cursor, `"reset"` drops the anchor, `"clear"` empties the selection:
 *
 * - **Pointer released outside**, while focus is still in the calendar. A press on a `button` *inside*
 *   the calendar is exempt, which is what lets the month be paged (and the view drilled) mid-selection
 *   — the nav buttons are not an exit.
 * - **Focus leaving** the calendar entirely — a `focusout` after which focus has settled outside it.
 *
 * `Escape` is the third exit and always cancels regardless of `commitBehavior`; it lives on the grid's
 * keymap (`calendar-grid.ts`), where the roving cursor's keyboard already is.
 *
 * Why not `createDismissable`, and the rest of the reasoning:
 * `__internal__/primitives/calendar/calendar-group.md`.
 */
export function createCalendarGroup(
  state: CreateCalendarReturn,
  props: JSX.HTMLAttributes<HTMLElement> = {},
): CreateCalendarGroupReturn {
  // A real signal, not a plain variable: the effect below has to re-run once the container mounts, and
  // a `createEffect`'s compute function is the only place a ref may be tracked under Solid 2.0 (see
  // `../internal/create-focus-trap.ts`).
  const [container, setContainer] = createSignal<HTMLElement>();

  const applyCommitBehavior = () => {
    switch (state.commitBehavior()) {
      case "select":
        return state.commitSelection();
      case "reset":
        return state.clearAnchor();
      case "clear":
        return state.clearSelection();
    }
  };

  // Listening only while a range is anchored keeps a single/multiple calendar — and an idle range one
  // — free of a window listener entirely. Arming this late is safe: the anchor is set by the day
  // cell's `click`, which fires *after* the `pointerup` that produced it, so the gesture that anchors
  // can never be the gesture that commits.
  createEffect(
    () => [state.anchorDate(), container()] as const,
    ([anchor, element]) => {
      if (anchor === null || element === undefined) {
        return;
      }

      const handlePointerUp = (event: PointerEvent) => {
        // Once focus has already left, the focus-out branch below owns the decision — running both
        // would resolve the range twice.
        if (!element.contains(document.activeElement)) {
          return;
        }
        const target = event.target as Element | null;
        const pressedOwnButton =
          target !== null &&
          element.contains(target) &&
          target.closest('button, [role="button"]') !== null;
        if (pressedOwnButton) {
          return;
        }
        applyCommitBehavior();
      };

      window.addEventListener("pointerup", handlePointerUp);
      return () => window.removeEventListener("pointerup", handlePointerUp);
    },
  );

  const handleFocusOut: JSX.EventHandler<HTMLElement, FocusEvent> = (event) => {
    // `createListFocus` moves DOM focus from inside its own effect (`element.focus()`), which fires
    // this handler synchronously — so a plain read here would register as a dependency of that effect.
    // Same deliberate imperative sync as `createCalendarCell`'s `onFocus`.
    if (untrack(state.anchorDate) === null) {
      return;
    }
    const element = event.currentTarget;
    // Where focus went is decided on the next task, NOT from `event.relatedTarget`. Solid's `<For>`
    // rebuilds the day cells on a month change, so paging destroys the focused button and Chrome
    // reports the blur with no `relatedTarget` at all — at this instant indistinguishable from tabbing
    // away. Measured, not theoretical: reading `relatedTarget` ended the range on every `PageDown`.
    // Deferring and then asking where focus actually *is* answers both cases with one rule, because
    // the re-render and the grid's deferred focus nudge land in the same flush.
    setTimeout(() => {
      untrack(() => {
        if (state.anchorDate() === null || !element.isConnected) {
          return; // already resolved (the pointer branch), or the calendar is gone
        }
        if (element.contains(document.activeElement)) {
          return; // focus only moved between the calendar's own cells and chrome
        }
        applyCommitBehavior();
      });
    });
  };

  const elementProps = merge(omit(props, "onFocusOut"), {
    role: "group" as const,
    get "aria-label"() {
      return props["aria-label"] ?? state.groupLabel();
    },
    get "data-disabled"() {
      return state.disabled() ? "" : undefined;
    },
    get "data-readonly"() {
      return state.readOnly() ? "" : undefined;
    },
    get "data-required"() {
      return state.required() ? "" : undefined;
    },
    get onFocusOut() {
      return composeEventHandlers<HTMLElement, FocusEvent>(props.onFocusOut, handleFocusOut);
    },
  });

  // Two consumers of the same element, so `setRef` feeds both: the abandonment policy measures
  // "outside" against it, and the root state's dev direction warning reads its applied layout.
  const setRef = (element: HTMLElement) => {
    setContainer(element);
    state.setGroupElement(element);
  };

  return { props: elementProps, setRef };
}
