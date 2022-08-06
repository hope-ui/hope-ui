import { UseStylesReturn } from "./styles";

/** Extracts component parts from `useStyles` primitive. */
export type PartsOf<T extends (...args: any) => UseStylesReturn<any>> = keyof ReturnType<
  ReturnType<T>["styles"]
>;
