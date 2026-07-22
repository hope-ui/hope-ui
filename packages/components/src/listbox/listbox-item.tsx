import { type CreateListboxReturn, createListboxItem } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { createSignal, merge, omit } from "solid-js";
import {
  ListboxItemContext,
  type ListboxItemContextValue,
  useListboxContext,
} from "./listbox-context";

/**
 * `ListboxItemProps` = the native `<li>` attributes **plus** the per-instance props below. `value` is
 * `Omit`-ted from the native `<li>` attrs (an `<li value>` is the ordered-list number) and re-declared
 * as the item's selection value — **required in collection mode**. `onChange` is `Omit`-ted so a
 * native change handler can't clash.
 */
export interface ListboxItemProps<V = unknown>
  extends Omit<JSX.HTMLAttributes<HTMLElement>, "value"> {
  /** This item's value — its selection identity and (with `name`) its submitted string. Required. */
  value: V;
  /** Whether this item is disabled (skipped by focus/navigation, dimmed). Default `false`. */
  disabled?: boolean;
  /** Explicit typeahead text, overriding the root's `itemToLabel` / the element's `textContent`. */
  textValue?: string;
  /** Renders as a different element/component while keeping Item's computed props. */
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  /** Merged over the recipe's `item` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The option part. Assembles `createListboxItem` (which owns `role="option"`, the ARIA state, the
 * `data-active`/`data-selected`/`data-disabled` attrs, the roving/activedescendant `tabindex`, and the
 * click/pointer handlers) into a styled `<li>`. Pure assembly + theme: no behavior lives here.
 *
 * The element ref is a real `createSignal` accessor (the item element is created as a reactive
 * consequence of rendering, so an untracked read would catch it still `undefined`) — passed to the
 * primitive as `ref` so it can register the element, and set on the `<li>` via `renderElement`'s ref
 * merge. It publishes `isSelected`/`isActive` on `ListboxItemContext` for its `ItemIndicator` child.
 */
export function Item<V = unknown>(props: ListboxItemProps<V>): JSX.Element {
  const ctx = useListboxContext();
  const state = ctx.state as unknown as CreateListboxReturn<V>;

  // A signal-backed element ref: the primitive reads `ref()` to register the item, and `renderElement`
  // sets the `<li>` into `setRef`. `{ ref }` is merged **last** so it always wins the `ref` slot — a
  // consumer `ref` (a DOM callback) must never reach the primitive, which expects a signal accessor.
  const [ref, setRef] = createSignal<HTMLElement>();
  const item = createListboxItem<V>(state, merge(omit(props, "render", "class"), { ref }));

  const elementProps = merge(item.props, {
    get class(): string {
      return cx(ctx.slots.item(), props.class) ?? "";
    },
    "data-slot": "listbox-item",
  });

  const itemContext: ListboxItemContextValue = {
    isSelected: item.isSelected,
    isActive: item.isActive,
  };

  return (
    <ListboxItemContext value={itemContext}>
      {renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
        as: "li",
        render: props.render,
        props: elementProps,
        ref: setRef,
      })}
    </ListboxItemContext>
  );
}
