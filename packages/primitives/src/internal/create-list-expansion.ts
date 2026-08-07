import type { Accessor } from "solid-js";
import type { CollectionItem } from "./create-collection";
import { createControllableState } from "./create-controllable-state";

export type ExpansionMode = "single" | "multiple";

export interface CreateListExpansionOptions<V> {
  /**
   * The items that can expand — typically `collection.items`. Only `value` (the expansion key) and
   * `disabled` are read, so any `ItemSource`'s items work.
   */
  items: Accessor<ReadonlyArray<CollectionItem<V>>>;
  /** `"single"` (accordion — one open at a time) or `"multiple"` (default). Reactive. */
  expansionMode?: Accessor<ExpansionMode>;
  /** Controlled expanded values. Omit for uncontrolled use via `defaultValue`. */
  value?: Accessor<V[] | undefined>;
  /** Initially expanded values, uncontrolled. Default `[]`. */
  defaultValue?: V[];
  /** Called on every change with the new expanded-value array. */
  onChange?: (value: V[]) => void;
  /**
   * Whether the currently open item may be collapsed in `"single"` mode. `false` models an
   * accordion where one panel must always stay open. Default `true`. Ignored in `"multiple"` mode.
   */
  collapsible?: Accessor<boolean>;
  /**
   * Maps a value to its **identity key**, borrowing the `itemToValue` model from Base UI (the
   * headless React library). Two values are equal when their keys are `===` (see
   * {@link isItemEqualToValue}), so object values need not be reference-stable: a fresh
   * `{ id, name }` each render, or a controlled value straight from a server, still matches the
   * registered item when it maps to the same key. Default: identity (`(value) => value`), i.e. plain
   * `===`, which is fine for primitive values; with object values pass e.g. `(panel) => panel.id`.
   * The same option `createListSelection` and `createListFocus` take, so a widget passes one mapper
   * to all three.
   */
  itemToValue?: (value: V) => unknown;
  /**
   * Full override of the equality rule, for shapes `itemToValue` can't express. Defaults to
   * `(a, b) => itemToValue(a) === itemToValue(b)`. When given, `itemToValue` is ignored.
   */
  isItemEqualToValue?: (a: V, b: V) => boolean;
}

export interface CreateListExpansionReturn<V> {
  /** The expanded values, in no particular order. */
  expandedValues: Accessor<V[]>;
  /** Whether `item` is expanded. */
  isExpanded(item: CollectionItem<V>): boolean;
  /** Whether `item` can be expanded/collapsed (not disabled). */
  isExpandable(item: CollectionItem<V>): boolean;
  /** Expand `item` (in single mode, collapses any other). No-op if disabled. */
  expand(item: CollectionItem<V>): void;
  /** Collapse `item`. No-op if disabled, or if it is the last open item in a non-collapsible single. */
  collapse(item: CollectionItem<V>): void;
  /** Flip `item`'s expanded state, honoring the mode's rules. */
  toggle(item: CollectionItem<V>): void;
  /** Expand every expandable item. Multiple mode only. */
  expandAll(): void;
  /** Collapse everything (subject to `collapsible` in single mode). */
  collapseAll(): void;
}

/**
 * Expand/collapse state for disclosure widgets — Accordion, Tree, Disclosure. It layers on the
 * collection's items rather than on `createListFocus`, because expansion is orthogonal to which item
 * is focused: a Tree node moves focus with arrows (navigation) and opens/closes with Right/Left or
 * Enter (expansion), independently. Adapted from Angular Aria's `expansion` — Angular's
 * signal-based accessibility behaviors — taking its reasoning and public surface, not its code.
 *
 * Object values need not be reference-stable: pass `itemToValue` to map each value to an identity
 * key compared with `===`, or `isItemEqualToValue` to override equality outright.
 */
export function createListExpansion<V>(
  options: CreateListExpansionOptions<V>,
): CreateListExpansionReturn<V> {
  const mode = () => options.expansionMode?.() ?? "multiple";
  const collapsible = () => options.collapsible?.() ?? true;
  // An explicit `isItemEqualToValue` wins outright over `itemToValue`. Resolved once, because these
  // are configuration rather than reactive inputs.
  const itemToValue = options.itemToValue ?? ((value: V) => value);
  const areEqual =
    options.isItemEqualToValue ?? ((a: V, b: V) => itemToValue(a) === itemToValue(b));
  const compare = (a: V, b: V) => areEqual(a, b);
  const contains = (values: V[], candidate: V) => values.some((entry) => compare(entry, candidate));

  const [expandedValues, setExpandedValues] = createControllableState<V[]>({
    value: () => options.value?.(),
    defaultValue: () => options.defaultValue ?? [],
    onChange: (next) => options.onChange?.(next),
  });

  const isExpandable = (item: CollectionItem<V>) => !item.disabled();
  const isExpanded = (item: CollectionItem<V>) => contains(expandedValues(), item.value());

  const expand = (item: CollectionItem<V>) => {
    if (!isExpandable(item)) {
      return;
    }
    const key = item.value();
    if (mode() === "single") {
      setExpandedValues([key]);
    } else if (!contains(expandedValues(), key)) {
      setExpandedValues([...expandedValues(), key]);
    }
  };

  const collapse = (item: CollectionItem<V>) => {
    if (!isExpandable(item)) {
      return;
    }
    const key = item.value();
    // Single + non-collapsible: refuse to close the last open panel.
    if (mode() === "single" && !collapsible() && contains(expandedValues(), key)) {
      return;
    }
    setExpandedValues(expandedValues().filter((entry) => !compare(entry, key)));
  };

  const toggle = (item: CollectionItem<V>) => {
    if (isExpanded(item)) {
      collapse(item);
    } else {
      expand(item);
    }
  };

  const expandAll = () => {
    if (mode() !== "multiple") {
      return;
    }
    setExpandedValues(
      options
        .items()
        .filter(isExpandable)
        .map((item) => item.value()),
    );
  };

  const collapseAll = () => {
    if (mode() === "single" && !collapsible()) {
      return;
    }
    setExpandedValues([]);
  };

  return {
    expandedValues,
    isExpanded,
    isExpandable,
    expand,
    collapse,
    toggle,
    expandAll,
    collapseAll,
  };
}
