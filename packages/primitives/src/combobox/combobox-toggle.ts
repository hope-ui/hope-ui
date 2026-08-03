import { useLocale } from "@hope-ui/i18n";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { createButton, type SelectionMode } from "../internal";
import { composeEventHandlers } from "../utils";
import type { CreateComboboxReturn } from "./combobox-root";

export interface CreateComboboxToggleProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether the rendered element is a native `<button>`. Default `true`. Set `false` when a `render`
   * prop swaps in something else, so `createButton` switches to `tabIndex`/`aria-disabled` and
   * synthesizes keyboard activation. A control prop, never spread as an attribute.
   */
  nativeButton?: boolean;
}

export interface CreateComboboxToggleReturn {
  /** Spread onto the chevron button. `aria-label` and everything the consumer passes fall back to
   *  theirs; the popup ARIA, the tab-order exclusion and the focus-preserving pointerdown are owned
   *  here. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Hand to the button's `ref`; wires `createButton`'s press engine. */
  setRef: (element: HTMLButtonElement) => void;
}

/**
 * The chevron button beside a Combobox's input: a pointer affordance for opening the popup, and
 * nothing else.
 *
 * **This is what `Combobox.Trigger` assembles — not `createComboboxTrigger`.** That hook is the
 * `role="combobox"` focus owner Select's trigger is, and putting it here would give the tree two
 * comboboxes, two `aria-activedescendant`s and two keymaps. The names track the *parts* users see
 * (`Select.Trigger`, `Combobox.Trigger`), which are the same affordance on different elements.
 *
 * **It is not in the tab order and never takes focus**, which is two mechanisms:
 *
 * - `tabindex="-1"`, because the input is the widget's single tab stop. A second one doubles the
 *   presses it takes to cross a form of comboboxes, for behavior already bound to the input.
 * - Cancelling `pointerdown`, because a click that moved DOM focus here would blur the input, drop
 *   the option highlight's paint gate, fire the input's blur-commit, and leave
 *   `aria-activedescendant` sitting on an element that is no longer focused.
 *
 * The click handler re-focuses the input anyway, for the case where focus was somewhere else
 * entirely when the button was pressed.
 *
 * A bare chevron has no accessible name (axe `button-name`) and is unusable by voice control, so it
 * carries a localized `aria-label` a consumer can override. `aria-haspopup` is **explicit** here,
 * unlike on the input: ARIA 1.2 gives `role="combobox"` an implicit one, a `<button>` none.
 */
export function createComboboxToggle<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: CreateComboboxToggleProps,
): CreateComboboxToggleReturn {
  const { t } = useLocale();

  const toggle = () => {
    // Focus the field first: the cancelled pointerdown left focus wherever it already was — the
    // input on every normal path, somewhere else entirely when the widget was not focused at all.
    state.triggerElement()?.focus();
    if (!state.open()) {
      // A pointer open lands on the selected option, as `createComboboxTrigger` does.
      state.setFocusStrategy("selected");
      state.setOpen(true);
      return;
    }
    state.setOpen(false);
  };

  const button = createButton<HTMLButtonElement>({
    disabled: () => state.list.disabled(),
    nativeButton: () => props.nativeButton ?? true,
    onClick: () => composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, toggle),
    onKeyDown: () => props.onKeyDown,
    onKeyUp: () => props.onKeyUp,
    onPointerDown: () =>
      composeEventHandlers<HTMLButtonElement, PointerEvent>(props.onPointerDown, (event) =>
        event.preventDefault(),
      ),
  });

  const rest = omit(props, "nativeButton", "onClick", "onKeyDown", "onKeyUp", "onPointerDown");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(
    rest,
    button.buttonProps,
    {
      get "aria-label"() {
        return props["aria-label"] ?? t("combobox.triggerLabel");
      },
      get "aria-haspopup"() {
        return "listbox" as const;
      },
      get "aria-expanded"() {
        return state.open() ? ("true" as const) : ("false" as const);
      },
      get "aria-controls"() {
        // Only while open, like every IDREF in this family: the popup mounts lazily, and naming an
        // element that is not in the DOM is an axe `aria-valid-attr-value` violation.
        return state.open() ? state.popupId() : undefined;
      },
      // Component-owned, deliberately not forwardable: a consumer who puts this button back in the
      // tab order gets a second tab stop that does nothing the input cannot already do.
      get tabIndex() {
        return -1;
      },
    },
  );

  return { props: elementProps, setRef: button.setRef };
}
