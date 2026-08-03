import type { JSX } from "@solidjs/web";
import { type Accessor, createEffect, createSignal, untrack } from "solid-js";
import { composeEventHandlers } from "../utils/events";
import { createControllableState } from "./create-controllable-state";

/** Any element with a text-entry cursor: `<input>` and `<textarea>` share the whole selection API. */
export type TextInputElement = HTMLInputElement | HTMLTextAreaElement;

/** A caret position or range, in UTF-16 code units — the units `setSelectionRange` speaks. */
export interface TextInputSelection {
  start: number;
  end: number;
  direction?: "forward" | "backward" | "none";
}

export interface CreateTextInputOptions<T extends TextInputElement = HTMLInputElement> {
  /**
   * The controlled value. `undefined` means "uncontrolled". Pass an accessor over the prop
   * (`() => props.value`) so the read stays lazy.
   */
  value?: Accessor<string | undefined>;
  /** Initial value for uncontrolled usage. Read once, when the internal signal is created. */
  defaultValue?: Accessor<string>;
  /**
   * Called on every requested change: typing, each IME composition update, `compositionend`,
   * and a programmatic `setValue`.
   */
  onChange?: (value: string) => void;
  /**
   * Consumer event handlers, composed consumer-first. Accessors rather than plain handlers so the
   * prop getters re-read them reactively.
   *
   * **`onInput` cannot cancel.** Elsewhere a consumer vetoes behavior with `preventDefault()`, but
   * the native `input` event is not cancelable, so `defaultPrevented` stays `false` and the
   * behavior runs anyway. To reject a keystroke, set `onBeforeInput` on the element instead — it is
   * cancelable, and nothing here consumes it.
   */
  onInput?: Accessor<JSX.InputEventHandlerUnion<T, InputEvent> | undefined>;
  onCompositionStart?: Accessor<JSX.EventHandlerUnion<T, CompositionEvent> | undefined>;
  onCompositionEnd?: Accessor<JSX.EventHandlerUnion<T, CompositionEvent> | undefined>;
}

/** The value + event props `createTextInput` spreads onto the rendered element. */
export interface TextInputBehaviorProps<T extends TextInputElement = HTMLInputElement> {
  /**
   * The initial markup value only, deliberately **not** a live binding — the reconcile effect in
   * `createTextInput` owns every write after this one, for the reasons documented there.
   */
  readonly value: string;
  readonly onInput: JSX.InputEventHandler<T, InputEvent>;
  readonly onCompositionStart: JSX.EventHandler<T, CompositionEvent>;
  readonly onCompositionEnd: JSX.EventHandler<T, CompositionEvent>;
}

export interface CreateTextInputReturn<T extends TextInputElement = HTMLInputElement> {
  /** Spread onto the rendered element (via `renderElement`). */
  inputProps: TextInputBehaviorProps<T>;
  /** The resolved value — the controlled prop while controlled, the internal signal otherwise. */
  value: Accessor<string>;
  /**
   * Write the value programmatically. With no `selection` the caret lands where the browser
   * puts it (the end); pass one to place it — which is what inline autocomplete needs, so
   * "ca" → "café" can leave "fé" selected.
   */
  setValue: (value: string, selection?: TextInputSelection) => void;
  /** Whether an IME composition session is in progress. */
  isComposing: Accessor<boolean>;
  /** Ref callback for the rendered element; pass to `renderElement`'s `ref` (it merges refs). */
  setRef: (element: T) => void;
}

/** `null` on input types with no text-entry cursor (`email`, `number`, `color`, …). */
function captureSelection(input: TextInputElement): TextInputSelection | null {
  const { selectionStart, selectionEnd } = input;
  if (selectionStart == null || selectionEnd == null) {
    return null;
  }
  return {
    start: selectionStart,
    end: selectionEnd,
    direction: input.selectionDirection ?? "none",
  };
}

function applySelection(input: TextInputElement, selection: TextInputSelection): void {
  // `setSelectionRange` throws `InvalidStateError` on input types with no text cursor, and
  // `selectionStart` reads `null` on exactly those — so this is the type check.
  if (input.selectionStart == null) {
    return;
  }
  // No clamping needed for offsets past the end of a shorter value: the HTML spec clamps both to
  // the value's length.
  input.setSelectionRange(selection.start, selection.end, selection.direction);
}

/**
 * Text-entry value state — whether the consumer drives the value through a prop or lets this hook
 * hold it — plus the two things a hand-rolled `onInput` gets wrong. Both fixes turn on choosing
 * *when not to write*, so the DOM value is owned here rather than by a live `value={…}` JSX
 * binding: `inputProps.value` is a one-time snapshot for the initial markup, and a single reconcile
 * effect performs every write after it.
 *
 * - **IME composition.** Assigning `input.value` mid-composition destroys the candidate buffer, so
 *   the half-typed CJK word disappears. Nothing is written between `compositionstart` and
 *   `compositionend`; `onChange` still fires per update, and `isComposing()` gates those out.
 * - **Caret position.** Assigning a *different* `input.value` moves the caret to the end (HTML
 *   spec), so a consumer that transforms the text — uppercases it, trims it — teleports the caret
 *   on every keystroke typed mid-word. The caret is captured on `input` and reapplied after.
 *
 * A reconcile is requested per input event rather than per value change, so a consumer *rejecting*
 * a change still snaps the DOM back instead of drifting from the value reported by `value()`.
 * Details: __internal__/primitives/internal/create-text-input.md.
 */
export function createTextInput<T extends TextInputElement = HTMLInputElement>(
  options: CreateTextInputOptions<T> = {},
): CreateTextInputReturn<T> {
  const [element, setElement] = createSignal<T>();
  const [isComposing, setIsComposing] = createSignal(false);
  // Bumped by every write request, so the reconcile effect still runs when the resolved value did
  // not change — the rejected-change case above.
  const [reconcileRequest, setReconcileRequest] = createSignal(0);

  const [value, setControlledValue] = createControllableState<string>({
    value: () => options.value?.(),
    defaultValue: () => options.defaultValue?.() ?? "",
    onChange: (next) => options.onChange?.(next),
  });

  // A one-shot instruction for the next reconcile, not state: nothing renders from it, and as a
  // signal it would re-enter the very effect that clears it.
  let pendingSelection: TextInputSelection | null = null;

  const write = (next: string, selection: TextInputSelection | null) => {
    pendingSelection = selection;
    setControlledValue(next);
    setReconcileRequest((request) => request + 1);
  };

  createEffect(
    () => [element(), value(), isComposing(), reconcileRequest()] as const,
    ([input, next, composing]) => {
      const selection = pendingSelection;
      pendingSelection = null;
      if (input == null || composing || input.value === next) {
        return;
      }
      input.value = next;
      if (selection != null) {
        applySelection(input, selection);
      }
    },
  );

  const handleInput = (event: { currentTarget: T }) => {
    const input = event.currentTarget;
    write(input.value, captureSelection(input));
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (event: { currentTarget: T }) => {
    setIsComposing(false);
    // Chrome fires the final `input` before `compositionend`, Safari after — re-reading the DOM
    // here commits the same text under either ordering.
    const input = event.currentTarget;
    write(input.value, captureSelection(input));
  };

  const inputProps: TextInputBehaviorProps<T> = {
    get value() {
      // Untracked so the spread never subscribes to the value and re-runs on the reconcile
      // effect's own writes. Still a getter, not a constant, so a remounted element gets the
      // current value.
      return untrack(value);
    },
    get onInput() {
      // Solid types `event.target` as `T` here, while `composeEventHandlers` is generic over plain
      // `Event` and types it as `Element`. Those agree for any concrete element but not while `T`
      // is still a type parameter, so the round trip is cast once here instead of at every call.
      return composeEventHandlers<T, InputEvent>(
        options.onInput?.() as JSX.EventHandlerUnion<T, InputEvent> | undefined,
        handleInput,
      ) as JSX.InputEventHandler<T, InputEvent>;
    },
    get onCompositionStart() {
      return composeEventHandlers<T, CompositionEvent>(
        options.onCompositionStart?.(),
        handleCompositionStart,
      );
    },
    get onCompositionEnd() {
      return composeEventHandlers<T, CompositionEvent>(
        options.onCompositionEnd?.(),
        handleCompositionEnd,
      );
    },
  };

  return {
    inputProps,
    value,
    setValue: (next, selection) => write(next, selection ?? null),
    isComposing,
    setRef: setElement,
  };
}
