import { useLocale } from "@hope-ui/i18n";
import type { JSX } from "@solidjs/web";
import { type Accessor, merge, omit } from "solid-js";
import { createButton } from "../internal";
import { composeEventHandlers } from "../utils";
import type { CreateTagsInputReturn } from "./tags-input-root";

export interface CreateTagsInputClearProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether the rendered element is a native `<button>`. Default `true`. Set `false` when a `render`
   * prop swaps in something else. A control prop, never spread as an attribute.
   */
  nativeButton?: boolean;
}

export interface CreateTagsInputClearReturn {
  /** Spread onto the clear button. The localized label and the tab-order exclusion are owned here;
   *  everything else the consumer passes is forwarded. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Hand to the button's `ref`; wires `createButton`'s press engine. */
  setRef: (element: HTMLButtonElement) => void;
  /** Whether there is nothing to clear, or the widget refuses mutations. Also the `disabled`
   *  attribute — read it to render the button *absent* instead. */
  isDisabled: Accessor<boolean>;
  /** The localized `"Clear all tags"` — the button's accessible name. */
  label: Accessor<string>;
}

/**
 * Clear-all. A real `<button>` over `createButton`, named from `tagsInput.clearLabel` because the
 * glyph inside it has no accessible name of its own (axe `button-name`).
 *
 * ## It clears every **removable** tag
 *
 * `state.clear()` keeps disabled tags, deliberately: they are not individually removable either, so a
 * Clear that took them would be the one way to delete a tag the widget says cannot be deleted. That
 * is also why {@link CreateTagsInputClearReturn.isDisabled} asks whether a *removable* tag exists
 * rather than whether the list is empty — a row of nothing but disabled chips has nothing to clear.
 *
 * ## `tabindex="-1"`, and focus lands back in the field
 *
 * The field is the widget's single tab stop (`D2`), so this button is reached by pointer — the same
 * call `combobox-clear.ts` makes for the same reason. Keyboard users clear by holding Backspace on an
 * empty field, which removes one chip per repeat.
 *
 * The click order is `D10`'s pointer path, unchanged from the chip's ✕: **focus the field first, then
 * mutate.** With a non-negative active index, `createListFocus`'s re-homing effect fires on the
 * collection change and yanks DOM focus onto a surviving chip; `state.focusInput()` clears the index
 * first, which makes that effect return early. `pointerdown` is cancelled so the press never moves
 * focus onto a button that is about to become disabled.
 *
 * Full rationale: `__internal__/primitives/tags-input/tags-input-clear.md`.
 */
export function createTagsInputClear<V = string>(
  state: CreateTagsInputReturn<V>,
  props: CreateTagsInputClearProps = {},
): CreateTagsInputClearReturn {
  const { t } = useLocale();

  const hasRemovableTag = () => state.value().some((tag) => !state.isItemDisabled(tag));
  const isDisabled = () => !state.isInteractive() || !hasRemovableTag();
  const label = () => t("tagsInput.clearLabel");

  const clear = () => {
    if (isDisabled()) {
      return;
    }
    // `D10`, and the order is the whole point — see the hook's doc above.
    state.focusInput();
    state.clear();
  };

  const button = createButton<HTMLButtonElement>({
    disabled: isDisabled,
    nativeButton: () => props.nativeButton ?? true,
    onClick: () => composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, clear),
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
        return props["aria-label"] ?? label();
      },
      // Component-owned (`D2`): the field is the widget's single tab stop.
      get tabIndex() {
        return -1;
      },
    },
  );

  return { props: elementProps, setRef: button.setRef, isDisabled, label };
}
