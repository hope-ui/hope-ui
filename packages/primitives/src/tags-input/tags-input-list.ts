import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers } from "../utils";
import type { CreateTagsInputReturn } from "./tags-input-root";

export interface CreateTagsInputListReturn {
  /**
   * Spread onto the chip-row container. `role`/`aria-orientation` and the three live-region
   * attributes are owned here; everything the consumer passes is forwarded. `ref` is omitted — hand
   * the element to {@link CreateTagsInputListReturn.setRef} instead.
   */
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    "aria-live": "polite" | "off";
  };
  /** Hand to the container's `ref`: it is the collection's scroll container and the focus owner's
   *  element, and the widget cannot move focus between chips until it resolves. */
  setRef: (element: HTMLElement) => void;
}

/**
 * The chip-row part: the container the chips live in, the widget's focus-within tracker, and the
 * live region that announces a newly added tag.
 *
 * ## `role="toolbar"`, and why a role at all (`D1`)
 *
 * The Windows screen readers NVDA and JAWS intercept arrow keys in *browse mode* and only hand them
 * to the page in *focus mode*, which they enter for `grid` / `toolbar` / `listbox` / `menu` / `tree`
 * — not for a plain `div`, and not for `list`/`listitem`. So a role-less chip row simply cannot be
 * arrowed through by those users, while every keyboard test still passes. `toolbar` buys focus mode
 * without React Aria's `grid`/`row`/`gridcell` shape, whose hooks this kernel would have to port
 * first. Full comparison: `__internal__/components/decisions.md` § TagsInput.
 *
 * ## The live region is three attributes, not a message (`D9`)
 *
 * `aria-relevant="additions"` + `aria-atomic="false"` announce the chip element that just appeared,
 * verbatim — there is no string to compose and none to localize, which is what makes this cheaper and
 * more faithful than the imperative `createAnnounce` Calendar uses.
 *
 * `aria-live` is **`"off"` until focus is inside the widget**, and that gate is the whole point: a
 * value change from somewhere else (a server push, a sibling control writing the same list) must not
 * talk over the user. It also means the attribute is `"off"` in server-rendered HTML and only turns
 * `"polite"` after hydration, because it is derived from focus state rather than written by an
 * effect.
 */
export function createTagsInputList<V = string>(
  state: CreateTagsInputReturn<V>,
  props: JSX.HTMLAttributes<HTMLElement> = {},
): CreateTagsInputListReturn {
  /**
   * Focus is still "in the widget" when it sits on a chip **or** on the text field, which is outside
   * this element. Asking only `owner.contains(...)` would drop the flag every time ArrowLeft-then-
   * Escape handed focus back to the field, taking the live region and the chip highlight with it.
   */
  const holdsWidgetFocus = (owner: HTMLElement) => {
    const active = owner.ownerDocument.activeElement;
    return active != null && (owner.contains(active) || active === state.inputElement());
  };

  const rest = omit(props, "onFocusIn", "onFocusOut");

  const elementProps = merge(rest, {
    get role() {
      return "toolbar" as const;
    },
    get "aria-orientation"() {
      return "horizontal" as const;
    },
    // The three live-region attributes are deliberately **not** forwardable: this element *is* the
    // region, and a consumer overriding any one of them silently turns the announcement off with
    // nothing to fail. Same call, and the same reason, as `combobox-status.ts`.
    get "aria-live"() {
      return state.focus.isFocused() ? ("polite" as const) : ("off" as const);
    },
    get "aria-relevant"() {
      return "additions" as const;
    },
    get "aria-atomic"() {
      // The string, not the boolean: Solid renders `aria-atomic={false}` as `aria-atomic=""`, which
      // is not a valid ARIA value.
      return "false" as const;
    },
    get onFocusIn() {
      return composeEventHandlers<HTMLElement, FocusEvent>(props.onFocusIn, () => {
        state.focus.setFocused(true);
      });
    },
    get onFocusOut() {
      return composeEventHandlers<HTMLElement, FocusEvent>(props.onFocusOut, (event) => {
        const owner = event.currentTarget;
        // Decided on the next task, **not** from `event.relatedTarget`: removing a chip destroys the
        // element that had focus, which blurs with a null `relatedTarget` — at this instant
        // indistinguishable from the user tabbing away — and the focus re-homing that follows lands
        // within the same flush. Same shape, and the same reason, as `listbox-root.ts`.
        setTimeout(() => {
          if (owner.isConnected && !holdsWidgetFocus(owner)) {
            state.focus.setFocused(false);
          }
        });
      });
    },
  });

  return {
    props: elementProps,
    setRef: (element) => state.setListElement(element),
  };
}
