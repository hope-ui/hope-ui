/**
 * Utility type to get an object containing all keys of another type
 */
export type KeysOf<T> = Record<keyof T, true>;
