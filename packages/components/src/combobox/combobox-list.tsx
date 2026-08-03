import { createComboboxList } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Accessor, For, merge, omit } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxListElementProps = JSX.HTMLAttributes<HTMLDivElement>;

/**
 * `<G>` is the shape of a `Combobox.Root` `items` **entry** — the item for a flat list, the group
 * entry once `groupToItems` is set. `<I>` is a group's own item type, and matters only when grouped.
 * Neither can flow here from `Root` (a Solid context value is one concrete type), so both are inferred
 * from the `children` callback's own annotations instead: writing `{(product: Product) => …}` binds
 * `<G>` at the call site, and the inner `<For>` infers from there.
 */
export interface ComboboxListProps<G = unknown, I = unknown>
  extends Omit<ComboboxListElementProps, "children"> {
  /**
   * Renders the list container as a different element/component while keeping List's computed props
   * (`role="listbox"`, the id the input's `aria-controls` names, the list-level ARIA, and the
   * mousedown guard that keeps DOM focus in the input). **Not** the per-entry `children` callback
   * below — this re-targets the container, that one builds a row.
   *
   * The internal ref rides along, and it registers this element as the list's **scroll container**.
   * A target that drops function refs leaves an offscreen highlighted option offscreen forever, since
   * nothing else scrolls it: no option ever takes DOM focus.
   *
   * Pick the target for validity too: `role="listbox"` on a `<section>` is an axe
   * `aria-allowed-role` violation.
   */
  render?: RenderProp<ComboboxListElementProps>;
  /** Merged over the recipe's `list` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A **render callback invoked once per surviving entry** — the single authoring mode, and the reason
   * the filter needs no wiring of your own: `Root` narrows the array, this iterates what survived.
   *
   * - **flat** (the default) — one call per *item*; return a `<Combobox.Item item={item}>`.
   * - **grouped** (`groupToItems` set on `Root`) — one call per *group entry* that still has rows.
   *   Return a `<Combobox.Group>` and iterate the **third argument** with a plain `<For>`:
   *
   *   ```tsx
   *   {(category: Category, _index, products: Accessor<Product[]>) => (
   *     <Combobox.Group>
   *       <Combobox.GroupLabel>{category.name}</Combobox.GroupLabel>
   *       <For each={products()}>{(p) => <Combobox.Item item={p}>…</Combobox.Item>}</For>
   *     </Combobox.Group>
   *   )}
   *   ```
   *
   *   That third argument is the group's **filtered** items, which is why the grouped signature
   *   differs from `Select.List`'s: reaching into your own `category.products` instead would render
   *   every row the query just removed. It is an empty array for a flat list.
   *
   * **It is an accessor, not an array.** `<For>` diffs by reference, so a group that survives a
   * narrowing query keeps its identity and its row is *reused* — this callback never runs again, and a
   * plain array captured here would still hold the previous query's rows. Read it inside the inner
   * `<For each={…}>`, which is a reactive scope; reading it in the callback body instead raises a
   * `[STRICT_READ_UNTRACKED]` diagnostic saying exactly this.
   *
   * `I[]` is **mutable** on purpose: `readonly I[]` would reject the natural `Accessor<Product[]>`
   * annotation, because parameters compare contravariantly, and cost every call site a cast. Do not
   * mutate what it returns.
   */
  children?: (entry: G, index: Accessor<number>, items: Accessor<I[]>) => JSX.Element;
}

/**
 * The `role="listbox"` element — the options' container, and the box an offscreen highlighted option
 * is scrolled inside. `createComboboxList` owns the list props: the id the input's `aria-controls`
 * names, the role, the `aria-labelledby` that falls back to the input (so naming the input names the
 * popup too), `aria-multiselectable`/`aria-orientation`, and the `mousedown` `preventDefault()` that
 * keeps DOM focus in the input when an option is clicked.
 *
 * It deliberately does **not** use the option list's own `rootProps`: those carry `tabindex="0"`, a
 * keymap and an `aria-activedescendant`, all of which belong on the input in this pattern.
 *
 * The rows are declared as a nested component so their `<For>` gets its own reactive scope, and
 * rendered through the `children` getter so each row's `Combobox.Item` can resolve the context.
 */
export function List<G = unknown, I = unknown>(props: ComboboxListProps<G, I>): JSX.Element {
  const ctx = useComboboxContext();
  // The behavior hook types its props over `HTMLElement` while this part's public surface names the
  // real `<div>`, and `ref` is the one key that won't line up. Cast here rather than widening the
  // public surface, which would push a cast onto every consumer writing a `render` of their own.
  const list = createComboboxList(
    ctx.state,
    omit(props, "render", "class", "children") as unknown as JSX.HTMLAttributes<HTMLElement>,
  );

  function ComboboxRows(): JSX.Element {
    const renderRow = props.children ?? (() => undefined);
    // The context erases the item types, so this restores what the callback's annotations asserted.
    return (
      <For each={ctx.items() as readonly G[]}>
        {/* The third argument is built here but read inside the consumer's own `<For each={…}>` —
            the reactive scope that keeps a reused group's rows current. */}
        {(entry, index) => renderRow(entry, index, () => ctx.itemsOfGroup(entry) as I[])}
      </For>
    );
  }

  const elementProps = merge(list.props, {
    get class(): string {
      return ctx.slots.list(props.class);
    },
    "data-slot": "combobox-list",
    get children(): JSX.Element {
      return <ComboboxRows />;
    },
  });

  return renderElement<ComboboxListElementProps, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps as unknown as ComboboxListElementProps,
    // Registers this element as the scroll container — see the `render` note above.
    ref: list.setRef,
  });
}
