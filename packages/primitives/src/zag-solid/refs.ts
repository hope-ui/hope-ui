/**
 * The mutable, non-reactive scratch space a machine gets as `refs` — timers, typeahead buffers,
 * the last pointer position. Deliberately outside the reactive graph: writing one must never
 * schedule a render, which is the whole reason Zag separates it from `context`.
 */
export function createRefs<T>(refs: T) {
  return {
    get<K extends keyof T>(key: K): T[K] {
      return refs[key];
    },
    set<K extends keyof T>(key: K, value: T[K]) {
      refs[key] = value;
    },
  };
}
