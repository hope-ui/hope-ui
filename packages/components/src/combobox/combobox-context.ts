import type { CreateComboboxReturn } from "@hope-ui/primitives/combobox";
import { type CreateTextInputReturn, createComponentContext } from "@hope-ui/primitives/internal";
import type { CreateListboxGroupReturn } from "@hope-ui/primitives/listbox";
import type { ComboboxSlot, SlotClassAccessor } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";

/**
 * The value every Combobox part reads. **Composition, not inheritance**: it *holds* the combobox
 * kernel as `state` rather than extending `CreateComboboxReturn`, exactly as `Select` does — a part
 * passes `ctx.state` into its `createComboboxX` hook and reads recipe classes off `ctx.slots`.
 *
 * What it carries that Select's does not is the **text half**: the root-owned `createTextInput`, the
 * commit/revert policy the kernel's input hook calls out to, and the typing hook that drives the
 * filter. All four exist here rather than in the kernel because the kernel owns no text value — see
 * `__internal__/primitives/combobox/combobox-root.md`.
 *
 * ## The generic-through-context cast
 *
 * The `<V>` item type cannot flow through Solid's context (a context value is a single concrete
 * type). So the context is typed at `CreateComboboxReturn<unknown>` and `Combobox.Root<V, M, G>` is
 * generic **at its props**, casting its `createCombobox<V, M, G>(…)` return into the provider. Each
 * part that needs the typed state casts back at its own call site — `Combobox.Item` is the only one
 * that does.
 */
export interface ComboboxContextValue {
  /** The combobox kernel — open state, `state.list` (the **filtered** option set + focus/selection/
   *  navigation), the ids, the element registries, the floating layer, the shared presence. */
  state: CreateComboboxReturn<unknown>;
  /** One ready-to-call class fn per Combobox slot, resolved once on `Root` and shared here. Each
   *  takes the part's own `class`, folded in last through the recipe's tailwind-merge seam. */
  slots: Record<ComboboxSlot, SlotClassAccessor>;
  /**
   * The root-owned text-entry state. It lives on `Root` rather than on `Combobox.Input` because
   * `inputValue` is a root-level prop **and** because the filter derives from it — a value created
   * inside the lazily-assembled input part would not exist when `Root`'s `items` memo first runs.
   * `Combobox.Input` hands it straight to `createComboboxInput`.
   */
  textInput: CreateTextInputReturn<HTMLInputElement>;
  /**
   * Accept the current suggestion — the highlighted option if there is one, else the typed text if
   * `allowsCustomValue`, else nothing. Bound by the kernel to Enter, Tab and blur. **Idempotent**:
   * Tab fires it and blur fires it again.
   */
  commit: () => void;
  /** Restore the field to the last committed text. Bound by the kernel to Escape. */
  revert: () => void;
  /**
   * The user typed. Wired onto the input ahead of the text primitive's own write, so it runs once
   * per keystroke: it drops "show every option" (the state a chevron-open leaves behind) and, under
   * the default `menuTrigger: "input"`, opens the popup.
   */
  onUserInput: () => void;
  /**
   * The field took focus. Wired onto the input behind the kernel's own focus tracking; it opens the
   * popup only under `menuTrigger: "focus"`, and does nothing under the other two.
   */
  onUserFocus: () => void;
  /**
   * `Combobox.Root`'s **filtered** entries, in the shape the consumer passed them: items for a flat
   * list, group entries when `groupToItems` is set. `Combobox.List` iterates exactly this.
   *
   * It rides the context rather than being re-derived from `state.list` because the kernel's item
   * source is *flattened* into navigation order — `state.list.indexed.items()` has no group
   * boundaries left in it, which is precisely what the kernel needs and precisely what
   * `Combobox.List` must not iterate.
   */
  items: Accessor<readonly unknown[]>;
  /**
   * A group entry's own **filtered** items. `Combobox.List` passes the result to its callback's third
   * argument, because a consumer iterating their own `category.products` under a filter would render
   * every row the filter just removed. Returns the entry's full items when nothing is being filtered.
   */
  itemsOfGroup: (entry: unknown) => readonly unknown[];
  /** Whether the filtered set is empty — what `Combobox.Empty` shows itself on. */
  isEmpty: Accessor<boolean>;

  /**
   * The resolved trigger chevron (instance `chevronIcon` ?? preset `defaultProps.combobox.chevronIcon`
   * ?? hope's built-in chevron-down), resolved once on `Root`. An accessor, so each read builds a
   * **fresh** element, never a reused, movable node.
   */
  chevronIcon: () => JSX.Element;
  /** The resolved selection-check glyph, same chain and same reasoning. */
  checkIcon: () => JSX.Element;
  /** The resolved clear glyph, same chain and same reasoning. */
  clearIcon: () => JSX.Element;
}

export const [ComboboxContext, useComboboxContext] =
  createComponentContext<ComboboxContextValue>("Combobox");

/**
 * The group scope. A `Combobox.Group` renders its primitive group return here so its
 * `Combobox.GroupLabel` child can register its id onto the group's `aria-labelledby`.
 */
export interface ComboboxGroupContextValue {
  /** The primitive group return — its `props` + the label-id registration seam. */
  group: CreateListboxGroupReturn;
}

export const [ComboboxGroupContext, useComboboxGroupContext] =
  createComponentContext<ComboboxGroupContextValue>("Combobox.Group");

/**
 * The per-item scope. A `Combobox.Item` publishes its selection/active accessors here so its
 * `Combobox.ItemIndicator` child can show/hide the check glyph off `isSelected()` without
 * recomputing anything — behavior stays on the primitive, the indicator is pure presentation.
 */
export interface ComboboxItemContextValue {
  /** Whether this item is selected — drives the `ItemIndicator`'s `<Show>`. */
  isSelected: Accessor<boolean>;
  /** Whether this item is the active (highlighted) one. In activedescendant mode no option ever
   *  holds DOM focus, so this is the only signal a row has that the keyboard is on it. */
  isActive: Accessor<boolean>;
}

export const [ComboboxItemContext, useComboboxItemContext] =
  createComponentContext<ComboboxItemContextValue>("Combobox.Item");
