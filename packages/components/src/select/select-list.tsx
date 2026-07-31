import { createComboboxList } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Accessor, For, merge, omit } from "solid-js";
import { useSelectContext } from "./select-context";

type SelectListElementProps = JSX.HTMLAttributes<HTMLDivElement>;

/**
 * `<G>` is the shape of a `Select.Root` `items` **entry** — the item for a flat list, the group entry
 * with `groupToItems` set. It cannot flow here from `Root` (a Solid context value is a single
 * concrete type), so it is inferred from the `children` callback's own annotation instead: writing
 * `{(product: Product) => …}` binds it at the call site. That one annotation is the documented cost
 * of the grouped API; the inner `<For>` infers normally from there.
 */
export interface SelectListProps<G = unknown> extends Omit<SelectListElementProps, "children"> {
  /**
   * Renders the list container as a different element/component while keeping List's computed props
   * (`role="listbox"`, the id the trigger's `aria-controls` names, the list-level ARIA, and the
   * mousedown guard that keeps DOM focus on the trigger). **Not** the same thing as the per-entry
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
  render?: RenderProp<SelectListElementProps>;
  /** Merged over the recipe's `list` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A **render callback invoked once per `Select.Root` `items` entry** — the single authoring mode.
   * It receives the entry and its position, and returns that entry's markup:
   *
   * - **flat** (the default) — one call per *item*; return a `<Select.Item item={item}>`.
   * - **grouped** (`groupToItems` set on `Root`) — one call per *group entry*; return a
   *   `<Select.Group>` and iterate the group's own items with a plain `<For>`. Each `Select.Item`
   *   still resolves its own row from its `item`, so nesting depth is irrelevant. `index` is what a
   *   `<Select.Separator />` between groups keys off.
   *
   * Typing the parameter is the one annotation this costs: `<G>` cannot flow through Solid context,
   * so it is inferred from this callback instead and written once at the call site
   * (`{(product: Product) => …}`). The inner `<For>` infers normally.
   */
  children?: (entry: G, index: Accessor<number>) => JSX.Element;
}

/**
 * The `role="listbox"` element — the options' container and the scroll container an offscreen
 * highlighted option is scrolled inside. `createComboboxList` owns the sanitized list props: the id
 * the trigger's `aria-controls` names, the role, the `aria-labelledby` that falls back to the trigger
 * (so naming the trigger names the popup too), `aria-multiselectable`/`aria-orientation`, and the
 * `mousedown` `preventDefault()` that keeps DOM focus on the trigger when an option is clicked.
 *
 * It is deliberately **not** `state.list.rootProps`: that carries `tabindex="0"`, its own keymap and
 * its own `aria-activedescendant`, all of which belong on the trigger here. See `combobox-list.md`.
 *
 * **It iterates the items itself.** `Select.Root` already owns the array, so naming it twice would be
 * ceremony; in Combobox the same callback will iterate the *filtered* list, so the filter needs no
 * consumer wiring. A **function child invoked per row is not the multi-read component-valued-prop
 * shape**, so it needs no `children()` — the note at `listbox-root.tsx` applies verbatim. The rows
 * are declared as a nested component so their `<For>` gets its own owner, and rendered through the
 * `children` getter so each row's `Select.Item` resolves `useSelectContext()`.
 */
export function List<G = unknown>(props: SelectListProps<G>): JSX.Element {
  const ctx = useSelectContext();
  // The kernel hook types its props over `HTMLElement` while this part's public surface names the
  // real `<div>`, and `ref` is the one key that won't line up between them. Cast at this seam, per
  // CLAUDE.md — widening the public surface to `HTMLElement` instead would push a cast onto every
  // consumer writing `render={(p) => <div {...p} />}`.
  const list = createComboboxList(
    ctx.state,
    omit(props, "render", "class", "children") as unknown as JSX.HTMLAttributes<HTMLElement>,
  );

  function SelectRows(): JSX.Element {
    const renderRow = props.children ?? (() => undefined);
    // `ctx.items()` is the consumer's own array, typed `unknown[]` through the context; `<G>` is what
    // their callback annotation already asserted it to be.
    return (
      <For each={ctx.items() as readonly G[]}>{(entry, index) => renderRow(entry, index)}</For>
    );
  }

  const elementProps = merge(list.props, {
    get class(): string {
      return ctx.slots.list(props.class);
    },
    "data-slot": "select-list",
    get children(): JSX.Element {
      return <SelectRows />;
    },
  });

  return renderElement<SelectListElementProps, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps as unknown as SelectListElementProps,
    // The scroll container `createDataCollection.scrollIndexIntoView` scrolls — see the `render` note.
    ref: list.setRef,
  });
}
