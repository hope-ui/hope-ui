import { type CreateListboxReturn, createListboxItem } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { createSignal, merge, omit } from "solid-js";
import { SelectItemContext, type SelectItemContextValue, useSelectContext } from "./select-context";

type SelectItemElementProps = JSX.HTMLAttributes<HTMLElement>;

/**
 * `SelectItemProps` = the native option attributes **plus** the per-instance props below. Nothing
 * about the row is declared twice: its label, disabled state and selection identity all come from
 * `Select.Root`'s `itemToLabel` / `isItemDisabled` / `itemToValue`.
 */
export interface SelectItemProps<V = unknown> extends SelectItemElementProps {
  /**
   * This option's item — one element of `Select.Root`'s `items` (or of a group's own items when
   * `groupToItems` is set). **Required.** It is what the row resolves its position from, so an option
   * can sit anywhere in the subtree, which is exactly what makes grouping a plain nested `<For>`.
   *
   * There is deliberately **no `index` prop**: the index is a registration *mechanism* the primitive
   * resolves from the item, not information the author has. An item outside `items` is a dev warning
   * — arrow keys and typeahead traverse that array rather than the DOM, so a row outside it is
   * unreachable, and that warning is what catches a grouped list rendered out of order.
   */
  item?: V;
  /**
   * Renders as a different element/component while keeping Item's computed props — `role="option"`,
   * the ARIA state, the `data-active`/`data-selected`/`data-disabled` hooks and the click/pointer
   * handlers all ride on them.
   *
   * The internal ref is merged into the single function ref `renderElement` passes down. It is
   * load-bearing: it publishes this row's element into the option source, which is what resolves the
   * `aria-activedescendant` IDREF's target and what scroll-into-view moves. A target that drops
   * function refs leaves the row unreachable by the keyboard, with no error.
   */
  render?: RenderProp<SelectItemElementProps>;
  /** Merged over the recipe's `item` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The option part. Assembles `createListboxItem` — reused **unchanged** from the listbox family, which
 * is the point of scoping the kernel below the text value: Select composes the primitive, not the
 * `Listbox` *component* (whose Root owns its own `createListbox`, and whose recipe is
 * standalone-first with no popup chrome). The hook owns `role="option"`, the ARIA state, the
 * `data-*` attributes, the `tabindex` and the click/pointer handlers. Pure assembly + theme: no
 * behavior lives here.
 *
 * **The row resolves its own position from `item`** — `state.indexOfValue(itemToValue(item))`, a
 * lookup over a `Map` rebuilt with the data — rather than taking an `index` or reading a hidden
 * per-row context. That is what lets an option sit at any depth, and it is why grouping needs no new
 * part.
 *
 * The element ref is a real `createSignal` accessor (the row's element is created as a reactive
 * consequence of rendering, so an untracked read would catch it still `undefined`). It publishes
 * `isSelected`/`isActive` on `SelectItemContext` for its `ItemIndicator` child.
 *
 * It renders a `<div role="option">`, matching `Select.List`'s role-based container: a `<ul>`/`<li>`
 * structure would be invalid HTML the moment a group sits between the list and its options. `role`
 * overrides native element semantics for assistive tech, so nothing is lost.
 */
export function Item<V = unknown>(props: SelectItemProps<V>): JSX.Element {
  const ctx = useSelectContext();
  const state = ctx.state.list as unknown as CreateListboxReturn<V>;

  // A signal-backed element ref: the primitive reads `ref()` to publish the element, and
  // `renderElement` sets the element into `setRef`. `{ ref }` is merged **last** so it always wins the
  // `ref` slot — a consumer `ref` (a DOM callback) must never reach the primitive, which expects a
  // signal accessor.
  const [ref, setRef] = createSignal<HTMLElement>();
  const item = createListboxItem<V>(state, merge(omit(props, "render", "class"), { ref }));

  const elementProps = merge(item.props, {
    // The consumer's `ref`, put back. `{ ref }` above deliberately wins the hook's `ref` slot and the
    // hook omits `ref` from what it forwards — so without this the consumer's own ref would reach
    // neither, silently. `renderElement` collapses it with `setRef` into a single function ref.
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
