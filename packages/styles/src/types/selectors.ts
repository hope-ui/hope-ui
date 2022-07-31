import { Accessor } from "solid-js";

/** Extracts class names from useStyles primitive */
export type Selectors<T extends (...args: any) => Accessor<Record<string, any>>> = keyof ReturnType<
  ReturnType<T>
>;
