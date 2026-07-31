/**
 * The filter seam — the one thing Combobox adds to the shared kernel, and deliberately the only
 * place in the tree that knows a query exists.
 *
 * `@hope-ui/primitives/combobox` owns no text value (see `combobox-root.md`), so it also owns no
 * filter: it is handed an `items` array and never asks where it came from. `Combobox.Root` derives
 * that array from the consumer's `items` and the input's text, and everything downstream — the
 * count `Combobox.Status` announces, the emptiness `Combobox.Empty` shows, the option set arrow keys
 * traverse — falls out of it for free.
 *
 * ## Matching is collator-based, never `toLowerCase()`
 *
 * `Intl.Collator` with `{ usage: "search", sensitivity: "base" }` folds **case and diacritics
 * together**, which is what makes a `cafe` query match `Café` and an `acai` query match `Açaí`.
 * `toLowerCase()` folds only case, so it silently fails for every accented language — including
 * French, which this project's own preview browser renders in. The same collator and the same two
 * options back `createListTypeahead`, so a Combobox's filter and a Select's typeahead agree on what
 * "matches" means.
 *
 * Modeled on react-aria's `useFilter` (`@react-aria/i18n`) — its idea and its option set, written
 * here rather than ported: the scan below is the obvious way to express "does this collator consider
 * any window of `text` equal to `query`", and it deliberately skips their extra
 * `Default_Ignorable_Code_Point` normalization pass, which exists for input this API never sees.
 */

/** Decides whether one item survives the current query. */
export type ComboboxFilterFn<V> = (item: V, query: string) => boolean;

/**
 * How `Combobox.Root` narrows `items` as the user types.
 *
 * - `"contains"` (default) — the label contains the query anywhere.
 * - `"startsWith"` — the label begins with the query.
 * - a function — your own predicate, receiving the raw item and the query.
 * - `false` — **no filtering**. `items` is passed through untouched, which is what an async search
 *   wants: fetch on `onInputValueChange`, hand back the results, and let the server decide.
 */
export type ComboboxFilter<V> = "startsWith" | "contains" | ComboboxFilterFn<V> | false;

/** Whether the collator considers `text` to begin with `query`. */
function startsWith(collator: Intl.Collator, text: string, query: string): boolean {
  if (query.length > text.length) {
    return false;
  }
  return collator.compare(text.slice(0, query.length), query) === 0;
}

/**
 * Whether the collator considers any window of `text` equal to `query`. The scan is by code unit,
 * so a query splitting a surrogate pair or a combining sequence simply fails to match rather than
 * matching wrongly — the same trade react-aria makes.
 */
function contains(collator: Intl.Collator, text: string, query: string): boolean {
  for (let offset = 0; offset + query.length <= text.length; offset += 1) {
    if (collator.compare(text.slice(offset, offset + query.length), query) === 0) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve a `filter` prop into a predicate. `false` never reaches here — `Combobox.Root` short
 * circuits on it, so the whole `items` array keeps its identity and the memo below it never
 * re-derives.
 */
export function resolveFilter<V>(
  filter: Exclude<ComboboxFilter<V>, false>,
  collator: Intl.Collator,
  itemToLabel: (item: V) => string,
): ComboboxFilterFn<V> {
  if (typeof filter === "function") {
    return filter;
  }
  const match = filter === "startsWith" ? startsWith : contains;
  return (item, query) => match(collator, itemToLabel(item), query);
}
