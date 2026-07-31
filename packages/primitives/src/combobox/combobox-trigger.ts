import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { createButton, createRegisteredId, type SelectionMode } from "../internal";
import { composeEventHandlers, createKeyboardHandler } from "../utils";
import type { ComboboxFocusStrategy, CreateComboboxReturn } from "./combobox-root";

export interface CreateComboboxTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether the rendered element is a native `<button>`. Default `true`. Set `false` when a `render`
   * prop swaps in something else, so `createButton` switches to `tabIndex`/`aria-disabled` and
   * synthesizes keyboard activation. A control prop, never spread as an attribute.
   */
  nativeButton?: boolean;
}

export interface CreateComboboxTriggerReturn {
  /**
   * Spread onto the trigger element: `role="combobox"` + the popup ARIA + the keymap + the button
   * behavior. `id`/`aria-labelledby` fall back to the consumer's; the rest is kernel-owned.
   */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Hand to the trigger element's `ref`; registers it as the anchor and the one spared element. */
  setRef: (element: HTMLButtonElement) => void;
}

/**
 * The trigger part: the **focus owner**. It keeps real DOM focus for the widget's whole lifetime —
 * open or closed — and points `aria-activedescendant` at the active option, which is what the APG
 * 1.2 combobox pattern asks for and what makes a popup that mounts lazily possible at all.
 *
 * It owns the entire keymap, because there is nowhere else for it to live: no option is ever
 * focused, so no option ever receives a keydown.
 *
 * | Key | Closed | Open |
 * | --- | --- | --- |
 * | `ArrowDown` / `Alt+ArrowDown` | open on the **first** option | next option |
 * | `ArrowUp` / `Alt+ArrowUp` | open on the **last** option | previous option; `Alt+ArrowUp` closes |
 * | `Enter` / `Space` | open on the **selected** option | select the active option |
 * | `Escape` | — | close |
 * | `Home` / `End` / `PageUp` / `PageDown` | — | delegate to `list.navigation` |
 * | printable | typeahead → **select**, popup stays shut | typeahead → highlight |
 *
 * Two things about that table are easy to get wrong and are pinned by tests:
 *
 * **Enter and Space `preventDefault()`.** On a native `<button>` the browser synthesizes a `click`
 * from both, which would re-enter the toggle below and close what the keydown just opened.
 *
 * **The navigation keys call `list.navigation` directly rather than composing
 * `navigation.onKeyDown`.** That handler binds the arrows too, so composing it would run `next()`
 * twice per ArrowDown. Only `typeahead.onKeyDown` is composed, and only because its printable-char
 * fallback fires exclusively for keys no binding above claimed.
 *
 * `role="combobox"` **needs an accessible name** — a nameless one is an axe `aria-input-field-name`
 * violation. With no `Label` part in scope (see `combobox-root.md`), that means an `aria-label` or
 * `aria-labelledby` from the consumer, on every tree.
 */
export function createComboboxTrigger<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: CreateComboboxTriggerProps,
): CreateComboboxTriggerReturn {
  const list = state.list;

  const openWith = (strategy: ComboboxFocusStrategy) => {
    // Strategy first, then open: both writes land in one flush, so the entry effect — which tracks
    // both — runs once, with the strategy this open asked for.
    state.setFocusStrategy(strategy);
    state.setOpen(true);
  };

  const close = () => {
    state.setOpen(false);
    // Focus has not moved (nothing here takes it away), so this is a no-op on the normal path. It
    // exists for the one that isn't: a consumer's `render` target, or chrome inside the popup, that
    // pulled focus off the trigger while it was open.
    state.triggerElement()?.focus();
  };

  /** The Home/End/Page keys are inert while closed — a closed trigger is a plain button. */
  const runWhenOpen = (event: KeyboardEvent, move: () => void) => {
    if (!state.open()) {
      return;
    }
    event.preventDefault();
    move();
  };

  const keys = createKeyboardHandler<HTMLButtonElement>()
    .on(["ArrowDown", "alt+ArrowDown"], (event) => {
      event.preventDefault();
      if (state.open()) {
        list.navigation.next();
        return;
      }
      openWith("first");
    })
    .on("ArrowUp", (event) => {
      event.preventDefault();
      if (state.open()) {
        list.navigation.prev();
        return;
      }
      openWith("last");
    })
    .on("alt+ArrowUp", (event) => {
      event.preventDefault();
      if (state.open()) {
        close();
        return;
      }
      openWith("last");
    })
    .on(["Enter", " "], (event) => {
      // See the doc above: without this a native button fires a synthesized `click`, and the toggle
      // closes what this just opened.
      event.preventDefault();
      if (!state.open()) {
        openWith("selected");
        return;
      }
      // `shouldCloseOnSelect` is applied by the root's wrapped `onChange`, so every path that
      // selects — this one, and an option's own click — closes on the same terms.
      list.selection.selectActive();
    })
    .on("Escape", (event) => {
      if (!state.open()) {
        // Deliberately no `preventDefault` and no handling: a closed combobox must let Escape reach
        // whatever encloses it (a Dialog).
        return;
      }
      event.preventDefault();
      close();
    })
    .on("Home", (event) => runWhenOpen(event, () => list.navigation.first()))
    .on("End", (event) => runWhenOpen(event, () => list.navigation.last()))
    .on("PageUp", (event) => runWhenOpen(event, () => list.navigation.pagePrev()))
    .on("PageDown", (event) => runWhenOpen(event, () => list.navigation.pageNext()));

  const toggle = () => {
    if (!state.open()) {
      // A pointer open lands on the selected option — APG, and what a native `<select>` does.
      openWith("selected");
      return;
    }
    state.setOpen(false);
  };

  const button = createButton<HTMLButtonElement>({
    disabled: () => list.disabled(),
    nativeButton: () => props.nativeButton ?? true,
    // Consumer first in every chain, so their `preventDefault()` cancels the kernel's behavior —
    // and, for the keymap, cancels the whole map at once.
    onClick: () => composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, toggle),
    onKeyDown: () =>
      composeEventHandlers<HTMLButtonElement, KeyboardEvent>(
        props.onKeyDown,
        keys.onKeyDown,
        list.typeahead.onKeyDown,
      ),
    onKeyUp: () => props.onKeyUp,
    onPointerDown: () => props.onPointerDown,
  });

  // Publish a consumer-supplied `id` up, so the list's `aria-labelledby` names the element that
  // actually exists rather than the generated fallback.
  createRegisteredId({ id: () => props.id, register: state.setTriggerId });

  const rest = omit(
    props,
    "nativeButton",
    "onClick",
    "onKeyDown",
    "onKeyUp",
    "onPointerDown",
    "onFocus",
    "onBlur",
  );

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(
    rest,
    button.buttonProps,
    {
      get id() {
        return props.id ?? state.triggerId();
      },
      // Wins over `createButton`'s `role` (`undefined` for a native button, `"button"` otherwise):
      // this element *is* the combobox, whatever it is rendered as.
      get role() {
        return "combobox" as const;
      },
      get "aria-haspopup"() {
        return "listbox" as const;
      },
      get "aria-expanded"() {
        return state.open() ? ("true" as const) : ("false" as const);
      },
      get "aria-controls"() {
        // Only while open. The popup is mounted lazily, and an `aria-controls` naming an element
        // that is not in the DOM is an invalid IDREF (axe `aria-valid-attr-value`) — on every closed
        // Select on the page.
        return state.open() ? state.popupId() : undefined;
      },
      get "aria-activedescendant"() {
        // Same IDREF rule: the active index survives a close (and closed typeahead can set one in
        // multiple mode), so the attribute has to be gated on the option actually being mounted.
        return state.open() ? list.focus.activeDescendant() : undefined;
      },
      get "aria-labelledby"() {
        const own = props["aria-labelledby"];
        const value = state.valueId();
        if (value == null) {
          return own;
        }
        // The value first — react-aria's `useSelect` ordering, so the current selection is announced
        // before the field's label. When the consumer named the trigger with `aria-label`, the
        // trigger also names *itself*: `aria-labelledby` outranks `aria-label` in the accname
        // algorithm, so without the self-reference their label would simply vanish.
        const label =
          own ?? (props["aria-label"] != null ? (props.id ?? state.triggerId()) : undefined);
        return label == null ? value : `${value} ${label}`;
      },
      // The paint gate for the option highlight (`data-active`): the widget's focus lives here, so
      // this is the only place that can report it. React-aria's `manager.isFocused`.
      get onFocus() {
        return composeEventHandlers<HTMLButtonElement, FocusEvent>(props.onFocus, () =>
          list.focus.setFocused(true),
        );
      },
      get onBlur() {
        return composeEventHandlers<HTMLButtonElement, FocusEvent>(props.onBlur, () =>
          list.focus.setFocused(false),
        );
      },
    },
  );

  return {
    props: elementProps,
    setRef: (element) => {
      state.setTriggerElement(element);
      button.setRef(element);
    },
  };
}
