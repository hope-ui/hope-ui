import type { CreateComboboxReturn } from "@hope-ui/primitives/combobox";
import { type CreateTextInputReturn, createComponentContext } from "@hope-ui/primitives/internal";
import type { CreateListboxGroupReturn } from "@hope-ui/primitives/listbox";
import type { ComboboxSlot, SlotClassAccessor } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";

/**
 * The value every Combobox part reads. It **holds** the headless `createCombobox` return as `state`
 * rather than extending it, exactly as Select's does: a part feeds `ctx.state` to its own
 * `createComboboxX` hook and reads recipe classes off `ctx.slots`.
 *
 * What it carries that Select's does not is the **text half** — the text-entry state, the
 * commit/revert policy the input hook calls out to, and the typing hook that drives the filter. All of
 * it lives at this layer because the behavior layer deliberately owns no text value.
 *
 * A Solid context value is one concrete type, so the item type `<V>` cannot flow through it. The
 * context is typed at `CreateComboboxReturn<unknown>`, `Combobox.Root<V, M, G>` is generic at its
 * props and casts on the way in, and each part casts back at its own call site — `Combobox.Item` is
 * the only one that needs to.
 */
export interface ComboboxContextValue {
  /** The behavior layer — open state, `state.list` (the **filtered** option set plus
   *  focus/selection/navigation), the generated ids, the element refs, popup positioning. */
  state: CreateComboboxReturn<unknown>;
  /** One class fn per Combobox slot, resolved once on `Root`. Each takes the part's own `class` and
   *  folds it in last, through the recipe's tailwind-merge seam. */
  slots: Record<ComboboxSlot, SlotClassAccessor>;
  /**
   * The text-entry state. It is created on `Root`, not on `Combobox.Input`, because `inputValue` is a
   * root-level prop **and** because the filter derives from it: a value created inside the lazily
   * mounted input part would not exist yet when `Root`'s `items` memo first runs.
   */
  textInput: CreateTextInputReturn<HTMLInputElement>;
  /**
   * Accept the current suggestion — the highlighted option if there is one, else the typed text if
   * `allowsCustomValue`, else nothing. Bound to Enter, Tab and blur, so it must be **idempotent**:
   * Tab fires it and the blur right after fires it again.
   */
  commit: () => void;
  /** Restore the field to the last committed text. Bound to Escape. */
  revert: () => void;
  /**
   * The user typed. Wired onto the input ahead of the text state's own write, so it runs once per
   * keystroke: it drops "show every option" (the state a chevron-open leaves behind) and, under the
   * default `menuTrigger: "input"`, opens the popup.
   */
  onUserInput: () => void;
  /**
   * The field took focus. Opens the popup only under `menuTrigger: "focus"`; a no-op otherwise.
   */
  onUserFocus: () => void;
  /**
   * `Combobox.Root`'s **filtered** entries, in the shape the consumer passed them: items for a flat
   * list, group entries once `groupToItems` is set. `Combobox.List` iterates exactly this.
   *
   * It rides the context instead of being re-derived from `state.list` because the behavior layer
   * *flattens* its copy into navigation order: `state.list.indexed.items()` has no group boundaries
   * left in it.
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
   * ?? hope's built-in). An accessor, so every read builds a fresh element rather than reusing one
   * node that would then be moved.
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
 * The group scope: a `Combobox.Group` publishes its behavior-layer return here so its
 * `Combobox.GroupLabel` child can register its id onto the group's `aria-labelledby`.
 */
export interface ComboboxGroupContextValue {
  group: CreateListboxGroupReturn;
}

export const [ComboboxGroupContext, useComboboxGroupContext] =
  createComponentContext<ComboboxGroupContextValue>("Combobox.Group");

/**
 * The per-item scope: a `Combobox.Item` publishes these so its `Combobox.ItemIndicator` child can show
 * or hide the check glyph without recomputing anything of its own.
 */
export interface ComboboxItemContextValue {
  isSelected: Accessor<boolean>;
  /** Whether this is the highlighted row. Focus never leaves the input — the highlight travels as
   *  `aria-activedescendant` — so this is the only signal a row has that the keyboard is on it. */
  isActive: Accessor<boolean>;
}

export const [ComboboxItemContext, useComboboxItemContext] =
  createComponentContext<ComboboxItemContextValue>("Combobox.Item");
