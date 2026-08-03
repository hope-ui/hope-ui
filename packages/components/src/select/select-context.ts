import type { CreateComboboxReturn } from "@hope-ui/primitives/combobox";
import { createComponentContext } from "@hope-ui/primitives/internal";
import type { CreateListboxGroupReturn } from "@hope-ui/primitives/listbox";
import type { SelectSlot, SlotClassAccessor } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";

/**
 * The value every Select part reads. It **holds** the headless `createCombobox` return as `state`
 * rather than extending it, so this styling layer never masquerades as the behavior layer: all the
 * ARIA and interaction lives on `ctx.state`, and the component layer contributes only `slots` and the
 * two default glyphs. A part feeds `ctx.state` to its own `createComboboxX` hook and reads recipe
 * classes off `ctx.slots`.
 *
 * A Solid context value is one concrete type, so the item type `<V>` cannot flow through it. The
 * context is typed at `CreateComboboxReturn<unknown>`, `Select.Root<V, M, G>` is generic at its props
 * and casts on the way in, and each part casts back at its own call site — `Select.Item` is the only
 * one that needs to.
 */
export interface SelectContextValue {
  /** The behavior layer — open state, `state.list` (the option set plus focus/selection/navigation/
   *  typeahead), the generated ids, the element refs, popup positioning, the animation state. */
  state: CreateComboboxReturn<unknown>;
  /** One class fn per Select slot, resolved once on `Root`. Each takes the part's own `class` and
   *  folds it in last, through the recipe's tailwind-merge seam. */
  slots: Record<SelectSlot, SlotClassAccessor>;
  /**
   * `Select.Root`'s `items` as the consumer passed them — the items for a flat list, the group
   * entries once `groupToItems` is set. `Select.List` iterates exactly this.
   *
   * It rides the context instead of being re-derived from `state.list` because the behavior layer
   * *flattens* its copy into navigation order: `state.list.indexed.items()` has no group boundaries
   * left in it. The consumer's array is the only place the grouped shape still exists.
   */
  items: Accessor<readonly unknown[]>;
  /**
   * The resolved trigger chevron (instance `chevronIcon` ?? preset `defaultProps.select.chevronIcon`
   * ?? hope's built-in), which `Select.Icon` renders when given no `children`. An accessor, so every
   * read builds a fresh element rather than reusing one node that would then be moved.
   */
  chevronIcon: () => JSX.Element;
  /** The resolved selection-check glyph, same chain and same reasoning. `Select.ItemIndicator`
   *  renders this when given no `children`. */
  checkIcon: () => JSX.Element;
}

export const [SelectContext, useSelectContext] =
  createComponentContext<SelectContextValue>("Select");

/**
 * The group scope: a `Select.Group` publishes its behavior-layer return here so its
 * `Select.GroupLabel` child can register its id onto the group's `aria-labelledby`.
 */
export interface SelectGroupContextValue {
  group: CreateListboxGroupReturn;
}

export const [SelectGroupContext, useSelectGroupContext] =
  createComponentContext<SelectGroupContextValue>("Select.Group");

/**
 * The per-item scope: a `Select.Item` publishes these so its `Select.ItemIndicator` child can show or
 * hide the check glyph without recomputing anything of its own.
 */
export interface SelectItemContextValue {
  isSelected: Accessor<boolean>;
  /** Whether this is the highlighted row. Focus never leaves the trigger — the highlight travels as
   *  `aria-activedescendant` — so this is the only signal a row has that the keyboard is on it. */
  isActive: Accessor<boolean>;
}

export const [SelectItemContext, useSelectItemContext] =
  createComponentContext<SelectItemContextValue>("Select.Item");
