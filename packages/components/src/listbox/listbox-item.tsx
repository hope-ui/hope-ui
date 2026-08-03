import { type CreateListboxReturn, createListboxItem } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, merge, omit } from "solid-js";
import {
  ListboxItemContext,
  type ListboxItemContextValue,
  useListboxContext,
} from "./listbox-context";

// A `<div role="option">`, not an `<li>` — see the valid-HTML note on `Listbox.Root`.
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
   * **Virtual mode only:** this row's index into the full `items` array, as an accessor. Passing it
   * selects the virtual path — the row looks its data up by index, publishes its element for
   * measurement, carries `data-index`, and positions itself absolutely at its windowed offset inside
   * the sizer `Listbox.Root` renders.
   */
  index?: Accessor<number>;
  /** Renders as a different element/component while keeping Item's computed props. */
  render?: RenderProp<ListboxItemElementProps>;
  /** Merged over the recipe's `item` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The option part. `createListboxItem` owns `role="option"`, the ARIA state, the
 * `data-active`/`data-selected`/`data-disabled` paint hooks, the tab stop and the click/pointer
 * handlers, so no behavior lives here — this is assembly plus the recipe class. It publishes
 * `isSelected`/`isActive` on context for its `ItemIndicator` child.
 *
 * In **virtual mode** (`index` given) it also carries `data-index` and positions itself absolutely at
 * its windowed offset. That positioning is load-bearing — the window cannot lay out without it — so
 * it wins over any consumer `style`, though an object `style` is still merged underneath.
 */
export function Item<V = unknown>(props: ListboxItemProps<V>): JSX.Element {
  const ctx = useListboxContext();
  const state = ctx.state as unknown as CreateListboxReturn<V>;
  // Read once: the accessor is stable and a row never switches mode mid-life.
  const virtualIndex = props.index;

  // The element ref must be a signal, not a plain variable: the element only exists as a reactive
  // consequence of rendering, so the primitive reads `ref()` and needs to re-run when it lands.
  // `{ ref }` is merged **last** below so it always wins the `ref` key — a consumer's `ref` is a DOM
  // callback and must never reach the primitive, which expects this accessor.
  const [ref, setRef] = createSignal<HTMLElement>();
  const item = createListboxItem<V>(state, merge(omit(props, "render", "class"), { ref }));

  // This row's windowed metadata (its `start` offset). The lookup scans only the rendered window
  // (visible rows + overscan) and is reactive, so it re-resolves as the list scrolls.
  const virtualItem = () =>
    virtualIndex
      ? state.virtual?.virtualItems().find((entry) => entry.index === virtualIndex())
      : undefined;

  const elementProps = merge(
    item.props,
    {
      // The consumer's `ref`, put back. It was overwritten above by the signal setter the primitive
      // requires, and the hook does not forward it — so without this line it would silently reach
      // nothing. `renderElement` collapses it with `setRef` into a single function ref.
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
            // A string `style` cannot be spread, so in that (rare) case the positioning stands alone.
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
