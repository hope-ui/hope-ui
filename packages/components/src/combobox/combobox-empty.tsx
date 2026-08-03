import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxEmptyElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface ComboboxEmptyProps extends ComboboxEmptyElementProps {
  /** Renders as a different element/component while keeping Empty's computed props. */
  render?: RenderProp<ComboboxEmptyElementProps>;
  /** Merged over the recipe's `empty` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /** What to say when nothing matched. */
  children?: JSX.Element;
}

/**
 * The "nothing matched" message, shown only while the filtered option set is empty.
 *
 * It lives in the card **beside** `Combobox.List`, never inside it: `role="listbox"` may only contain
 * options and groups, so a message in there would be invalid ARIA and would be counted as an option.
 *
 * It carries no ARIA of its own, and in particular is **not** a live region — `Combobox.Status` is,
 * and two regions announcing the same fact would say it twice. This element is what a *sighted* user
 * reads; announcing is `Status`'s job.
 *
 * **It only ever appears because `Combobox.Root` defaults `allowsEmptyCollection` to `true`.** On the
 * behavior layer's own default an empty option set refuses to open, and this part is unreachable.
 */
export const Empty: Component<ComboboxEmptyProps> = (props) => {
  const ctx = useComboboxContext();
  const rest = omit(props, "render", "class", "children");

  const elementProps = merge(rest, {
    "data-slot": "combobox-empty",
    get class(): string {
      return ctx.slots.empty(props.class);
    },
    get children(): JSX.Element {
      return props.children;
    },
  });

  return (
    <Show when={ctx.isEmpty()}>
      {renderElement<ComboboxEmptyElementProps, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
};
