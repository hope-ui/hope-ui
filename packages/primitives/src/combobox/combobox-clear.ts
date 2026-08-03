import { useLocale } from "@hope-ui/i18n";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { createButton, type SelectionMode } from "../internal";
import { composeEventHandlers } from "../utils";
import type { CreateComboboxReturn } from "./combobox-root";

export interface CreateComboboxClearProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Empty the field. Called on click, **before** focus is returned to the input. What "empty" means
   * — the text, the selection, or both — is the component's call, since this family owns no text
   * value (same reason `createComboboxInput` takes an `onCommit`).
   */
  onClear?: () => void;
  /**
   * Whether the rendered element is a native `<button>`. Default `true`. Set `false` when a `render`
   * prop swaps in something else. A control prop, never spread as an attribute.
   */
  nativeButton?: boolean;
}

export interface CreateComboboxClearReturn {
  /** Spread onto the clear button. `aria-label` and everything the consumer passes fall back to
   *  theirs; the tab-order exclusion and the focus-preserving pointerdown are owned here. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Hand to the button's `ref`; wires `createButton`'s press engine. */
  setRef: (element: HTMLButtonElement) => void;
}

/**
 * The clear button inside a Combobox's control: empties the field and hands focus back to the input.
 *
 * It shares the chevron's two structural rules (`combobox-toggle.ts` has the long form) and none of
 * its ARIA. `tabindex="-1"`, because the input is the widget's single tab stop; and a cancelled
 * `pointerdown`, because a click that moved DOM focus here would blur the input and fire its
 * blur-commit — re-filling the field the user just asked to empty.
 *
 * No popup ARIA at all: clearing is not opening, and `aria-expanded`/`aria-controls` here would
 * claim this button owns the listbox when the input already does. The localized `aria-label` is not
 * optional — a bare ✕ has no accessible name (axe `button-name`).
 *
 * **It is not a `CloseButton`.** That component is a themed, surface-adaptive dismissal affordance
 * with its own recipe; this is a slot inside another control's box, and the two want different
 * metrics. `Combobox.Clear` renders `XIcon` directly.
 */
export function createComboboxClear<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: CreateComboboxClearProps,
): CreateComboboxClearReturn {
  const { t } = useLocale();

  const clear = () => {
    props.onClear?.();
    // After the clear, not before: re-focusing first would let the input's blur-commit race it and
    // put back the text that was just removed.
    state.triggerElement()?.focus();
  };

  const button = createButton<HTMLButtonElement>({
    disabled: () => state.list.disabled(),
    nativeButton: () => props.nativeButton ?? true,
    onClick: () => composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, clear),
    onKeyDown: () => props.onKeyDown,
    onKeyUp: () => props.onKeyUp,
    onPointerDown: () =>
      composeEventHandlers<HTMLButtonElement, PointerEvent>(props.onPointerDown, (event) =>
        event.preventDefault(),
      ),
  });

  const rest = omit(
    props,
    "onClear",
    "nativeButton",
    "onClick",
    "onKeyDown",
    "onKeyUp",
    "onPointerDown",
  );

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(
    rest,
    button.buttonProps,
    {
      get "aria-label"() {
        return props["aria-label"] ?? t("combobox.clearLabel");
      },
      // Component-owned, deliberately not forwardable — see `combobox-toggle.ts`.
      get tabIndex() {
        return -1;
      },
    },
  );

  return { props: elementProps, setRef: button.setRef };
}
