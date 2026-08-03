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
 * **It deliberately does not spread `state.list.rootProps`.** That binding is for the standalone
 * listbox, where the container itself owns focus, and every piece of it is wrong here: `tabindex: 0`
 * adds a second tab stop inside a popup only reachable because the trigger kept focus; its
 * `onKeyDown` is a second competing keymap no keydown could even reach; and its
 * `aria-activedescendant` belongs on whichever element holds DOM focus, not on a second one claiming
 * to. So the five props below are built by hand, and everything behavioral stays on the trigger.
 *
 * **A mousedown inside the list must not move focus.** Options carry `tabindex="-1"`, which still
 * leaves them *click*-focusable — so clicking one would blur the trigger, drop the highlight's paint
 * gate, and hand DOM focus to an element that is never supposed to have it. Cancelling `mousedown`
 * stops that; `click` still fires, so an option's own selection handler is untouched.
 *
 * `role="listbox"` needs an accessible name, so `aria-labelledby` falls back to the trigger — the
 * element whose name the popup belongs to.
 */
export function createComboboxList<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLElement>,
): CreateComboboxListReturn {
  // Publish a consumer-supplied `id` up, so the trigger's `aria-controls` names the element that
  // actually exists. Called from this part's own scope, so it clears when the popup unmounts.
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
    // The scroll container `createDataCollection.scrollIndexIntoView` scrolls, which is what makes a
    // mounted-but-clipped option visible once the highlight reaches it. Nothing moves DOM focus in
    // activedescendant mode, so nothing else would ever bring it into view.
    setRef: (element) => state.setListElement(element),
  };
}
