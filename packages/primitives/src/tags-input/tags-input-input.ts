import type { JSX } from "@solidjs/web";
import { type Accessor, merge, omit, untrack } from "solid-js";
import { createTextInput } from "../internal";
import { composeEventHandlers, createKeyboardHandler, withDefaults } from "../utils";
import type { CreateTagsInputReturn } from "./tags-input-root";

/**
 * What a blur that genuinely leaves the widget does with the text still in the field.
 *
 * - `"keep"` (default) — leave the draft alone.
 * - `"add"` — commit it, exactly as Enter would.
 * - `"clear"` — discard it.
 */
export type TagsInputBlurBehavior = "keep" | "add" | "clear";

export interface CreateTagsInputInputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue"> {
  /**
   * Controlled **draft text** — the half-typed tag, not the tag list (that is the root's `value`).
   * Omit for uncontrolled use.
   */
  value?: string;
  /** Initial draft text, uncontrolled. Default `""`. */
  defaultValue?: string;
  /** Called on every draft-text change: typing, each IME update, a commit, a paste, a blur clear. */
  onValueChange?: (value: string) => void;
  /** See {@link TagsInputBlurBehavior}. Default `"keep"`. */
  blurBehavior?: TagsInputBlurBehavior;
}

export interface CreateTagsInputInputReturn {
  /**
   * Spread onto the `<input>`: the draft value + its handlers, the whole `D5` keymap, paste, and the
   * `D7` field pass-throughs. `ref` is omitted — hand the element to
   * {@link CreateTagsInputInputReturn.setRef} instead.
   */
  props: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "ref">;
  /** Hand to the input's `ref`. Registers it as the widget's focus target **and** as the text
   *  primitive's element; without it every `D10` path and every arrow-past-the-end silently no-ops. */
  setRef: (element: HTMLInputElement) => void;
  /** The draft text. */
  value: Accessor<string>;
  /** Write the draft text programmatically. */
  setValue: (value: string) => void;
  /** Whether an IME composition session is in progress (`D5`'s first guard). */
  isComposing: Accessor<boolean>;
}

/**
 * The text field: the widget's single tab stop (`D2`), the only place text becomes tags, and the
 * bridge into the chip row.
 *
 * | Key | Behavior |
 * | --- | --- |
 * | printable | types |
 * | the delimiter character | commits what is in the field; never typed literally |
 * | `Enter`, field has text | commit, `preventDefault()` |
 * | `Enter`, field empty | *unbound, no `preventDefault()`* — the enclosing form submits |
 * | `Backspace`, field empty | remove the **last** chip (one step, no highlight-first) |
 * | `Backspace`, field has text | *unbound* — it deletes a character |
 * | `ArrowLeft` at caret 0 with tags present (LTR; `ArrowRight` under RTL) | focus the **last** chip |
 * | `Home` / `End` / `Escape` / `Delete` | *unbound* — caret keys, and Escape belongs to whatever encloses this |
 * | paste | splice at the caret, then commit the whole field |
 *
 * ## The IME guard returns before anything else (`D5`)
 *
 * A CJK candidate confirmation arrives as `Enter`, so committing on it turns a half-typed word into a
 * tag. Both channels are checked — `isComposing()`, this hook's own truth from `createTextInput`, and
 * `keyCode === 229`, the legacy/Safari backstop Base UI checks in `ComboboxInput.tsx`. No test that
 * types ASCII can ever catch a regression here.
 *
 * ## Enter on an empty field is deliberately unhandled
 *
 * No binding and no `preventDefault()`, so a tags input inside a `<form>` still submits it — the same
 * line `createComboboxInput` draws for a closed combobox. Enter *with* text commits and cancels.
 *
 * ## Every path funnels through `state.add`
 *
 * Enter, the delimiter key, a paste and a blur commit all call {@link CreateTagsInputReturn.add} and
 * assign whatever it hands back as the new draft. The split, the `parse`, the dedupe, the `max`
 * partial-accept and the "which text survives a rejection" rule are `D4`'s, decided once in the root;
 * a path that reimplemented any of them would drift from the other three.
 *
 * Full rationale: `__internal__/primitives/tags-input/tags-input-input.md`.
 */
export function createTagsInputInput<V = string>(
  state: CreateTagsInputReturn<V>,
  props: CreateTagsInputInputProps = {},
): CreateTagsInputInputReturn {
  const merged = withDefaults(props, { blurBehavior: "keep" as TagsInputBlurBehavior });

  // Created **here**, not taken as a control prop the way `createComboboxInput` takes one: a Combobox
  // exposes `inputValue` at its root because its filter derives from it, while `createTagsInput`
  // deliberately owns no text value — so there is nothing at the root for a shared instance to live
  // beside. See the doc's `## Rejected alternatives`.
  const textInput = createTextInput<HTMLInputElement>({
    value: () => merged.value,
    defaultValue: () => merged.defaultValue ?? "",
    onChange: (next) => merged.onValueChange?.(next),
  });

  const commit = (text: string) => {
    const result = state.add(text);
    // `D4` decides what stays in the field, not this hook — kept for `max`/`invalid`, cleared for a
    // duplicate — so assigning `inputText` verbatim is the whole rule.
    textInput.setValue(result.inputText);
    return result;
  };

  const isRtl = () => state.direction() === "rtl";

  /** A collapsed caret at the very start: the only position from which the chip row is one arrow away. */
  const isCaretAtStart = (input: HTMLInputElement) =>
    input.selectionStart === 0 && input.selectionEnd === 0;

  const enterChipRow = (event: { currentTarget: HTMLInputElement } & KeyboardEvent) => {
    if (!isCaretAtStart(event.currentTarget) || state.value().length === 0) {
      return;
    }
    event.preventDefault();
    // `last()`, not `prev()`: nothing is active yet, and the chip nearest the caret is the last one.
    // It lands on the last *focusable* chip, so a disabled tail is skipped.
    state.navigation.last();
  };

  const keys = createKeyboardHandler<HTMLInputElement>()
    .on("Enter", (event) => {
      const text = event.currentTarget.value;
      if (text === "") {
        // Unbound on purpose, `preventDefault()` included: an empty field means the user is done, and
        // an enclosing form must still receive the Enter.
        return;
      }
      event.preventDefault();
      commit(text);
    })
    .on("Backspace", (event) => {
      const input = event.currentTarget;
      // With text in the field this is a character deletion; with a chip highlighted the chip owns
      // the key (roving focus means it also has DOM focus, so this is belt and braces).
      if (input.value !== "" || state.focus.activeIndex() >= 0) {
        return;
      }
      event.preventDefault();
      state.removeLast();
    })
    // The bridge arrow is the one that moves the caret toward the *start of the text*, which is
    // ArrowLeft in LTR and ArrowRight in RTL — the same flip `createListNavigation` applies inside
    // the row. Mirrored by hand here because that handler has no way to redirect into a text field.
    .on("ArrowLeft", (event) => {
      if (!isRtl()) {
        enterChipRow(event);
      }
    })
    .on("ArrowRight", (event) => {
      if (isRtl()) {
        enterChipRow(event);
      }
    })
    .onText((char, event) => {
      if (char !== state.delimiter()) {
        return;
      }
      // The delimiter is a commit key, never literal text, so it is always cancelled. With nothing
      // typed there is nothing to commit and no rejection to report — a stray comma just disappears.
      event.preventDefault();
      const text = event.currentTarget.value;
      if (text !== "") {
        commit(text);
      }
    });

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (event) => {
    // `D5`: first, before anything else. `keyCode` is deprecated everywhere except here — during an
    // IME session Safari and older WebKit report `229` while `isComposing()` has not flipped yet.
    if (textInput.isComposing() || event.keyCode === 229) {
      return;
    }
    keys.onKeyDown(event);
  };

  const handlePaste: JSX.EventHandler<HTMLInputElement, ClipboardEvent> = (event) => {
    if (!state.isInteractive()) {
      return;
    }
    const pasted = event.clipboardData?.getData("text/plain") ?? "";
    if (pasted === "") {
      // A non-text paste (an image, a file): nothing to split, so leave it to the browser.
      return;
    }
    event.preventDefault();
    const input = event.currentTarget;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    // Spliced into the draft rather than committed on its own, so pasting `b,c` after typing `a`
    // commits `ab` and `c` — the same text the user would have got by typing it.
    commit(input.value.slice(0, start) + pasted + input.value.slice(end));
  };

  /**
   * The mirror of the row's check in `tags-input-list.ts`: the chip row is inside the widget and
   * outside this element, so asking only "did focus leave the input" would report a widget exit every
   * time ArrowLeft handed focus to a chip.
   */
  const holdsWidgetFocus = (input: HTMLElement) => {
    const active = input.ownerDocument.activeElement;
    if (active == null) {
      return false;
    }
    return active === input || (state.listElement()?.contains(active) ?? false);
  };

  const applyBlurBehavior = (input: HTMLInputElement) => {
    const text = input.value;
    if (text === "" || merged.blurBehavior === "keep") {
      return;
    }
    if (merged.blurBehavior === "add") {
      commit(text);
      return;
    }
    textInput.setValue("");
  };

  const handleBlur = (event: { currentTarget: HTMLInputElement }) => {
    const input = event.currentTarget;
    // Decided on the next task rather than from `event.relatedTarget`, for the reason
    // `createTagsInputList` and `calendar-group.ts` both give: removing a chip destroys the element
    // that had focus, which blurs with a null `relatedTarget` — at this instant indistinguishable
    // from tabbing away — and the focus re-homing that follows lands in the same flush.
    setTimeout(() => {
      untrack(() => {
        if (!input.isConnected || holdsWidgetFocus(input)) {
          return;
        }
        state.focus.setFocused(false);
        // Only on a real widget exit. Clicking a chip's ✕ blurs this field, and committing there
        // would turn a half-typed draft into a tag as a side effect of deleting a *different* one.
        applyBlurBehavior(input);
      });
    });
  };

  const handleFocus = () => {
    untrack(() => {
      state.focus.setFocused(true);
      // The caret is in the field, so no chip is highlighted — `D10`'s invariant, applied to every
      // arrival here and not just the ones `state.focusInput()` routes. Without it, tabbing away
      // from a chip and back would land on the field with a chip still painting `data-active`, and
      // Backspace-on-empty would then refuse to remove anything.
      state.focus.focusIndex(-1);
    });
  };

  const rest = omit(
    merged,
    "value",
    "defaultValue",
    "onValueChange",
    "blurBehavior",
    "onKeyDown",
    "onInput",
    "onPaste",
    "onCompositionStart",
    "onCompositionEnd",
    "onFocus",
    "onBlur",
  );

  const elementProps: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "ref"> = merge(
    rest,
    textInput.inputProps,
    {
      get id() {
        return merged.id ?? `${state.id()}-input`;
      },
      get type() {
        return merged.type ?? "text";
      },
      get disabled() {
        return merged.disabled ?? (state.disabled() || undefined);
      },
      get readonly() {
        return merged.readonly ?? (state.readOnly() || undefined);
      },
      // `required` is deliberately **absent**. The field is empty the moment a tag is committed, so a
      // native `required` here would block every submit of a form that already holds three tags. `D6`
      // puts it on a clipped control whose value tracks the tag list instead (`HiddenTagsField`).
      get "aria-invalid"() {
        return merged["aria-invalid"] ?? state.ariaInvalid();
      },
      get "aria-describedby"() {
        return merged["aria-describedby"] ?? state.ariaDescribedBy();
      },
      // The browser's own text machinery, off — autocorrect rewriting a half-typed email address into
      // a different one is silent and unrecoverable. `??` fallbacks, so a consumer can opt back in.
      get autocomplete() {
        return merged.autocomplete ?? "off";
      },
      get autocorrect() {
        return merged.autocorrect ?? "off";
      },
      get autocapitalize() {
        return merged.autocapitalize ?? "none";
      },
      get spellcheck() {
        // The **string**, not the boolean: `spellcheck` is an *enumerated* attribute, so a JS `false`
        // serializes to an absent attribute — and an absent one inherits, which on a text input means
        // enabled. Same trap, and the same fix, as `combobox-input.ts`.
        return merged.spellcheck ?? "false";
      },
      get onKeyDown() {
        // Consumer first, so their `preventDefault()` cancels the whole map at once.
        return composeEventHandlers<HTMLInputElement, KeyboardEvent>(
          merged.onKeyDown,
          handleKeyDown,
        );
      },
      get onInput() {
        // `D4`'s flash lifecycle: the duplicate highlight lives until the next keystroke, and this is
        // the only place that clears it. `onInput` is not a cancel channel — the native event is not
        // cancelable — so a consumer wanting to reject a keystroke uses `onBeforeInput`, which nothing
        // here consumes and `rest` forwards untouched.
        //
        // The casts are a type round-trip, not a behavior change: Solid narrows `event.target` to the
        // real element while `composeEventHandlers` is generic over plain `Event`.
        return composeEventHandlers<HTMLInputElement, InputEvent>(
          merged.onInput as JSX.EventHandlerUnion<HTMLInputElement, InputEvent> | undefined,
          textInput.inputProps.onInput as JSX.EventHandlerUnion<HTMLInputElement, InputEvent>,
          () => state.clearDuplicate(),
        ) as JSX.InputEventHandler<HTMLInputElement, InputEvent>;
      },
      get onPaste() {
        return composeEventHandlers<HTMLInputElement, ClipboardEvent>(merged.onPaste, handlePaste);
      },
      get onCompositionStart() {
        return composeEventHandlers<HTMLInputElement, CompositionEvent>(
          merged.onCompositionStart,
          textInput.inputProps.onCompositionStart,
        );
      },
      get onCompositionEnd() {
        return composeEventHandlers<HTMLInputElement, CompositionEvent>(
          merged.onCompositionEnd,
          textInput.inputProps.onCompositionEnd,
        );
      },
      get onFocus() {
        return composeEventHandlers<HTMLInputElement, FocusEvent>(
          merged.onFocus as JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> | undefined,
          handleFocus,
        );
      },
      get onBlur() {
        return composeEventHandlers<HTMLInputElement, FocusEvent>(
          merged.onBlur as JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> | undefined,
          handleBlur,
        );
      },
    },
  );

  return {
    props: elementProps,
    setRef: (element) => {
      state.setInputElement(element);
      textInput.setRef(element);
    },
    value: textInput.value,
    setValue: (next) => textInput.setValue(next),
    isComposing: textInput.isComposing,
  };
}
