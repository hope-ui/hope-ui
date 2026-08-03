import { createComboboxValue } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { useSelectContext } from "./select-context";

type SelectValueElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

/**
 * `<V>` is the item type. It cannot flow here from `Select.Root` (a Solid context value is one
 * concrete type), so it is inferred from the `children` callback's annotation instead — and only when
 * the callback form is used at all.
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
   * The parameter's type comes from the annotation you write, since `<V>` cannot flow through a Solid
   * context. It is an **array in both selection modes** — a single Select's is empty or one long —
   * because that is the shape the option list holds; the scalar⇄array adaptation happens on
   * `Select.Root`'s `value`/`onChange`.
   *
   * With no `children`, the selected items' labels are joined with `", "` using `Select.Root`'s
   * `itemToLabel` (falling back to `itemToValue`).
   */
  children?: JSX.Element | ((values: V[]) => JSX.Element);
}

/**
 * The value part: the element inside the trigger that displays the current selection, and the reason
 * a screen reader announces that selection **before** the field's label. This element registers its
 * id upward and the trigger prepends it to its own `aria-labelledby`.
 *
 * **It must be rendered as its own part** — never hoisted into an ancestor. The registration is what
 * publishes the id, so a tree that runs the hook higher up without mounting a Value element leaves
 * the trigger's `aria-labelledby` pointing at nothing.
 *
 * The empty state is `data-placeholder` on this element rather than a part or slot of its own:
 * nothing extra is rendered, only styled differently.
 *
 * `placeholder` and `children` may hold JSX, and each is read **exactly once** per evaluation, on
 * mutually exclusive branches. Reading such a prop twice would build the component twice and give the
 * two copies different hydration positions, so neither may be read again below.
 */
export function Value<V = unknown>(props: SelectValueProps<V>): JSX.Element {
  const ctx = useSelectContext();
  const list = ctx.state.list;
  const value = createComboboxValue(
    ctx.state,
    omit(props, "render", "class", "children", "placeholder"),
  );

  // `itemToLabel` is optional (the option list falls back to `itemToValue` for its own text), so the
  // display text has to spell the same fallback.
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
