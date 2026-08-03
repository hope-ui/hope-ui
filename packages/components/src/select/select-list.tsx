import { createComboboxList } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Accessor, For, merge, omit } from "solid-js";
import { useSelectContext } from "./select-context";

type SelectListElementProps = JSX.HTMLAttributes<HTMLDivElement>;

/**
 * `<G>` is the shape of a `Select.Root` `items` **entry** — the item for a flat list, the group entry
 * once `groupToItems` is set. It cannot flow here from `Root` (a Solid context value is one concrete
 * type), so it is inferred from the `children` callback's own annotation instead: writing
 * `{(product: Product) => …}` binds it at the call site, and the inner `<For>` infers from there.
 */
export interface SelectListProps<G = unknown> extends Omit<SelectListElementProps, "children"> {
  /**
   * Renders the list container as a different element/component while keeping List's computed props
   * (`role="listbox"`, the id the trigger's `aria-controls` names, the list-level ARIA, and the
   * mousedown guard that keeps DOM focus on the trigger). **Not** the per-entry `children` callback
   * below — this re-targets the container, that one builds a row.
   *
   * The internal ref rides along, and it registers this element as the list's **scroll container**.
   * A target that drops function refs leaves an offscreen highlighted option offscreen forever, since
   * nothing else scrolls it: no option ever takes DOM focus.
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
   *   resolves its own row from its `item`, so nesting depth is irrelevant. `index` is what a
   *   `<Select.Separator />` between groups keys off.
   *
   * Annotating the parameter is what binds `<G>` — it cannot flow through a Solid context, so it is
   * inferred here instead (`{(product: Product) => …}`) and the inner `<For>` follows.
   */
  children?: (entry: G, index: Accessor<number>) => JSX.Element;
}

/**
 * The `role="listbox"` element — the options' container, and the box an offscreen highlighted option
 * is scrolled inside. `createComboboxList` owns the list props: the id the trigger's `aria-controls`
 * names, the role, the `aria-labelledby` that falls back to the trigger (so naming the trigger names
 * the popup too), `aria-multiselectable`/`aria-orientation`, and the `mousedown` `preventDefault()`
 * that keeps DOM focus on the trigger when an option is clicked.
 *
 * It deliberately does **not** use the option list's own `rootProps`: those carry `tabindex="0"`, a
 * keymap and an `aria-activedescendant`, all of which belong on the trigger in this pattern.
 *
 * The rows are declared as a nested component so their `<For>` gets its own reactive scope, and
 * rendered through the `children` getter so each row's `Select.Item` can resolve the context.
 */
export function List<G = unknown>(props: SelectListProps<G>): JSX.Element {
  const ctx = useSelectContext();
  // The behavior hook types its props over `HTMLElement` while this part's public surface names the
  // real `<div>`, and `ref` is the one key that won't line up. Cast here rather than widening the
  // public surface, which would push a cast onto every consumer writing a `render` of their own.
  const list = createComboboxList(
    ctx.state,
    omit(props, "render", "class", "children") as unknown as JSX.HTMLAttributes<HTMLElement>,
  );

  function SelectRows(): JSX.Element {
    const renderRow = props.children ?? (() => undefined);
    // The context erases the item type, so this restores what the callback's annotation asserted.
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
    // Registers this element as the scroll container — see the `render` note above.
    ref: list.setRef,
  });
}
