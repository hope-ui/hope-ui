import { type CreateComboboxClearProps, createComboboxClear } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxClearElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export interface ComboboxClearProps extends Omit<CreateComboboxClearProps, "onClear"> {
  /**
   * Renders as a different element/component while keeping Clear's computed props — the localized
   * `aria-label`, the `tabindex="-1"` and the focus-preserving pointerdown ride on them. Set
   * `nativeButton={false}` alongside when the target is not a real `<button>`.
   */
  render?: RenderProp<ComboboxClearElementProps>;
  /** Merged over the recipe's `clear` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A custom glyph, overriding the default for this one button. When omitted, renders the resolved
   * default (instance `clearIcon` ?? preset `defaultProps.combobox.clearIcon` ?? hope's built-in ✕)
   * from context. Read **exactly once**.
   */
  children?: JSX.Element;
  /**
   * Whether to render while the field is already empty. Default `false` — a clear button with
   * nothing to clear is a control that does nothing, and a gutter that appears and disappears is
   * what every search field does.
   */
  alwaysVisible?: boolean;
}

/**
 * The clear button: empties the field and hands focus back to the input.
 *
 * `createComboboxClear` owns the a11y — the localized `aria-label` (a bare ✕ is an axe `button-name`
 * violation), the `tabindex="-1"` that keeps the input the single tab stop, and the `pointerdown`
 * `preventDefault()` without which the click would blur the input and fire its blur-commit, putting
 * back the text the user just asked to remove.
 *
 * **What "clear" means is this layer's call**, for the reason the kernel's doc gives: the kernel owns
 * no text value. Here it means both halves — the text *and* the selection — because a field showing
 * nothing while still reporting `apple` to its `onChange` is the exact mismatch `allowsCustomValue`
 * exists to make deliberate.
 */
export const Clear: Component<ComboboxClearProps> = (props) => {
  const ctx = useComboboxContext();

  const clear = createComboboxClear(
    ctx.state,
    merge(omit(props, "render", "class", "children", "alwaysVisible"), {
      onClear: () => {
        ctx.textInput.setValue("");
        // Through the kernel's selection, so the wrapped `onChange` fires and a controlled consumer
        // hears about it — never by writing the text and leaving the selection behind.
        ctx.state.list.selection.deselectAll();
      },
    }),
  );

  const elementProps = merge(clear.props, {
    get class(): string {
      return ctx.slots.clear(props.class);
    },
    "data-slot": "combobox-clear",
    get children(): JSX.Element {
      return props.children ?? ctx.clearIcon();
    },
  });

  const hasContent = () =>
    props.alwaysVisible === true ||
    ctx.textInput.value() !== "" ||
    ctx.state.list.value().length > 0;

  return (
    <Show when={hasContent()}>
      {renderElement<ComboboxClearElementProps, HTMLButtonElement>({
        as: "button",
        render: props.render,
        props: elementProps,
        ref: clear.setRef,
      })}
    </Show>
  );
};
