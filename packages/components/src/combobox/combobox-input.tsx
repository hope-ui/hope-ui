import { type CreateComboboxInputProps, createComboboxInput } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { composeEventHandlers } from "@hope-ui/primitives/utils";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxInputElementProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export interface ComboboxInputProps
  extends Omit<CreateComboboxInputProps, "textInput" | "onCommit" | "onRevert"> {
  /**
   * Renders as a different element/component while keeping the input's computed props — the
   * `role="combobox"`, the popup ARIA, the whole keymap and the text-entry value/handlers all ride
   * on them, so a target that spreads them keeps every one.
   *
   * The internal ref is merged into the single function ref `renderElement` passes down. It is
   * load-bearing twice over here: the input is the positioning anchor, the one element dismissal
   * excludes and modality spares, **and** the element `createTextInput`'s reconcile effect writes
   * into. A target that drops function refs leaves the popup unpositioned *and* the field
   * unwritable — no controlled value, no commit, no revert — with no error.
   */
  render?: RenderProp<ComboboxInputElementProps>;
  /** Merged over the recipe's `input` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The input part, and Combobox's **focus owner**: it keeps real DOM focus for the widget's whole
 * lifetime, open or closed, and points `aria-activedescendant` at the highlighted option. No option
 * is ever focused; `Combobox.Trigger` is not even in the tab order.
 *
 * `createComboboxInput` owns all of it — `role="combobox"`, `aria-autocomplete="list"`,
 * `aria-expanded`/`aria-controls` (open-gated, so a closed Combobox never carries a dangling IDREF),
 * the entire keymap, and the browser-suggestion attributes. This layer wires three Combobox-only
 * policies the kernel calls out to (`commit`, `revert`, and the typing hook that drives the filter),
 * adds the recipe `input` slot + `data-slot`, and does nothing else.
 *
 * **The value is not bound here.** `ctx.textInput` is the root-owned `createTextInput`, and its
 * `inputProps.value` is an untracked snapshot — a reconcile effect owns every DOM write after the
 * first, which is what makes suppressing the mid-IME-composition write possible at all. Adding a
 * second `value={…}` of your own puts a write where that file cannot veto it. See
 * `__internal__/primitives/internal/create-text-input.md`.
 *
 * **`onBeforeInput` is the veto, not `onInput`.** The native `input` event is not cancelable, so a
 * `preventDefault()` there does nothing. `onBeforeInput` is deliberately never consumed by the
 * kernel or by this part, so it forwards untouched and stops the change before `input` fires.
 *
 * **It needs an accessible name**, on every tree: an `aria-label`, or an `aria-labelledby` pointing
 * at the consumer's own `<label>`. Combobox ships no `Label` part (see `Combobox.Root`), and a
 * nameless `role="combobox"` is an axe `aria-input-field-name` violation — as is the
 * `role="listbox"` popup, which inherits its name from here.
 */
export const Input: Component<ComboboxInputProps> = (props) => {
  const ctx = useComboboxContext();

  const input = createComboboxInput(
    ctx.state,
    merge(omit(props, "render", "class"), {
      textInput: ctx.textInput,
      onCommit: ctx.commit,
      onRevert: ctx.revert,
      // Consumer first, then Combobox's typing policy, then (inside the hook) the text primitive's
      // own write. The policy runs before the value lands, which is all it needs: it sets the entry
      // strategy and opens, and reads nothing.
      get onInput() {
        return composeEventHandlers<HTMLInputElement, InputEvent>(
          props.onInput as JSX.EventHandlerUnion<HTMLInputElement, InputEvent> | undefined,
          ctx.onUserInput,
        );
      },
      get onFocus() {
        return composeEventHandlers<HTMLInputElement, FocusEvent>(
          props.onFocus as JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> | undefined,
          ctx.onUserFocus,
        );
      },
    }) as CreateComboboxInputProps,
  );

  const elementProps = merge(input.props, {
    get class(): string {
      return ctx.slots.input(props.class);
    },
    "data-slot": "combobox-input",
  });

  return renderElement<ComboboxInputElementProps, HTMLInputElement>({
    as: "input",
    render: props.render,
    props: elementProps,
    ref: input.setRef,
  });
};
