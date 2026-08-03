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
 * The native option attributes plus the props below. Nothing about the row is declared twice: its
 * label, disabled state and selection identity all come from `Combobox.Root`'s `itemToLabel` /
 * `isItemDisabled` / `itemToValue`.
 */
export interface ComboboxItemProps<V = unknown> extends ComboboxItemElementProps {
  /**
   * This option's item — one element of the **filtered** entries `Combobox.List` handed you (or of a
   * group's own filtered items). **Required**, and what the row resolves its own position from, which
   * is why an option can sit anywhere in the subtree and grouping needs nothing but a nested `<For>`.
   *
   * There is deliberately **no `index` prop**: the index is a lookup, not information the author has.
   * An item that is not among the current entries logs a dev warning — arrow keys traverse that array
   * rather than the DOM, so such a row is unreachable. On a Combobox that warning is also the tripwire
   * for rendering an unfiltered list: iterate what `Combobox.List` gives you, not your source array.
   */
  item?: V;
  /**
   * Renders as a different element/component while keeping Item's computed props — `role="option"`,
   * the ARIA state, the `data-active`/`data-selected`/`data-disabled` hooks and the click/pointer
   * handlers all ride on them.
   *
   * The internal ref rides along too, and it is load-bearing: it publishes this row's element, which
   * is what the input's `aria-activedescendant` points at and what scroll-into-view moves. A target
   * that drops function refs leaves the row unreachable by keyboard, with no error.
   */
  render?: RenderProp<ComboboxItemElementProps>;
  /** Merged over the recipe's `item` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The option part. Assembles `createListboxItem`, reused unchanged from the listbox family exactly as
 * `Select.Item` does: it owns `role="option"`, the ARIA state, the `data-*` hooks, the `tabindex` and
 * the click/pointer handlers. Pure assembly plus theme — no behavior lives here.
 *
 * **Clicking a row never moves DOM focus.** `Combobox.List` calls `preventDefault()` on its own
 * `mousedown`, so focus stays in the input, `data-active` keeps painting, and the row's own `click`
 * still selects.
 */
export function Item<V = unknown>(props: ComboboxItemProps<V>): JSX.Element {
  const ctx = useComboboxContext();
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
