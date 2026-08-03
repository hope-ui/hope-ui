import { createComponentContext } from "@hope-ui/primitives/internal";
import type { CreateListboxGroupReturn, CreateListboxReturn } from "@hope-ui/primitives/listbox";
import type { ListboxSlot, SlotClassAccessor } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";

/**
 * The value every Listbox part reads. It *holds* the headless state under `state` rather than
 * extending it, so the styling layer never masquerades as the primitive's return value. All
 * accessibility and behavior live on `state`; this layer contributes only `slots` and `checkIcon`.
 *
 * ## Why `state` is typed at `unknown`
 *
 * A Solid context value is a single concrete type, so the `<V>` item type cannot flow through it.
 * `Listbox.Root<V>` is therefore generic **at its props** and widens its state on the way into the
 * provider; each part that needs the typed state narrows it back at its own call site.
 */
export interface ListboxContextValue {
  /** The `createListbox` return — item source, focus/selection/navigation/typeahead, ids, the props
   * for the list element, and the form accessors. Passed straight into each part's own hook. */
  state: CreateListboxReturn<unknown>;
  /** One class function per named slot of the theme's `listbox` recipe, resolved once on `Root`. Each
   * takes the part's own `class` and folds it in last, through tailwind-merge, so a consumer's
   * utility wins over the recipe's. */
  slots: Record<ListboxSlot, SlotClassAccessor>;
  /**
   * The resolved default selection glyph — instance `checkIcon`, else the preset's, else hope's
   * built-in check — resolved once on `Root` because a multi-part component keeps its themeable
   * surface there. `Listbox.ItemIndicator` renders it when given no `children`.
   *
   * An accessor, so each read builds a **fresh** element: one shared element would be moved from row
   * to row rather than appearing in each.
   */
  checkIcon: () => JSX.Element;
}

export const [ListboxContext, useListboxContext] =
  createComponentContext<ListboxContextValue>("Listbox");

/**
 * The group scope, so a `Listbox.GroupLabel` can register its id onto its parent group's
 * `aria-labelledby`.
 */
export interface ListboxGroupContextValue {
  group: CreateListboxGroupReturn;
}

export const [ListboxGroupContext, useListboxGroupContext] =
  createComponentContext<ListboxGroupContextValue>("Listbox.Group");

/**
 * The per-item scope, so a `Listbox.ItemIndicator` can show or hide itself without recomputing
 * anything — the primitive decides what is selected, the indicator only paints it.
 */
export interface ListboxItemContextValue {
  isSelected: Accessor<boolean>;
  /** Whether this is the highlighted row (keyboard or hover), which is not the same as selected. */
  isActive: Accessor<boolean>;
}

export const [ListboxItemContext, useListboxItemContext] =
  createComponentContext<ListboxItemContextValue>("Listbox.Item");
