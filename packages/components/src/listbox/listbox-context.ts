import { createComponentContext } from "@hope-ui/primitives/internal";
import type { CreateListboxGroupReturn, CreateListboxReturn } from "@hope-ui/primitives/listbox";
import type { ListboxSlot } from "@hope-ui/theming";
import type { Accessor } from "solid-js";

/**
 * The value every Listbox part reads. **Composition, not inheritance**: it *holds* the primitive
 * state as `state` (the item source + focus/selection/navigation/typeahead instances, ids, the
 * pointer fight-guard, `rootProps`, and the form accessors) rather than extending
 * `CreateListboxReturn`, so the styling layer never masquerades as the primitive return. A part
 * passes `ctx.state` into its `createListboxX(state, …)` hook and reads recipe classes off
 * `ctx.slots`. All a11y/behavior lives on `ctx.state`; the component layer contributes only `slots`.
 *
 * ## The generic-through-context cast
 *
 * The `<V>` item type cannot flow through Solid's context (a context value is a single concrete
 * type). So the context is typed at `CreateListboxReturn<unknown>` and `Listbox.Root<V>` is generic
 * **at its props**, casting its `createListbox<V>(…)` return into the provider. Each part that needs
 * the typed state casts back to `CreateListboxReturn<V>` at its own call site. This is the standard
 * Solid/Kobalte approach — the same one Dialog would use if it were generic.
 */
export interface ListboxContextValue {
  /** The primitive listbox state — item source, focus/selection/navigation/typeahead, ids, the
   * pointer fight-guard, `rootProps`, and the form accessors. Passed straight into each part's hook. */
  state: CreateListboxReturn<unknown>;
  /** One ready-to-call class fn per Listbox slot, resolved once on `Root` and shared here. */
  slots: Record<ListboxSlot, () => string>;
}

export const [ListboxContext, useListboxContext] =
  createComponentContext<ListboxContextValue>("Listbox");

/**
 * The group scope. A `Listbox.Group` renders its primitive group return here so its
 * `Listbox.GroupLabel` child can register its id onto the group's `aria-labelledby`.
 */
export interface ListboxGroupContextValue {
  /** The primitive group return — its `props` + the label-id registration seam. */
  group: CreateListboxGroupReturn;
}

export const [ListboxGroupContext, useListboxGroupContext] =
  createComponentContext<ListboxGroupContextValue>("Listbox.Group");

/**
 * The per-item scope. A `Listbox.Item` publishes its selection/active accessors here so its
 * `Listbox.ItemIndicator` child can show/hide the check glyph off `isSelected()` without recomputing
 * anything — behavior stays on the primitive, the indicator is pure presentation.
 */
export interface ListboxItemContextValue {
  /** Whether this item is selected — drives the `ItemIndicator`'s `<Show>`. */
  isSelected: Accessor<boolean>;
  /** Whether this item is the active (highlighted) one. */
  isActive: Accessor<boolean>;
}

export const [ListboxItemContext, useListboxItemContext] =
  createComponentContext<ListboxItemContextValue>("Listbox.Item");
