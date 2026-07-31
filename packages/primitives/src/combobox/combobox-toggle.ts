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
 * `role="combobox"` **focus owner** Select's trigger is; putting it here would give the tree two
 * comboboxes, two `aria-activedescendant`s and two keymaps. The naming follows the *parts*
 * (`Select.Trigger`, `Combobox.Trigger`), which are the same affordance to a user and different
 * elements in the pattern.
 *
 * ## It is not in the tab order, and it never takes focus
 *
 * `tabindex="-1"`, because the input is the widget's single tab stop — a second one would make
 * Tabbing through a form of comboboxes take twice as many presses for no reachable behavior (every
 * key this button could offer is already on the input). React Aria spells it
 * `excludeFromTabOrder: true`.
 *
 * `preventDefault()` on `pointerdown` is the other half: a click that moved DOM focus here would
 * blur the input, drop the highlight's paint gate, fire the input's blur-commit, and leave
 * `aria-activedescendant` on an element that is no longer focused. React Aria spells that
 * `preventFocusOnPress: true`. The input is re-focused on click anyway, for the case where focus was
 * somewhere else entirely when the button was pressed.
 *
 * ## It still needs a name
 *
 * A bare chevron is an axe `button-name` violation and unusable by voice control, so it carries a
 * localized `aria-label` (`combobox.triggerLabel`) that a consumer can override. `aria-haspopup` is
 * **explicit** here, unlike on the input: `role="combobox"` implies `listbox` in ARIA 1.2, a
 * `<button>` implies nothing.
 */
export function createComboboxToggle<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: CreateComboboxToggleProps,
): CreateComboboxToggleReturn {
  const { t } = useLocale();

  const toggle = () => {
    // Focus the field first: the pointerdown above kept focus wherever it was, which is the input on
    // every normal path and somewhere else entirely when the widget was not focused at all.
    state.triggerElement()?.focus();
    if (!state.open()) {
      // A pointer open lands on the selected option — APG, and what `createComboboxTrigger` does.
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
        // Open-gated, like every IDREF in this family: the popup mounts lazily, and naming an
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
