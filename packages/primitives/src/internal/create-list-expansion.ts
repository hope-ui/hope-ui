import type { Accessor } from "solid-js";
import { compareByIdOrReference, type ValueComparator } from "../utils/equality";
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
   * How two values are compared for equality — the escape hatch for object values that aren't
   * reference-stable. Defaults to `compareByIdOrReference` (`utils/equality`): `a.id === b.id` when
   * both values are objects carrying an `id`, else `a === b`. Modeled on Angular Material's
   * `compareWith`.
   */
  compareWith?: ValueComparator<V>;
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
 * Enter (expansion), independently. Modeled on Angular Aria's `expansion` (its reasoning and public
 * surface, adapted, not its code).
 *
 * Values are compared with `===`, so an item's `value` should be a primitive or a stable reference.
 */
export function createListExpansion<V>(
  options: CreateListExpansionOptions<V>,
): CreateListExpansionReturn<V> {
  const mode = () => options.expansionMode?.() ?? "multiple";
  const collapsible = () => options.collapsible?.() ?? true;
  const compare = (a: V, b: V) => (options.compareWith ?? compareByIdOrReference)(a, b);
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
