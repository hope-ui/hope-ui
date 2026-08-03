/** A value-equality predicate: returns `true` when `a` and `b` should be treated as the same value. */
export type ValueComparator<V> = (a: V, b: V) => boolean;

function hasId(value: unknown): value is { id: unknown } {
  return typeof value === "object" && value !== null && "id" in value;
}

/**
 * The default value comparator for the selection/expansion primitives: match on `id` when **both**
 * values are objects carrying one, otherwise strict `===` (primitives, `null`, reference-equal
 * objects). This is what lets a consumer pass a fresh `{ id, name }` object each render — or a
 * controlled value straight off the server — and still have it match the registered one, without
 * threading reference identity through the app. Override with a custom {@link ValueComparator}
 * for other shapes.
 */
export function compareByIdOrReference<V>(a: V, b: V): boolean {
  if (hasId(a) && hasId(b)) {
    return a.id === b.id;
  }
  return a === b;
}
