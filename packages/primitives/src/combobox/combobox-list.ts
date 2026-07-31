import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { createRegisteredId, type SelectionMode } from "../internal";
import { composeEventHandlers } from "../utils";
import type { CreateComboboxReturn } from "./combobox-root";

export interface CreateComboboxListReturn {
  /** Spread onto the `role="listbox"` element. `id`/`aria-labelledby` fall back to the consumer's;
   * the role and the two list-level ARIA attributes are owned here. */
  props: JSX.HTMLAttributes<HTMLElement>;
  /** Hand to the list element's `ref`; registers it as the option source's **scroll container**. */
  setRef: (element: HTMLElement) => void;
}

/**
 * The list part: the `role="listbox"` element the options live in, and the scroll container an
 * offscreen highlighted option is scrolled inside.
 *
 * ## It is deliberately NOT `state.list.rootProps`
 *
 * `createListbox` returns a `rootProps` for the standalone case, where the container itself is the
 * focus owner. Spreading it here would be actively wrong three times over:
 *
 * - **`tabindex: 0`** — a second tab stop, inside a popup that is only reachable because the trigger
 *   kept focus.
 * - **its own `onKeyDown`** — a second, competing keymap. No option is ever focused here, so no
 *   keydown could reach it anyway; the trigger owns the map.
 * - **its own `aria-activedescendant`** — the attribute belongs on the element that holds DOM focus,
 *   and pointing a second one at the same option would claim this element is focused too.
 *
 * So the five props below are built by hand: `id`, `role`, `aria-labelledby`, `aria-multiselectable`
 * and `aria-orientation`. Everything behavioral stays on `createComboboxTrigger`.
 *
 * ## A mousedown inside the list must not move focus
 *
 * Options carry `tabindex="-1"` in activedescendant mode, which still makes them **click**-focusable
 * — so clicking one would blur the trigger, drop the highlight's paint gate, and hand DOM focus to
 * an element the pattern says never has it. `preventDefault()` on `mousedown` is how every reference
 * implementation stops that; `click` still fires, so an option's own selection handler is untouched.
 *
 * `role="listbox"` needs an accessible name (axe `aria-input-field-name` covers it as well as
 * `combobox`), so `aria-labelledby` falls back to the trigger — the element whose name the popup
 * belongs to.
 */
export function createComboboxList<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLElement>,
): CreateComboboxListReturn {
  // Publish a consumer-supplied `id` up, so the trigger's `aria-controls` names the element that
  // actually exists. Scoped to this part, so it clears when the popup unmounts.
  createRegisteredId({ id: () => props.id, register: state.setPopupId });

  const list = state.list;
  const rest = omit(props, "onMouseDown");

  const elementProps: JSX.HTMLAttributes<HTMLElement> = merge(rest, {
    get id() {
      return props.id ?? state.popupId();
    },
    get role() {
      return "listbox" as const;
    },
    get "aria-labelledby"() {
      return props["aria-labelledby"] ?? state.triggerId();
    },
    get "aria-multiselectable"() {
      return list.selectionMode() === "multiple" ? ("true" as const) : undefined;
    },
    get "aria-orientation"() {
      return list.orientation();
    },
    get onMouseDown() {
      return composeEventHandlers<HTMLElement, MouseEvent>(props.onMouseDown, (event) =>
        event.preventDefault(),
      );
    },
  });

  return {
    props: elementProps,
    // This is the scroll container `createDataCollection.scrollIndexIntoView` scrolls, which is what
    // makes a mounted-but-clipped option visible when the highlight reaches it. In activedescendant
    // mode nothing moves DOM focus, so nothing else would ever bring it into view.
    setRef: (element) => state.setListElement(element),
  };
}
