import { type CreateListboxReturn, createListboxItem } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, merge, omit } from "solid-js";
import {
  ListboxItemContext,
  type ListboxItemContextValue,
  useListboxContext,
} from "./listbox-context";

// The option is a generic `<div role="option">`, not an `<li>` — the valid-HTML decision on
// `Listbox.Root` — so its attribute surface is the generic one.
type ListboxItemElementProps = JSX.HTMLAttributes<HTMLElement>;

/**
 * `ListboxItemProps` = the native option attributes **plus** the per-instance props below.
 *
 * Provide **exactly one** of `item` / `index`: `item` in the normal (data) mode — the row resolves
 * its own position from it — and `index` in **virtual mode**, where a recycled row's position is the
 * only thing it knows. Nothing about the row is declared twice: its label, disabled state and
 * selection identity all come from `Listbox.Root`'s `itemToLabel` / `isItemDisabled` / `itemToValue`.
 */
export interface ListboxItemProps<V = unknown> extends ListboxItemElementProps {
  /**
   * This option's item — one element of `Listbox.Root`'s `items`. **Required in data mode.** It is
   * what the row resolves its position from, so an option can sit anywhere in the subtree (a group's
   * nested `<For>`); an item outside `items` is a dev warning, since arrow keys and typeahead
   * traverse that array rather than the DOM.
   */
  item?: V;
  /**
   * **Virtual mode only:** this row's index into the full `items` array, as an accessor. Its presence
   * selects the virtual path — the row looks its data up by index, publishes its element into the
   * window (registration + measurement), carries `data-index` (the virtualizer's measurement key), and
   * self-positions absolutely at its windowed offset inside `Listbox.Root`'s sizer.
   */
  index?: Accessor<number>;
  /** Renders as a different element/component while keeping Item's computed props. */
  render?: RenderProp<ListboxItemElementProps>;
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
 * primitive as `ref` so it can publish the element into the source under this row's index, and set on
 * the element via `renderElement`'s ref merge. It publishes `isSelected`/`isActive` on
 * `ListboxItemContext` for its `ItemIndicator` child.
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
  // Presence of `index` selects the virtual path — in the type, the primitive hook, and the styling
  // below. Captured once (the accessor is stable); the mode never changes for an item's lifetime.
  const virtualIndex = props.index;

  // A signal-backed element ref: the primitive reads `ref()` to publish the element, and
  // `renderElement` sets the element into `setRef`. `{ ref }` is merged **last** so it always wins the
  // `ref` slot — a consumer `ref` (a DOM callback) must never reach the primitive, which expects a
  // signal accessor.
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
      // The consumer's `ref`, put back. `{ ref }` above deliberately wins the hook's `ref` slot (the
      // primitive needs a signal accessor, never a DOM callback) and the hook omits `ref` from what
      // it forwards — so without this the consumer's own ref would reach neither, silently.
      // `renderElement` collapses it with `setRef` into a single function ref.
      get ref() {
        return props.ref;
      },
      get class(): string {
        return ctx.slots.item(props.class);
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
              "inset-inline-start": "0",
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
      {renderElement<ListboxItemElementProps, HTMLElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        ref: setRef,
      })}
    </ListboxItemContext>
  );
}
