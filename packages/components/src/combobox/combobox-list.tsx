import { createComboboxList } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Accessor, For, merge, omit } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxListElementProps = JSX.HTMLAttributes<HTMLDivElement>;

/**
 * `<G>` is the shape of a `Combobox.Root` `items` **entry** — the item for a flat list, the group
 * entry with `groupToItems` set. `<I>` is a group's own item type, and matters only when grouped.
 * Neither can flow here from `Root` (a Solid context value is a single concrete type), so both are
 * inferred from the `children` callback's own annotations instead: writing
 * `{(product: Product) => …}` binds `<G>` at the call site. That is the documented cost of the
 * grouped API; the inner `<For>` infers normally from there.
 */
export interface ComboboxListProps<G = unknown, I = unknown>
  extends Omit<ComboboxListElementProps, "children"> {
  /**
   * Renders the list container as a different element/component while keeping List's computed props
   * (`role="listbox"`, the id the input's `aria-controls` names, the list-level ARIA, and the
   * mousedown guard that keeps DOM focus in the input). **Not** the same thing as the per-entry
   * `children` callback below — this re-targets the container, that one builds a row.
   *
   * The internal ref is merged into the single function ref `renderElement` passes down; it registers
   * this element as the option source's **scroll container**, so a target that drops function refs
   * leaves an offscreen highlighted option offscreen forever — nothing else moves it, because in
   * activedescendant mode nothing moves DOM focus.
   *
   * Pick the target for validity too: `role="listbox"` on a `<section>` is an axe
   * `aria-allowed-role` violation.
   */
  render?: RenderProp<ComboboxListElementProps>;
  /** Merged over the recipe's `list` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A **render callback invoked once per surviving entry** — the single authoring mode, and the
   * reason the filter needs no consumer wiring: `Root` narrows the array, and this iterates whatever
   * survived.
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
   *   That third argument is the group's **filtered** items, and it is why the grouped signature
   *   differs from `Select.List`'s: reaching into your own `category.products` instead would render
   *   every row the query just removed. It resolves to an empty array for a flat list.
   *
   * **It is an accessor, not an array**, for the same reason `index` is: `<For>` diffs by reference,
   * so a group that survives a narrowing query keeps its identity and its row is *reused* — this
   * callback never runs again. A plain array captured here would then be the one from the previous
   * query, and the group would show rows the filter has already removed. Read it inside the inner
   * `<For each={…}>`, which is a tracking scope; reading it in the callback body instead is a
   * `[STRICT_READ_UNTRACKED]` diagnostic saying exactly this.
   *
   * `I[]` is **mutable** on purpose. `readonly I[]` would reject the natural `Accessor<Product[]>`
   * annotation — parameters compare contravariantly, so the stricter type is the one that costs every
   * call site a cast. Do not mutate what it returns; it is either your own array or one this
   * component derived.
   */
  children?: (entry: G, index: Accessor<number>, items: Accessor<I[]>) => JSX.Element;
}

/**
 * The `role="listbox"` element — the options' container and the scroll container an offscreen
 * highlighted option is scrolled inside. `createComboboxList` owns the sanitized list props: the id
 * the input's `aria-controls` names, the role, the `aria-labelledby` that falls back to the input (so
 * naming the input names the popup too), `aria-multiselectable`/`aria-orientation`, and the
 * `mousedown` `preventDefault()` that keeps DOM focus in the input when an option is clicked.
 *
 * It is deliberately **not** `state.list.rootProps`: that carries `tabindex="0"`, its own keymap and
 * its own `aria-activedescendant`, all of which belong on the input here. See `combobox-list.md`.
 *
 * A **function child invoked per row is not the multi-read component-valued-prop shape**, so it needs
 * no `children()` — the note at `listbox-root.tsx` applies verbatim. The rows are declared as a
 * nested component so their `<For>` gets its own owner, and rendered through the `children` getter so
 * each row's `Combobox.Item` resolves `useComboboxContext()`.
 */
export function List<G = unknown, I = unknown>(props: ComboboxListProps<G, I>): JSX.Element {
  const ctx = useComboboxContext();
  // The kernel hook types its props over `HTMLElement` while this part's public surface names the
  // real `<div>`, and `ref` is the one key that won't line up between them. Cast at this seam, per
  // CLAUDE.md — widening the public surface to `HTMLElement` instead would push a cast onto every
  // consumer writing `render={(p) => <div {...p} />}`.
  const list = createComboboxList(
    ctx.state,
    omit(props, "render", "class", "children") as unknown as JSX.HTMLAttributes<HTMLElement>,
  );

  function ComboboxRows(): JSX.Element {
    const renderRow = props.children ?? (() => undefined);
    // `ctx.items()` is the filtered array in the consumer's own shape, typed `unknown[]` through the
    // context; `<G>`/`<I>` are what their callback annotations already asserted it to be.
    return (
      <For each={ctx.items() as readonly G[]}>
        {/* The third argument is built here but read inside the consumer's own `<For each={…}>`,
            which is the tracking scope that keeps a reused group's rows current. */}
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
    // The scroll container `createDataCollection.scrollIndexIntoView` scrolls — see the `render` note.
    ref: list.setRef,
  });
}
