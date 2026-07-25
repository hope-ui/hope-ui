import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { merge, omit, Show } from "solid-js";
import { useListboxContext, useListboxItemContext } from "./listbox-context";

export interface ListboxItemIndicatorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLSpanElement>>;
  /** Merged over the recipe's `itemIndicator` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A custom selection glyph, overriding the default for this one indicator. When omitted, renders the
   * resolved default check (instance `checkIcon` ?? preset `defaultProps.listbox.checkIcon` ?? hope's
   * built-in check) from context. Read **exactly once**, gated on the item's `isSelected()` — see the
   * `children()` note in the component below.
   */
  children?: JSX.Element;
}

/**
 * The chosen-row check glyph. Purely presentational — it reads the item's `isSelected()` off
 * `ListboxItemContext` (behavior stays on the primitive) and shows the glyph in the row's reserved
 * trailing gutter (the recipe's `itemIndicator` slot) only while selected. `aria-hidden` because the
 * selection is already conveyed by the option's `aria-selected`.
 *
 * The glyph is **built in**: with no `children`, it renders `ctx.checkIcon()` — the resolved default
 * check (instance `checkIcon` ?? preset `defaultProps.listbox.checkIcon` ?? hope's built-in), an
 * accessor so each read builds a fresh element. A consumer `children` overrides it per instance. This
 * keeps the default glyph themeable app-wide from a preset, exactly like Calendar's `prevIcon`/`nextIcon`
 * — never a bare module-scope SVG the component layer hard-codes.
 *
 * There is no primitive part hook, unlike every sibling part: the indicator carries no behavior and
 * no ARIA beyond one constant, so there is nothing for the kernel to own and the consumer's native
 * attributes are merged here directly.
 *
 * The custom glyph (`props.children`) is read **exactly once**, inside a `<Show>` gated on
 * `isSelected()` — not on the glyph prop itself. Per the codified `children()` decision procedure
 * (CLAUDE.md / __internal__/solid-2.0-notes.md), a component-valued child read **once** — inside a
 * `<Show>` or not — needs no `children()`: a single read hydrates fine; only the `when`-gate + body
 * *double* read misaligns `_hk`, and there is no such double read here (the gate is `isSelected()`).
 * Mirrors `Calendar.PrevButton`'s single-read glyph.
 */
export function ItemIndicator(props: ListboxItemIndicatorProps): JSX.Element {
  const ctx = useListboxContext();
  const itemCtx = useListboxItemContext();

  const rest = omit(props, "render", "class", "children");

  const elementProps = merge(rest, {
    "data-slot": "listbox-item-indicator",
    // Component-owned, deliberately not forwardable: un-hiding the glyph would double-announce a
    // selection the option's own `aria-selected` already conveys.
    "aria-hidden": "true" as const,
    get class(): string {
      return cx(ctx.slots.itemIndicator(), props.class) ?? "";
    },
    get children(): JSX.Element {
      return props.children ?? ctx.checkIcon();
    },
  });

  return (
    <Show when={itemCtx.isSelected()}>
      {renderElement<JSX.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>({
        as: "span",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
}
