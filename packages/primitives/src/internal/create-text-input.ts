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
   * Consumer event handlers, composed consumer-first. Passed as accessors so they're read
   * reactively inside the prop getters.
   *
   * **`onInput` is not a cancel channel.** The repo-wide `preventDefault()` veto needs a
   * cancelable event and the native `input` event is not one, so `defaultPrevented` stays
   * `false` and the behavior runs anyway. A consumer that must reject a keystroke sets
   * `onBeforeInput` on the element — cancelable, and never consumed here.
   */
  onInput?: Accessor<JSX.InputEventHandlerUnion<T, InputEvent> | undefined>;
  onCompositionStart?: Accessor<JSX.EventHandlerUnion<T, CompositionEvent> | undefined>;
  onCompositionEnd?: Accessor<JSX.EventHandlerUnion<T, CompositionEvent> | undefined>;
}

/** The value + event props `createTextInput` spreads onto the rendered element. */
export interface TextInputBehaviorProps<T extends TextInputElement = HTMLInputElement> {
  /**
   * The initial markup value only — deliberately **not** a live binding. See the note on
   * ownership in `createTextInput`: the reconcile effect owns every subsequent write.
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
  // `setSelectionRange` throws `InvalidStateError` on input types that do not support
  // selection; `selectionStart` reads `null` on exactly those, so this is the type check.
  if (input.selectionStart == null) {
    return;
  }
  // Offsets past the end of a shorter new value need no clamping here: "set the selection of a
  // text control" clamps both to the API value's length (HTML standard).
  input.setSelectionRange(selection.start, selection.end, selection.direction);
}

/**
 * Text-entry value state: the controlled/uncontrolled dance plus the two things a hand-rolled
 * `onInput` gets wrong.
 *
 * **The DOM value is owned here, not by a JSX binding.** `inputProps.value` is an untracked
 * snapshot — enough for the server's markup and the hydrated element to agree — and a single
 * reconcile effect performs every write after that. A live `value={…}` binding would take the
 * write out of this file, and both fixes below depend on choosing *when* not to write:
 *
 * **IME composition.** Assigning `input.value` while a composition is in progress destroys the
 * candidate buffer: the half-typed CJK word is replaced by whatever the controlled round-trip
 * produced. So no write happens between `compositionstart` and `compositionend`, and the DOM is
 * authoritative for that window. `onChange` still fires per composition update, so a consumer
 * that filters as you type sees the intermediate text; one that shouldn't can gate on
 * `isComposing()`.
 *
 * **Selection preservation.** `input.value = next` moves the caret to the end whenever the new
 * value differs (HTML standard, the `value` setter). That is invisible until a controlled
 * consumer *transforms* what it is handed — uppercase it, trim it — at which point every
 * keystroke in the middle of a word teleports the caret. The caret is therefore captured on
 * `input` and reapplied after the write, clamped to the new length.
 *
 * A reconcile is requested per input event rather than only on value change, so the case where
 * a controlled consumer **rejects** the change (`value` stays put) still snaps the DOM back
 * instead of leaving it out of sync with the value the component reports.
 */
export function createTextInput<T extends TextInputElement = HTMLInputElement>(
  options: CreateTextInputOptions<T> = {},
): CreateTextInputReturn<T> {
  const [element, setElement] = createSignal<T>();
  const [isComposing, setIsComposing] = createSignal(false);
  // Bumped by every write request, so the reconcile effect runs even when the resolved value
  // did not change — the rejected-change case above.
  const [reconcileRequest, setReconcileRequest] = createSignal(0);

  const [value, setControlledValue] = createControllableState<string>({
    value: () => options.value?.(),
    defaultValue: () => options.defaultValue?.() ?? "",
    onChange: (next) => options.onChange?.(next),
  });

  // A one-shot instruction consumed by the next reconcile, not state: nothing renders from it,
  // and a signal would re-enter the effect that clears it.
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
    // Chrome fires the final `input` before `compositionend` and Safari after, so neither
    // ordering can be relied on — re-reading the DOM here commits the same text under both.
    const input = event.currentTarget;
    write(input.value, captureSelection(input));
  };

  const inputProps: TextInputBehaviorProps<T> = {
    get value() {
      // Deliberately untracked: the reconcile effect owns the write (see the doc above), so
      // this must never make the spread re-run one of its own. It is still a getter rather
      // than a captured constant, so a remounted element renders the current value.
      return untrack(value);
    },
    get onInput() {
      // Solid's `onInput` handler type narrows `event.target` to `T`, where
      // `composeEventHandlers` — generic over plain `Event` — types it as `Element`. The two
      // are compatible once `T` is a concrete element, but not while it is still a type
      // parameter, so the round trip is cast here rather than at every call site.
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
