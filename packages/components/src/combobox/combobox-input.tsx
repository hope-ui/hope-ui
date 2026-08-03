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
   * on them.
   *
   * The internal ref rides along, and it is load-bearing twice over: this element is spared from the
   * "click outside closes" and "everything else goes inert" rules while open, **and** it is the
   * element the text state writes its value into. A target that drops function refs leaves the popup
   * mis-behaved *and* the field unwritable — no controlled value, no commit, no revert — with no error.
   */
  render?: RenderProp<ComboboxInputElementProps>;
  /** Merged over the recipe's `input` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The input part, and Combobox's **focus owner**: it keeps real DOM focus for the widget's whole
 * lifetime, open or closed, and names the highlighted option through `aria-activedescendant`. No
 * option is ever focused, and `Combobox.Trigger` is not even in the tab order.
 *
 * `createComboboxInput` owns all of it — `role="combobox"`, `aria-autocomplete="list"`, the popup ARIA
 * (gated on open, so a closed Combobox never carries an `aria-controls` pointing at an unmounted
 * element), the keymap, and the attributes that switch off the browser's own suggestions. This layer
 * only wires in the three Combobox-level policies that hook calls out to, and adds the recipe class.
 *
 * **The value is not bound here.** The text state lives on `Root`, and it owns every DOM write after
 * the first through an effect of its own — which is what makes suppressing the mid-IME-composition
 * write possible at all. A second `value={…}` of your own would write where that logic cannot veto it.
 *
 * **`onBeforeInput` is the veto, not `onInput`.** The native `input` event is not cancelable, so
 * `preventDefault()` there does nothing. `onBeforeInput` is deliberately consumed by nothing here, so
 * it forwards untouched and can stop the change before `input` fires.
 *
 * **It needs an accessible name**, on every tree: an `aria-label`, or an `aria-labelledby` pointing at
 * your own `<label>`. Combobox ships no `Label` part, and a nameless `role="combobox"` is an axe
 * `aria-input-field-name` violation — as is the `role="listbox"` popup, which inherits its name here.
 */
export const Input: Component<ComboboxInputProps> = (props) => {
  const ctx = useComboboxContext();

  const input = createComboboxInput(
    ctx.state,
    merge(omit(props, "render", "class"), {
      textInput: ctx.textInput,
      onCommit: ctx.commit,
      onRevert: ctx.revert,
      // Consumer's handler first, then Combobox's typing policy, then (inside the hook) the text
      // state's own write. Running before the value lands is fine: the policy only sets the entry
      // strategy and opens the popup, and reads nothing.
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
