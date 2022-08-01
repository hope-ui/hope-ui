export type AnyFunction<T = any> = (...args: T[]) => any;

export type Dict<T = any> = Record<string, T>;

export type FilterFn<T> = (value: any, key: string, object: T) => boolean;
