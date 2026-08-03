import { type CreateListboxReturn, createListboxItem } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { createSignal, merge, omit } from "solid-js";
import { SelectItemContext, type SelectItemContextValue, useSelectContext } from "./select-context";

type SelectItemElementProps = JSX.HTMLAttributes<HTMLElement>;

/**
 * The native option attributes plus the props below. Nothing about the row is declared twice: its
 * label, disabled state and selection identity all come from `Select.Root`'s `itemToLabel` /
 * `isItemDisabled` / `itemToValue`.
 */
export interface SelectItemProps<V = unknown> extends SelectItemElementProps {
  /**
   * This option's item — one element of `Select.Root`'s `items` (or of a group's own items under
   * `groupToItems`). **Required**, and what the row resolves its own position from, which is why an
   * option can sit anywhere in the subtree and grouping needs nothing but a nested `<For>`.
   *
   * There is deliberately **no `index` prop**: the index is a lookup, not information the author has.
   * An item that is not in `items` logs a dev warning — arrow keys and typeahead traverse that array
   * rather than the DOM, so such a row is unreachable.
   */
  item?: V;
  /**
   * Renders as a different element/component while keeping Item's computed props — `role="option"`,
   * the ARIA state, the `data-active`/`data-selected`/`data-disabled` hooks and the click/pointer
   * handlers all ride on them.
   *
   * The internal ref rides along too, and it is load-bearing: it publishes this row's element, which
   * is what the trigger's `aria-activedescendant` points at and what scroll-into-view moves. A target
   * that drops function refs leaves the row unreachable by keyboard, with no error.
   */
  render?: RenderProp<SelectItemElementProps>;
  /** Merged over the recipe's `item` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The option part. Assembles `createListboxItem`, reused unchanged from the listbox family: it owns
 * `role="option"`, the ARIA state, the `data-*` hooks, the `tabindex` and the click/pointer handlers.
 * Pure assembly plus theme — no behavior lives here.
 *
 * **The row resolves its own position by looking `item` up in `Select.Root`'s `items`**, rather than
 * taking an `index` or reading a hidden per-row context. That is what lets an option sit at any depth,
 * and why grouping needs no new part.
 *
 * It renders a `<div role="option">` to match `Select.List`'s role-based container: a `<ul>`/`<li>`
 * structure would be invalid HTML the moment a group sits between the list and its options, and `role`
 * overrides native element semantics for assistive tech anyway.
 */
export function Item<V = unknown>(props: SelectItemProps<V>): JSX.Element {
  const ctx = useSelectContext();
  const state = ctx.state.list as unknown as CreateListboxReturn<V>;

  // The behavior hook expects a *signal accessor* it can track, not a DOM callback — the row's
  // element only exists as a reactive consequence of rendering, so an untracked read would catch it
  // still `undefined`. `{ ref }` is merged last so it always wins the `ref` slot and a consumer's own
  // callback ref can never reach the hook.
  const [ref, setRef] = createSignal<HTMLElement>();
  const item = createListboxItem<V>(state, merge(omit(props, "render", "class"), { ref }));

  const elementProps = merge(item.props, {
    // The consumer's `ref`, put back: the hook took the `ref` slot above and omits `ref` from what it
    // forwards, so without this line a consumer ref would silently reach neither. `renderElement` —
    // the render-prop helper every part routes through — collapses it with `setRef` into one callback.
    get ref() {
      return props.ref;
    },
    get class(): string {
      return ctx.slots.item(props.class);
    },
    "data-slot": "select-item",
  });

  const itemContext: SelectItemContextValue = {
    isSelected: item.isSelected,
    isActive: item.isActive,
  };

  return (
    <SelectItemContext value={itemContext}>
      {renderElement<SelectItemElementProps, HTMLElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        ref: setRef,
      })}
    </SelectItemContext>
  );
}
