import { createComboboxValue } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { useSelectContext } from "./select-context";

type SelectValueElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

/**
 * `<V>` is the item type. It cannot flow here from `Select.Root` (a Solid context value is a single
 * concrete type), so it is inferred from the `children` callback's annotation instead — the same one
 * annotation `Select.List` costs, and only when the callback form is used at all.
 */
export interface SelectValueProps<V = unknown> extends Omit<SelectValueElementProps, "children"> {
  /** Renders as a different element/component while keeping Value's computed props (its registered
   *  `id` and the `data-placeholder` hook). */
  render?: RenderProp<SelectValueElementProps>;
  /** Merged over the recipe's `value` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /** What to show while nothing is selected. Rendered in place of the value, with
   *  `data-placeholder` present on the element so the recipe can dim it. */
  placeholder?: JSX.Element;
  /**
   * Overrides how the selection is displayed. Either fixed content, or — the useful form — a callback
   * receiving the **selected items**, which is how a multiple Select shows a summary instead of a
   * comma-joined list:
   *
   * ```tsx
   * <Select.Value placeholder="Any fruit">{(values: Fruit[]) => `${values.length} selected`}</Select.Value>
   * ```
   *
   * The parameter's type is inferred from the annotation you write — `<V>` cannot flow through a
   * Solid context, the same one annotation `Select.List`'s callback costs. It is an **array in both
   * selection modes** (a single Select's is empty or one long), because that is the shape the listbox
   * holds; the scalar⇄array adaptation is a `Select.Root` `value`/`onChange` concern.
   *
   * With no `children`, the selected items' labels are joined with `", "` using `Select.Root`'s
   * `itemToLabel` (falling back to `itemToValue`).
   */
  children?: JSX.Element | ((values: V[]) => JSX.Element);
}

/**
 * The value part: the element inside the trigger that displays the current selection, and the reason
 * the trigger can announce that selection **before** the field's label. `createComboboxValue`
 * registers this element's id upward and `createComboboxTrigger` prepends it to the trigger's
 * `aria-labelledby` — react-aria's `useSelect` ordering. This layer adds the recipe `value` slot +
 * `data-slot` and decides what text to show.
 *
 * **It must be rendered as its own part, and the hook called from this body** — never hoisted into an
 * ancestor. The registration publishes a `valueId` upward, so a tree that calls the hook higher up
 * *without* mounting a Value part still publishes one, and the trigger's `aria-labelledby` points at
 * an element that does not exist.
 *
 * The empty state is `data-placeholder` on this element (owned by the hook), not a part or slot of its
 * own: nothing extra is rendered when the selection is empty, only styled differently.
 *
 * Both `placeholder` and `children` are component-valued props read **exactly once** per evaluation
 * of the `children` getter, on mutually exclusive branches — never the `<Show>` `when`-gate + body
 * *double* read that misaligns `_hk`, so neither needs `children()`. See the decision procedure in
 * `__internal__/solid-2.0-notes.md`.
 */
export function Value<V = unknown>(props: SelectValueProps<V>): JSX.Element {
  const ctx = useSelectContext();
  const list = ctx.state.list;
  const value = createComboboxValue(
    ctx.state,
    omit(props, "render", "class", "children", "placeholder"),
  );

  // `itemToLabel` is optional on the primitive return (the source falls back to `itemToValue` for its
  // own `textValue`), so the display text has to spell the same fallback.
  const labelOf = (item: unknown): string => (list.itemToLabel ?? list.itemToValue)(item);

  const elementProps = merge(value.props, {
    get class(): string {
      return ctx.slots.value(props.class);
    },
    "data-slot": "select-value",
    get children(): JSX.Element {
      const selected = list.value();
      if (selected.length === 0) {
        return props.placeholder;
      }
      const display = props.children;
      return typeof display === "function"
        ? display(selected as V[])
        : (display ?? selected.map(labelOf).join(", "));
    },
  });

  return renderElement<SelectValueElementProps, HTMLSpanElement>({
    as: "span",
    render: props.render,
    props: elementProps as unknown as SelectValueElementProps,
  });
}
