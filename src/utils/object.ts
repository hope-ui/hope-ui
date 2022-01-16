export type Dict<T = any> = Record<string, T>;

/**
 * Get an array of keys that compose the object passed in parameter
 * @param obj An object
 * @returns Array of keys that compose the object
 */
export const objectKeys = <T extends Dict>(obj: T) => Object.keys(obj) as unknown as (keyof T)[];
