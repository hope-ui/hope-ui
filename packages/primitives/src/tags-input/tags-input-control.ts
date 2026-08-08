import type { JSX } from "@solidjs/web";
import { type Accessor, merge, omit } from "solid-js";
import { composeEventHandlers } from "../utils";
import type { CreateTagsInputReturn } from "./tags-input-root";

/**
 * Everything a press is allowed to reach on its own, so the shell does not steal it.
 *
 * `[tabindex]` is **unqualified**, where Base UI's equivalent writes `[tabindex]:not([tabindex="-1"])`.
 * Every chip and every ✕ in this widget is `tabindex="-1"` (`D2` — the field is the single tab stop),
 * and `D2` also says a chip is reachable **by pointer**; the narrower selector would let the shell
 * pull focus out of a chip the user just clicked.
 */
const INTERACTIVE_TARGET_SELECTOR =
  'button, a[href], input, select, textarea, [role="button"], [contenteditable]:not([contenteditable="false"]), [tabindex]';

export interface CreateTagsInputControlReturn {
  /**
   * Spread onto the shell element. The `data-*` state and the press behavior are owned here;
   * everything the consumer passes is forwarded. `ref` is omitted from the declared type — this part
   * needs no element of its own, so the consumer sets a `ref` on the element directly.
   */
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    "data-disabled"?: string;
    "data-readonly"?: string;
    "data-invalid"?: string;
    "data-focus"?: string;
  };
  /** Whether focus is anywhere in the widget — the `focus-within` ring, and the same flag that gates
   *  the chip highlight and the live region. */
  isFocused: Accessor<boolean>;
}

/**
 * The bordered shell around the chip row, the field and the clear button. It renders no ARIA of its
 * own — the row is the `toolbar`, the field is the `textbox` — and owns exactly two things: the
 * `data-*` the recipe styles from, and **click-anywhere-focuses-the-field**.
 *
 * ## Why the press behavior exists at all
 *
 * The shell is padding around a field narrower than it. Without this, a click on that padding lands
 * on a `<div>`, focus goes nowhere, and the user has to aim at the input — which is the one part of
 * the control that shrinks as chips fill the row. Every text-field-shaped control solves this; here it
 * is a hook rather than a `<label>` because a `<label htmlFor>` would also re-fire on every chip click.
 *
 * ## …and why it bails on an interactive target
 *
 * Adapted from Base UI's `handleInputPress.ts` (its reasoning, not its code). A press that lands on
 * the ✕, on a chip, on the clear button, or in the field itself must be left alone: stealing it would
 * cancel the chip's own focus, or move the caret to the end of the text the user just clicked into.
 * The bail is one `closest()` against {@link INTERACTIVE_TARGET_SELECTOR}, scoped to this element's
 * own subtree so an interactive *ancestor* of the whole control never matches.
 *
 * `pointerdown` rather than `click`, and cancelled: the default action of a press is what moves DOM
 * focus, so cancelling it and focusing explicitly is what stops the focus ring flashing on the shell
 * first. `click` still fires, untouched.
 *
 * Full rationale: `__internal__/primitives/tags-input/tags-input-control.md`.
 */
export function createTagsInputControl<V = string>(
  state: CreateTagsInputReturn<V>,
  props: JSX.HTMLAttributes<HTMLElement> = {},
): CreateTagsInputControlReturn {
  const handlePointerDown = (event: PointerEvent & { currentTarget: HTMLElement }) => {
    // Someone downstream already claimed this press — the ✕ cancels its own `pointerdown` to keep
    // focus in the field. Base UI spells the same check `event.baseUIHandlerPrevented`.
    if (event.defaultPrevented) {
      return;
    }
    const shell = event.currentTarget;
    const target = event.target;
    if (target instanceof Element && target !== shell) {
      const interactive = target.closest(INTERACTIVE_TARGET_SELECTOR);
      if (interactive != null && interactive !== shell && shell.contains(interactive)) {
        return;
      }
    }

    event.preventDefault();
    if (state.disabled()) {
      // Cancelled but not focused: a disabled control should not drag-select its own chrome either.
      return;
    }
    // Read-only still focuses, unlike Base UI's early return. A read-only field is focusable and its
    // text selectable by definition — that is the whole difference from `disabled` — and there is no
    // popup here for the press to have opened.
    state.inputElement()?.focus();
  };

  const rest = omit(props, "onPointerDown");

  const elementProps = merge(rest, {
    get "data-disabled"() {
      return state.disabled() ? "" : undefined;
    },
    get "data-readonly"() {
      return state.readOnly() ? "" : undefined;
    },
    get "data-invalid"() {
      return state.invalid() ? "" : undefined;
    },
    get "data-focus"() {
      // The widget's flag, not this element's `:focus-within` — it stays set across the frame in
      // which a chip is destroyed and focus is re-homed, so the ring does not blink on every removal.
      return state.focus.isFocused() ? "" : undefined;
    },
    get onPointerDown() {
      return composeEventHandlers<HTMLElement, PointerEvent>(
        props.onPointerDown,
        handlePointerDown,
      );
    },
  });

  return { props: elementProps, isFocused: state.focus.isFocused };
}
