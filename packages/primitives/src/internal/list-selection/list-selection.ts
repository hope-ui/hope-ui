import { type Accessor, createEffect, createSignal, untrack } from "solid-js";
import { compareByIdOrReference, type ValueComparator } from "../../utils/equality/equality";
import type { CollectionItem } from "../collection/collection";
import { createControllableState } from "../controllable/controllable";
import type { CreateListFocusReturn } from "../list-focus/list-focus";

export type SelectionMode = "none" | "single" | "multiple";
/**
 * Whether selection tracks focus.
 * - `"explicit"` (default): selection changes only on an explicit action (Space/Enter, click).
 * - `"follow"`: the active item becomes selected as focus moves (single-select listbox, Tabs).
 */
export type SelectionBehavior = "explicit" | "follow";

export interface CreateListSelectionOptions<V> {
  /** The shared focus instance selection reads the active item and item order from. */
  focus: CreateListFocusReturn<V>;
  /** `"single"` (default), `"multiple"`, or `"none"`. Reactive. */
  selectionMode?: Accessor<SelectionMode>;
  /** Controlled selected values. Omit for uncontrolled use via `defaultValue`. */
  value?: Accessor<V[] | undefined>;
  /** Initial selection, uncontrolled. Default `[]`. */
  defaultValue?: V[];
  /** Called on every selection change with the new value array. */
  onChange?: (value: V[]) => void;
  /** Whether selection follows focus. Default `"explicit"`. Reactive. */
  selectionBehavior?: Accessor<SelectionBehavior>;
  /**
   * Gate for the follow-focus effect, e.g. `() => !typeahead.isTyping()` so browsing by typeahead
   * does not select. Default always-on. Only consulted when `selectionBehavior` is `"follow"`.
   */
  shouldFollowFocus?: Accessor<boolean>;
  /**
   * How two values are compared for equality — the escape hatch for object values that aren't
   * reference-stable (a fresh `{ id, name }` each render). Defaults to `compareByIdOrReference`
   * (`utils/equality`): `a.id === b.id` when both values are objects carrying an `id`, else
   * `a === b`. Modeled on Angular Material's `compareWith`.
   */
  compareWith?: ValueComparator<V>;
}

export interface CreateListSelectionReturn<V> {
  /** The current selection, in no particular order. */
  value: Accessor<V[]>;
  /** Whether `item` is selected. */
  isSelected(item: CollectionItem<V>): boolean;
  /** Add `item` to the selection (single mode replaces). Sets the range anchor. */
  select(item: CollectionItem<V>): void;
  /** Remove `item` from the selection. */
  deselect(item: CollectionItem<V>): void;
  /** Flip `item`'s selected state. Sets the range anchor. */
  toggle(item: CollectionItem<V>): void;
  /** Replace the whole selection with just `item`. Sets the range anchor. */
  selectOne(item: CollectionItem<V>): void;
  /**
   * Select every focusable item from the range anchor to `toIndex` (defaults to the active item),
   * replacing the current selection. Multiple mode only; no-op otherwise. This is Shift+Arrow /
   * Shift+Click.
   */
  selectRange(toIndex?: number): void;
  /** Select every focusable item. Multiple mode only. */
  selectAll(): void;
  /** Clear the selection. */
  deselectAll(): void;
  /** Toggle the active item (Space). */
  toggleActive(): void;
  /** Select the active item (Enter). */
  selectActive(): void;
  /** Set the range anchor explicitly (e.g. on pointer-down before a shift extension). */
  setAnchor(index: number): void;
}

/** The inclusive integer range between two indices, in ascending order. Pure; unit-tested. */
export function selectionRange(fromIndex: number, toIndex: number): number[] {
  const low = Math.min(fromIndex, toIndex);
  const high = Math.max(fromIndex, toIndex);
  const range: number[] = [];
  for (let index = low; index <= high; index++) range.push(index);
  return range;
}

/**
 * Selection state layered on a [`createListFocus`](../list-focus/list-focus.md) instance:
 * single/multiple, explicit or follow-focus, with Shift range extension. Modeled on Angular Aria's
 * `list-selection`; the behavior checklist (select-on-focus, Ctrl+A, Shift-extend from an anchor)
 * is cross-checked against react-aria's `useSelectableCollection`/`useSelectableItem`.
 *
 * Object values are supported: pass `compareWith` (or rely on the id-based
 * {@link compareByIdOrReference} default) so values need not be reference-stable.
 */
export function createListSelection<V>(
  options: CreateListSelectionOptions<V>,
): CreateListSelectionReturn<V> {
  const { focus } = options;
  const mode = () => options.selectionMode?.() ?? "single";
  const compare = (a: V, b: V) => (options.compareWith ?? compareByIdOrReference)(a, b);

  const [value, setValue] = createControllableState<V[]>({
    value: () => options.value?.(),
    defaultValue: () => options.defaultValue ?? [],
    onChange: (next) => options.onChange?.(next),
  });

  const [anchorIndex, setAnchorIndex] = createSignal(-1);

  const contains = (values: V[], candidate: V) => values.some((entry) => compare(entry, candidate));
  const isSelected = (item: CollectionItem<V>) => contains(value(), item.value());

  const add = (values: V[], candidate: V) =>
    contains(values, candidate) ? values : [...values, candidate];
  const remove = (values: V[], candidate: V) =>
    values.filter((entry) => !compare(entry, candidate));

  const anchorTo = (item: CollectionItem<V>) => setAnchorIndex(focus.items().indexOf(item));

  const select = (item: CollectionItem<V>) => {
    if (mode() === "none") return;
    anchorTo(item);
    setValue(mode() === "single" ? [item.value()] : add(value(), item.value()));
  };

  const deselect = (item: CollectionItem<V>) => {
    if (mode() === "none") return;
    setValue(remove(value(), item.value()));
  };

  const toggle = (item: CollectionItem<V>) => {
    if (mode() === "none") return;
    anchorTo(item);
    if (isSelected(item)) setValue(remove(value(), item.value()));
    else setValue(mode() === "single" ? [item.value()] : add(value(), item.value()));
  };

  const selectOne = (item: CollectionItem<V>) => {
    if (mode() === "none") return;
    anchorTo(item);
    setValue([item.value()]);
  };

  const selectRange = (toIndex: number = focus.activeIndex()) => {
    if (mode() !== "multiple" || toIndex < 0) return;
    const anchor = anchorIndex() < 0 ? toIndex : anchorIndex();
    const items = focus.items();
    const values: V[] = [];
    for (const index of selectionRange(anchor, toIndex)) {
      const item = items[index];
      if (item && focus.isFocusable(item)) values.push(item.value());
    }
    setValue(values);
  };

  const selectAll = () => {
    if (mode() !== "multiple") return;
    setValue(
      focus
        .items()
        .filter((item) => focus.isFocusable(item))
        .map((item) => item.value()),
    );
  };

  const deselectAll = () => setValue([]);

  const toggleActive = () => {
    const item = focus.activeItem();
    if (item) toggle(item);
  };
  const selectActive = () => {
    const item = focus.activeItem();
    if (item) select(item);
  };

  // Follow-focus: when enabled (and not gated off, e.g. during typeahead), the active item becomes
  // the selection as focus moves. Single-select semantics — `selectOne` replaces.
  createEffect(
    () => {
      if ((options.selectionBehavior?.() ?? "explicit") !== "follow") return undefined;
      if (options.shouldFollowFocus && !options.shouldFollowFocus()) return undefined;
      return focus.activeItem();
    },
    (item) => {
      // `selectOne` reads `mode()`/`value()`/`items()`; those reads are deliberate current-value
      // lookups here, not dependencies (the effect re-runs only when the active item changes).
      if (item) untrack(() => selectOne(item));
    },
  );

  return {
    value,
    isSelected,
    select,
    deselect,
    toggle,
    selectOne,
    selectRange,
    selectAll,
    deselectAll,
    toggleActive,
    selectActive,
    setAnchor: setAnchorIndex,
  };
}
