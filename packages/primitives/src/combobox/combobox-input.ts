import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { type CreateTextInputReturn, createRegisteredId, type SelectionMode } from "../internal";
import { composeEventHandlers, createKeyboardHandler } from "../utils";
import type { ComboboxFocusStrategy, CreateComboboxReturn } from "./combobox-root";

export interface CreateComboboxInputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value"> {
  /**
   * The text-entry state, created by the **root** (a Combobox's `inputValue` is a root-level prop,
   * and the filter that derives from it has to be readable before this part mounts). This hook does
   * not own it — it composes the consumer's `onInput`/composition handlers in front of it and
   * spreads the result. A control prop, never spread as an attribute.
   */
  textInput: CreateTextInputReturn<HTMLInputElement>;
  /**
   * Accept the current suggestion. Bound to **Enter**, **Tab** and blur. Must be idempotent: Tab
   * fires it and then blur fires it again, and a pointer-away fires only the second.
   */
  onCommit?: () => void;
  /** Restore the last committed text. Bound to **Escape**, and only while the popup is open. */
  onRevert?: () => void;
}

export interface CreateComboboxInputReturn {
  /**
   * Spread onto the `<input>`: `role="combobox"` + the popup ARIA + the keymap + the text-entry
   * value/handlers. `id`/`aria-labelledby` fall back to the consumer's; the rest is owned here.
   */
  props: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Hand to the input's `ref`; registers it as the positioning anchor, as the one element modality
   *  and dismissal must leave alone, and as the text primitive's element. */
  setRef: (element: HTMLInputElement) => void;
}

/**
 * The input part: Combobox's **focus owner**. `role="combobox"` on the element that keeps real DOM
 * focus for the widget's whole lifetime, pointing `aria-activedescendant` at the highlighted option
 * — the same role `createComboboxTrigger` plays for Select. Separate hooks, because the two agree on
 * the ARIA and disagree on nearly everything else.
 *
 * | Key | Closed | Open |
 * | --- | --- | --- |
 * | `ArrowDown` / `Alt+ArrowDown` | open on the **first** option | next option |
 * | `ArrowUp` / `Alt+ArrowUp` | open on the **last** option | previous option; `Alt+ArrowUp` closes |
 * | `Enter` | *unbound* — the form submits | commit, close |
 * | `Tab` | *unbound* | commit, and let focus leave |
 * | `Escape` | *unbound* — it belongs to whatever encloses this | revert, close |
 * | `Home` / `End` / `PageUp` / `PageDown` | *unbound* — caret keys | delegate to `list.navigation` |
 * | `ArrowLeft` / `ArrowRight` | *unbound* | drop the highlight, then move the caret |
 * | printable, `Space` | *unbound* — they type | *unbound* — they type |
 *
 * Four of those rows differ from the button trigger, and copying that hook's binding across breaks
 * each one:
 *
 * - **`Space` and every printable key type**, so there is no typeahead (type-to-jump matching) here:
 *   the input *is* the search affordance, and a second hidden buffer would race the visible one.
 * - **`Home`/`End`/`PageUp`/`PageDown` are caret keys while closed.** Binding them unconditionally
 *   breaks jump-to-start in a field the user is editing.
 * - **Enter does not `preventDefault()` while closed**, so a combobox in a form still submits it.
 *   (The button trigger must always cancel it — see `combobox-trigger.ts`.)
 * - **`ArrowLeft`/`ArrowRight` drop the highlight.** Moving the caret means the user is editing text
 *   again, and an option still highlighted is one Enter away from being committed by mistake.
 *
 * **Commit and revert are the component's policy, not this hook's.** Whether free text is allowed,
 * what a highlighted option's label is, what was last committed — none of it is knowable here, since
 * this family owns no text value. What it does own is the *binding*: which keys mean commit, whether
 * each cancels the default, and that closing goes with them. Hence the `onCommit`/`onRevert`
 * callbacks.
 *
 * `role="combobox"` **needs an accessible name**, and there is no `Label` part — so every tree owes
 * an `aria-label` or `aria-labelledby` from the consumer, or axe reports `aria-input-field-name`.
 * Full rationale: `__internal__/primitives/combobox/combobox-input.md`.
 */
export function createComboboxInput<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: CreateComboboxInputProps,
): CreateComboboxInputReturn {
  const list = state.list;

  const openWith = (strategy: ComboboxFocusStrategy) => {
    // Strategy first, then open. Solid batches both writes into one flush, so the root's entry effect
    // — which tracks both — runs once, with the strategy this open asked for.
    state.setFocusStrategy(strategy);
    state.setOpen(true);
  };

  /** The list keys do nothing while closed, where they are the text field's own caret keys. */
  const runWhenOpen = (event: KeyboardEvent, move: () => void) => {
    if (!state.open()) {
      return;
    }
    event.preventDefault();
    move();
  };

  const keys = createKeyboardHandler<HTMLInputElement>()
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
        state.setOpen(false);
        return;
      }
      openWith("last");
    })
    .on("Enter", (event) => {
      if (!state.open()) {
        // Deliberately no `preventDefault` and no handling: a closed combobox in a form must still
        // submit it on Enter.
        return;
      }
      event.preventDefault();
      props.onCommit?.();
      state.setOpen(false);
    })
    .on("Tab", () => {
      if (!state.open()) {
        return;
      }
      // No `preventDefault`: focus has to leave. The popup closes on its own — `createDismissable`'s
      // focus-outside channel sees focus land elsewhere — so committing is all there is to do here.
      props.onCommit?.();
    })
    .on("Escape", (event) => {
      if (!state.open()) {
        // A closed combobox must let Escape reach whatever encloses it — a Dialog it sits inside
        // has to still close. Same line `createComboboxTrigger` draws.
        return;
      }
      event.preventDefault();
      props.onRevert?.();
      state.setOpen(false);
    })
    .on("Home", (event) => runWhenOpen(event, () => list.navigation.first()))
    .on("End", (event) => runWhenOpen(event, () => list.navigation.last()))
    .on("PageUp", (event) => runWhenOpen(event, () => list.navigation.pagePrev()))
    .on("PageDown", (event) => runWhenOpen(event, () => list.navigation.pageNext()))
    .on(["ArrowLeft", "ArrowRight"], () => {
      // No `preventDefault` — the caret still moves. Dropping the highlight is the point: the user
      // is editing text again, and an option that stayed highlighted is one Enter away from being
      // committed by mistake.
      list.focus.focusIndex(-1);
    });

  // Publish a consumer-supplied `id` up, so the list's `aria-labelledby` names the element that
  // actually exists rather than the generated fallback.
  createRegisteredId({ id: () => props.id, register: state.setTriggerId });

  const rest = omit(
    props,
    "textInput",
    "onCommit",
    "onRevert",
    "onKeyDown",
    "onInput",
    "onCompositionStart",
    "onCompositionEnd",
    "onFocus",
    "onBlur",
  );

  const elementProps: JSX.InputHTMLAttributes<HTMLInputElement> = merge(
    rest,
    props.textInput.inputProps,
    {
      get id() {
        return props.id ?? state.triggerId();
      },
      get type() {
        return props.type ?? "text";
      },
      get role() {
        return "combobox" as const;
      },
      // `aria-haspopup` is deliberately absent: ARIA 1.2 gives `role="combobox"` an implicit
      // `aria-haspopup="listbox"`. The chevron button carries an explicit one, since a plain
      // `<button>` implies nothing.
      get "aria-autocomplete"() {
        // `"list"` — the popup suggests, it never writes into the field. `"both"` means inline
        // autocomplete, which needs `setValue(next, selection)` and is not built yet.
        return "list" as const;
      },
      get "aria-expanded"() {
        return state.open() ? ("true" as const) : ("false" as const);
      },
      get "aria-controls"() {
        // Only while open: the popup mounts lazily, and an `aria-controls` naming an element that
        // is not in the DOM is an invalid IDREF — axe `aria-valid-attr-value`, on every closed
        // Combobox on the page.
        return state.open() ? state.popupId() : undefined;
      },
      get "aria-activedescendant"() {
        // Same IDREF rule: the active index survives a close, so this has to be gated on the option
        // actually being mounted.
        return state.open() ? list.focus.activeDescendant() : undefined;
      },
      get disabled() {
        return props.disabled ?? (list.disabled() || undefined);
      },
      // The browser's own suggestion machinery, off — it would overlay the popup with a second,
      // unrelated list. `??` fallbacks, so a consumer who wants platform autofill can say so.
      get autocomplete() {
        return props.autocomplete ?? "off";
      },
      get autocorrect() {
        return props.autocorrect ?? "off";
      },
      get autocapitalize() {
        return props.autocapitalize ?? "none";
      },
      get spellcheck() {
        // The **string** `"false"`, not the boolean. `spellcheck` is an *enumerated* attribute, so a
        // JS `false` serializes to an absent attribute — and an absent `spellcheck` inherits, which
        // on an `<input type="text">` means enabled. The failure is silent, and what it costs is
        // macOS Safari autocorrecting a half-typed query out from under the filter.
        return props.spellcheck ?? "false";
      },
      get onKeyDown() {
        // Consumer first, so their `preventDefault()` cancels the whole map at once.
        return composeEventHandlers<HTMLInputElement, KeyboardEvent>(
          props.onKeyDown,
          keys.onKeyDown,
        );
      },
      // `onInput` is not a cancel channel — the native event is not cancelable. `onBeforeInput` is,
      // and it is deliberately left unconsumed so it forwards untouched through `rest`.
      //
      // The casts are a type round-trip, not a behavior change: Solid's handler unions narrow
      // `event.target` to the real element, while `composeEventHandlers` is generic over plain
      // `Event` and types it as `Element`. Cast here rather than widening the public prop types.
      get onInput() {
        return composeEventHandlers<HTMLInputElement, InputEvent>(
          props.onInput as JSX.EventHandlerUnion<HTMLInputElement, InputEvent> | undefined,
          props.textInput.inputProps.onInput as JSX.EventHandlerUnion<HTMLInputElement, InputEvent>,
        ) as JSX.InputEventHandler<HTMLInputElement, InputEvent>;
      },
      get onCompositionStart() {
        return composeEventHandlers<HTMLInputElement, CompositionEvent>(
          props.onCompositionStart,
          props.textInput.inputProps.onCompositionStart,
        );
      },
      get onCompositionEnd() {
        return composeEventHandlers<HTMLInputElement, CompositionEvent>(
          props.onCompositionEnd,
          props.textInput.inputProps.onCompositionEnd,
        );
      },
      // The paint gate for the option highlight (`data-active`): the widget's DOM focus never leaves
      // this element, so this is the only place that can report whether the widget is focused.
      get onFocus() {
        return composeEventHandlers<HTMLInputElement, FocusEvent>(
          props.onFocus as JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> | undefined,
          () => list.focus.setFocused(true),
        );
      },
      get onBlur() {
        return composeEventHandlers<HTMLInputElement, FocusEvent>(
          props.onBlur as JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> | undefined,
          () => {
            list.focus.setFocused(false);
            // Focus genuinely left the widget: a click on an option or on the chevron never gets
            // here, because both `preventDefault()` their pointerdown to keep focus in the field.
            props.onCommit?.();
          },
        );
      },
    },
  );

  return {
    props: elementProps,
    setRef: (element) => {
      state.setTriggerElement(element);
      props.textInput.setRef(element);
    },
  };
}
