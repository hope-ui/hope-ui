import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { useListboxContext, useListboxItemContext } from "./listbox-context";

export interface ListboxItemIndicatorProps {
  /**
   * A custom selection glyph. Defaults to hope's built-in check. Read **exactly once**, gated on the
   * item's `isSelected()` — see the `children()` note in the component below.
   */
  children?: JSX.Element;
}

/**
 * hope's default selection glyph — Lucide's `check`. Hand-inlined (hope ships no icon-library
 * dependency), `stroke="currentColor"` so it inherits the row's text color; the recipe's
 * `itemIndicator` slot sizes it.
 */
function CheckIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * The chosen-row check glyph. Purely presentational — it reads the item's `isSelected()` off
 * `ListboxItemContext` (behavior stays on the primitive) and shows the glyph in the row's reserved
 * trailing gutter (the recipe's `itemIndicator` slot) only while selected. `aria-hidden` because the
 * selection is already conveyed by the option's `aria-selected`.
 *
 * The custom glyph (`props.children`) is read **exactly once**, inside a `<Show>` gated on
 * `isSelected()` — not on the glyph prop itself. Per the codified `children()` decision procedure
 * (CLAUDE.md / __internal__/solid-2.0-notes.md), a component-valued child read **once** — inside a
 * `<Show>` or not — needs no `children()`: a single read hydrates fine; only the `when`-gate + body
 * *double* read misaligns `_hk`, and there is no such double read here (the gate is `isSelected()`).
 * Mirrors `CloseButton`'s single-read glyph.
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
        {props.children ?? <CheckIcon />}
      </span>
    </Show>
  );
}
