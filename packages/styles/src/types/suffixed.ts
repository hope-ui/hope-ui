export type Suffixed<K extends string, T> = `${Extract<T, boolean | number | string>}${K}`;
