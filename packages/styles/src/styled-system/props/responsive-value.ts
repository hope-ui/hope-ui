import { Theme, ThemeBreakpoint } from "../../types";

export type ResponsiveArray<T> = Array<T | null>;

export type ResponsiveObject<T> = Partial<Record<ThemeBreakpoint | string, T>>;

export type ResponsiveValue<T> =
  | T
  | ResponsiveArray<T>
  | ResponsiveObject<T>
  | ((theme: Theme) => T | ResponsiveArray<T> | ResponsiveObject<T>);

export type ResponsiveProps<Props> = {
  [K in keyof Props]?: ResponsiveValue<Props[K]>;
};
