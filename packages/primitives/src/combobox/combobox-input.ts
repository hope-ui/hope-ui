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
   * value/handlers. `id`/`aria-labelledby` fall back to the consumer's; the rest is kernel-owned.
   */
  props: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Hand to the input's `ref`; registers it as the anchor, the one spared element, and the text
   *  primitive's element. */
  setRef: (element: HTMLInputElement) => void;
}

/**
 * The input part: Combobox's **focus owner**. It is the same role in the pattern that
 * `createComboboxTrigger` plays for Select — `role="combobox"` on the element that keeps real DOM
 * focus for the widget's whole lifetime, pointing `aria-activedescendant` at the active option — and
 * it exists as its own hook rather than as a mode of that one because the two agree on the ARIA and
 * disagree on almost everything else. See `## Rejected alternatives` in this part's doc.
 *
 * ## The keymap
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
 * Four rows of that table are the whole difference from the button trigger, and each is a bug if
 * copied across:
 *
 * **`Space` and every printable key are unbound.** They type. There is no typeahead here — react
 * aria spells the same decision `disallowTypeAhead: true` — because the input *is* the search
 * affordance and a second buffer would race the one the user can see.
 *
 * **`Home`/`End`/`PageUp`/`PageDown` are caret keys while closed** and list keys while open, which
 * is `useComboBox` chaining its collection handlers behind `state.isOpen &&`. Binding them
 * unconditionally would break jump-to-start in a field the user is editing.
 *
 * **Enter does not `preventDefault()` while closed**, so a combobox in a form still submits it.
 * (The button trigger must always `preventDefault()`, for the opposite reason: a native `<button>`
 * synthesizes a `click` from Enter, which would re-enter the toggle and close what it just opened.)
 *
 * **`ArrowLeft`/`ArrowRight` drop the highlight.** Moving the caret means the user is editing text
 * again, so an option that stays highlighted — and that Enter would then commit — is a trap.
 *
 * ## Commit and revert are policy, and policy is the component's
 *
 * The kernel owns no text value (`combobox-root.md`), so it cannot know what "commit" means: whether
 * free text is allowed, what the highlighted option's label is, what the last committed text was.
 * What it *does* own is the **binding** — which keys mean commit, whether each one
 * `preventDefault()`s, and that closing accompanies them — because a keymap split across two layers
 * is exactly the drift this kernel exists to prevent. So `onCommit`/`onRevert` arrive as callbacks,
 * the same seam `createListTypeahead`'s `onMatch` and `createCombobox`'s `shouldCloseOnSelect` use.
 *
 * ## The attributes that are not ARIA
 *
 * `autocomplete`/`autocorrect`/`autocapitalize`/`spellcheck` are all switched off: the widget
 * provides its own suggestions, and the browser's would overlay the popup with a second, unrelated
 * list. `spellcheck` in particular is what stops macOS Safari autocorrecting a half-typed query out
 * from under the filter. All four defer to a consumer's own value.
 *
 * `role="combobox"` **needs an accessible name** — a nameless one is an axe `aria-input-field-name`
 * violation. Combobox ships no `Label` part (see `combobox-root.md`), so that means an `aria-label`
 * or `aria-labelledby` from the consumer, on every tree.
 */
export function createComboboxInput<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: CreateComboboxInputProps,
): CreateComboboxInputReturn {
  const list = state.list;

  const openWith = (strategy: ComboboxFocusStrategy) => {
    // Strategy first, then open: both writes land in one flush, so the entry effect — which tracks
    // both — runs once, with the strategy this open asked for.
    state.setFocusStrategy(strategy);
    state.setOpen(true);
  };

  /** The list keys are inert while closed, where they are the text field's own caret keys. */
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
        // A closed combobox must let Escape reach whatever encloses it (a Dialog). React Aria
        // reverts here too and negotiates propagation per case; this kernel draws the simpler line,
        // matching the one `createComboboxTrigger` already draws.
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
      // `aria-haspopup="listbox"`, and react-aria's `useComboBox` omits it for that reason. The
      // chevron button carries an explicit one, because a `<button>` has no such implication.
      get "aria-autocomplete"() {
        // `"list"` — the popup suggests, it never writes into the field. `"both"` is inline
        // autocomplete, which needs `setValue(next, selection)` and is not built yet.
        return "list" as const;
      },
      get "aria-expanded"() {
        return state.open() ? ("true" as const) : ("false" as const);
      },
      get "aria-controls"() {
        // Only while open. The popup is mounted lazily, and an `aria-controls` naming an element
        // that is not in the DOM is an invalid IDREF (axe `aria-valid-attr-value`) — on every closed
        // Combobox on the page.
        return state.open() ? state.popupId() : undefined;
      },
      get "aria-activedescendant"() {
        // Same IDREF rule: the active index survives a close, so the attribute has to be gated on
        // the option actually being mounted.
        return state.open() ? list.focus.activeDescendant() : undefined;
      },
      get disabled() {
        return props.disabled ?? (list.disabled() || undefined);
      },
      // The browser's own suggestion machinery, off. Left as `??` fallbacks so a consumer who wants
      // the platform's autofill on a free-text combobox can say so.
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
        // The **string**, not `false`. `spellcheck` is an *enumerated* attribute (Solid types it
        // `EnumeratedPseudoBoolean`), so a JS `false` is serialized as an absent attribute — and an
        // absent `spellcheck` inherits, which on an `<input type="text">` means enabled. Silent, and
        // the whole point of setting it is that macOS Safari otherwise autocorrects a half-typed
        // query out from under the filter. React Aria spells it `'false'` for the same reason.
        return props.spellcheck ?? "false";
      },
      get onKeyDown() {
        // Consumer first, so their `preventDefault()` cancels the whole map at once.
        return composeEventHandlers<HTMLInputElement, KeyboardEvent>(
          props.onKeyDown,
          keys.onKeyDown,
        );
      },
      // The text primitive's handlers run *after* the consumer's, same as every other chain here.
      // `onInput` is not a cancel channel (the native event is not cancelable) — `onBeforeInput` is,
      // and it is deliberately left unconsumed so it forwards untouched through `rest`.
      //
      // Solid's `InputEventHandlerUnion`/`FocusEventHandlerUnion` narrow `event.target` to the real
      // element, where `composeEventHandlers` — generic over plain `Event` — types it as `Element`.
      // The round trip is cast here rather than widening the public prop types, which is the seam
      // `createTextInput` already documents.
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
      // The paint gate for the option highlight (`data-active`): the widget's focus lives here, so
      // this is the only place that can report it. React Aria's `manager.isFocused`.
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
