import { type CreateListboxReturn, createListboxItem } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { createSignal, merge, omit } from "solid-js";
import {
  ComboboxItemContext,
  type ComboboxItemContextValue,
  useComboboxContext,
} from "./combobox-context";

type ComboboxItemElementProps = JSX.HTMLAttributes<HTMLElement>;

/**
 * `ComboboxItemProps` = the native option attributes **plus** the per-instance props below. Nothing
 * about the row is declared twice: its label, disabled state and selection identity all come from
 * `Combobox.Root`'s `itemToLabel` / `isItemDisabled` / `itemToValue`.
 */
export interface ComboboxItemProps<V = unknown> extends ComboboxItemElementProps {
  /**
   * This option's item — one element of the **filtered** entries `Combobox.List` handed you (or of a
   * group's own filtered items). **Required.** It is what the row resolves its position from, so an
   * option can sit anywhere in the subtree, which is exactly what makes grouping a plain nested
   * `<For>`.
   *
   * There is deliberately **no `index` prop**: the index is a registration *mechanism* the primitive
   * resolves from the item, not information the author has. An item outside the current entries is a
   * dev warning — arrow keys traverse that array rather than the DOM, so a row outside it is
   * unreachable. On a Combobox that warning is also the tripwire for rendering an unfiltered list:
   * iterate what `Combobox.List` gives you, not your own source array.
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
  render?: RenderProp<ComboboxItemElementProps>;
  /** Merged over the recipe's `item` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The option part. Assembles `createListboxItem` — reused **unchanged** from the listbox family,
 * exactly as `Select.Item` does. The hook owns `role="option"`, the ARIA state, the `data-*`
 * attributes, the `tabindex` and the click/pointer handlers. Pure assembly + theme: no behavior lives
 * here.
 *
 * **Clicking a row never moves DOM focus.** `createComboboxList` `preventDefault()`s the list's
 * `mousedown`, so focus stays in the input, `data-active` keeps painting, and the row's own `click`
 * still selects.
 *
 * The element ref is a real `createSignal` accessor (the row's element is created as a reactive
 * consequence of rendering, so an untracked read would catch it still `undefined`). It publishes
 * `isSelected`/`isActive` on `ComboboxItemContext` for its `ItemIndicator` child.
 */
export function Item<V = unknown>(props: ComboboxItemProps<V>): JSX.Element {
  const ctx = useComboboxContext();
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
    "data-slot": "combobox-item",
  });

  const itemContext: ComboboxItemContextValue = {
    isSelected: item.isSelected,
    isActive: item.isActive,
  };

  return (
    <ComboboxItemContext value={itemContext}>
      {renderElement<ComboboxItemElementProps, HTMLElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        ref: setRef,
      })}
    </ComboboxItemContext>
  );
}
