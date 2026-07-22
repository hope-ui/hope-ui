import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { useListboxContext, useListboxItemContext } from "./listbox-context";

export interface ListboxItemIndicatorProps {
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

  return (
    <Show when={itemCtx.isSelected()}>
      <span
        class={cx(ctx.slots.itemIndicator())}
        data-slot="listbox-item-indicator"
        aria-hidden="true"
      >
        {props.children ?? ctx.checkIcon()}
      </span>
    </Show>
  );
}
