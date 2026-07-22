import { type CreateListboxReturn, createListboxItem } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, merge, omit } from "solid-js";
import {
  ListboxItemContext,
  type ListboxItemContextValue,
  useListboxContext,
} from "./listbox-context";

/**
 * `ListboxItemProps` = the native option attributes **plus** the per-instance props below. The option
 * renders as a `<div role="option">` (see `Item`), so `value` (re-declared below as the item's
 * selection value) is `Omit`-ted from the native attrs to avoid any clash; `onChange` is `Omit`-ted so
 * a native change handler can't clash either.
 *
 * Provide **exactly one** of `value` / `index`: `value` in **collection mode** (the registered
 * selection identity), `index` in **virtual mode** (the row's position into the full `items` array —
 * its data, value, and disabled state all come from the source, so `value` is ignored there).
 */
export interface ListboxItemProps<V = unknown>
  extends Omit<JSX.HTMLAttributes<HTMLElement>, "value"> {
  /**
   * This item's value — its selection identity and (with `name`) its submitted string. **Required in
   * collection mode**; ignored (and typically omitted) in virtual mode, where the value is looked up
   * from the source by `index`.
   */
  value?: V;
  /**
   * **Virtual mode only:** this row's index into the full `items` array, as an accessor. Its presence
   * selects the virtual path — the item looks its data up by index, publishes its element into the
   * window (registration + measurement), carries `data-index` (the virtualizer's measurement key), and
   * self-positions absolutely at its windowed offset inside `Listbox.Root`'s sizer.
   */
  index?: Accessor<number>;
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
 * click/pointer handlers) into a styled option. Pure assembly + theme: no behavior lives here.
 *
 * The element ref is a real `createSignal` accessor (the item element is created as a reactive
 * consequence of rendering, so an untracked read would catch it still `undefined`) — passed to the
 * primitive as `ref` so it can register the element (collection self-register, or virtual window
 * publish + measure), and set on the element via `renderElement`'s ref merge. It publishes
 * `isSelected`/`isActive` on `ListboxItemContext` for its `ItemIndicator` child.
 *
 * The option always renders as a `<div role="option">` — matching `Listbox.Root`'s role-based
 * container (a `<ul>`/`<li>` structure would be invalid HTML once groups, separators, or virtual mode's
 * sizer sit between the list and its options; see Root's JSDoc). In **virtual mode** (`index` given) it
 * additionally carries `data-index` (the virtualizer's measurement key) and positions itself absolutely
 * at its windowed offset (`start`), read from `state.virtual`. The positioning is load-bearing (the
 * window can't lay out without it), so it wins over any consumer `style`; an object `style` is still
 * merged underneath.
 */
export function Item<V = unknown>(props: ListboxItemProps<V>): JSX.Element {
  const ctx = useListboxContext();
  const state = ctx.state as unknown as CreateListboxReturn<V>;
  // Presence of `index` selects the virtual path — in the type, the primitive hook, and the element
  // tag below. Captured once (the accessor is stable); the mode never changes for an item's lifetime.
  const virtualIndex = props.index;

  // A signal-backed element ref: the primitive reads `ref()` to register the item, and `renderElement`
  // sets the element into `setRef`. `{ ref }` is merged **last** so it always wins the `ref` slot — a
  // consumer `ref` (a DOM callback) must never reach the primitive, which expects a signal accessor.
  const [ref, setRef] = createSignal<HTMLElement>();
  const item = createListboxItem<V>(state, merge(omit(props, "render", "class"), { ref }));

  // Virtual mode: this row's windowed metadata (its `start` offset). The lookup is over the small
  // rendered window (visible + overscan) and reactive — it re-resolves as the list scrolls.
  const virtualItem = () =>
    virtualIndex
      ? state.virtual?.virtualItems().find((entry) => entry.index === virtualIndex())
      : undefined;

  const elementProps = merge(
    item.props,
    {
      get class(): string {
        return cx(ctx.slots.item(), props.class) ?? "";
      },
      "data-slot": "listbox-item",
    },
    virtualIndex
      ? {
          get "data-index"(): number {
            return virtualIndex();
          },
          get style(): JSX.CSSProperties {
            const base: JSX.CSSProperties = {
              position: "absolute",
              top: `${virtualItem()?.start ?? 0}px`,
              left: "0",
              width: "100%",
            };
            const consumer = props.style;
            // Merge an object `style` underneath the positioning (position keys win); a string `style`
            // can't be spread, so positioning stands alone in that (rare) case.
            return typeof consumer === "object" && consumer !== null
              ? { ...consumer, ...base }
              : base;
          },
        }
      : {},
  );

  const itemContext: ListboxItemContextValue = {
    isSelected: item.isSelected,
    isActive: item.isActive,
  };

  return (
    <ListboxItemContext value={itemContext}>
      {renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        ref: setRef,
      })}
    </ListboxItemContext>
  );
}
