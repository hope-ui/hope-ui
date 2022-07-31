export type Prefixed<K extends string, T> = `${K}${Extract<T, boolean | number | string>}`;
