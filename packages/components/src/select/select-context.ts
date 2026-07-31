import type { CreateComboboxReturn } from "@hope-ui/primitives/combobox";
import { createComponentContext } from "@hope-ui/primitives/internal";
import type { CreateListboxGroupReturn } from "@hope-ui/primitives/listbox";
import type { SelectSlot, SlotClassAccessor } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";

/**
 * The value every Select part reads. **Composition, not inheritance**: it *holds* the combobox kernel
 * as `state` (open state, the eagerly-created listbox, the ids, the element registries, the floating
 * layer and the shared presence) rather than extending `CreateComboboxReturn`, so the styling layer
 * never masquerades as the primitive return. A part passes `ctx.state` into its `createComboboxX`
 * hook and reads recipe classes off `ctx.slots`. All a11y/behavior lives on `ctx.state`; the
 * component layer contributes only `slots` and the two default glyphs.
 *
 * ## The generic-through-context cast
 *
 * The `<V>` item type cannot flow through Solid's context (a context value is a single concrete
 * type). So the context is typed at `CreateComboboxReturn<unknown>` and `Select.Root<V, M, G>` is
 * generic **at its props**, casting its `createCombobox<V, M, G>(…)` return into the provider. Each
 * part that needs the typed state casts back at its own call site — `Select.Item` is the only one
 * that does. The same approach `Listbox` takes.
 */
export interface SelectContextValue {
  /** The combobox kernel — open state, `state.list` (the option set + focus/selection/navigation/
   *  typeahead), the ids, the element registries, the floating layer, the shared presence. */
  state: CreateComboboxReturn<unknown>;
  /** One ready-to-call class fn per Select slot, resolved once on `Root` and shared here. Each takes
   *  the part's own `class`, folded in last through the recipe's tailwind-merge seam. */
  slots: Record<SelectSlot, SlotClassAccessor>;
  /**
   * `Select.Root`'s `items`, as the consumer passed them — the **items** for a flat list, the
   * **group entries** when `groupToItems` is set. `Select.List` iterates exactly this and invokes its
   * callback child per entry.
   *
   * It rides the context rather than being re-derived from `state.list` because the kernel's item
   * source is *flattened* into navigation order: `state.list.indexed.items()` has no group boundaries
   * left in it, which is precisely what the kernel needs and precisely what `Select.List` must not
   * iterate. The consumer's array is the only place the grouped shape still exists.
   */
  items: Accessor<readonly unknown[]>;
  /**
   * The resolved trigger chevron (instance `chevronIcon` ?? preset `defaultProps.select.chevronIcon`
   * ?? hope's built-in chevron-down), resolved once on `Root` — the multi-part component keeps its
   * themeable surface on the root — and flowed here. `Select.Icon` renders this when given no
   * `children`. An accessor, so each read builds a **fresh** element, never a reused, movable node.
   */
  chevronIcon: () => JSX.Element;
  /** The resolved selection-check glyph, same chain and same reasoning. `Select.ItemIndicator`
   *  renders this when given no `children`. */
  checkIcon: () => JSX.Element;
}

export const [SelectContext, useSelectContext] =
  createComponentContext<SelectContextValue>("Select");

/**
 * The group scope. A `Select.Group` renders its primitive group return here so its
 * `Select.GroupLabel` child can register its id onto the group's `aria-labelledby`.
 */
export interface SelectGroupContextValue {
  /** The primitive group return — its `props` + the label-id registration seam. */
  group: CreateListboxGroupReturn;
}

export const [SelectGroupContext, useSelectGroupContext] =
  createComponentContext<SelectGroupContextValue>("Select.Group");

/**
 * The per-item scope. A `Select.Item` publishes its selection/active accessors here so its
 * `Select.ItemIndicator` child can show/hide the check glyph off `isSelected()` without recomputing
 * anything — behavior stays on the primitive, the indicator is pure presentation.
 */
export interface SelectItemContextValue {
  /** Whether this item is selected — drives the `ItemIndicator`'s `<Show>`. */
  isSelected: Accessor<boolean>;
  /** Whether this item is the active (highlighted) one. In activedescendant mode no option ever
   *  holds DOM focus, so this is the only signal a row has that the keyboard is on it. */
  isActive: Accessor<boolean>;
}

export const [SelectItemContext, useSelectItemContext] =
  createComponentContext<SelectItemContextValue>("Select.Item");
