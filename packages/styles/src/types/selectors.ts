import { Accessor } from "solid-js";

import { SystemStyleObject } from "./styled-system";

export interface UseStylesReturn<StylesNames extends string> {
  /** Accessor for the styles objects merged with theme and prop styles. */
  styles: Accessor<Record<StylesNames, SystemStyleObject>>;

  /**
   * Return a css className for a given style name.
   * @example
   * // getStaticClass("leftIcon") => "hope-Button-leftIcon"
   */
  getStaticClass: (styleName: StylesNames) => string;
}

/** Extracts styles names from `useStyles` primitive. */
export type Selectors<T extends (...args: any) => UseStylesReturn<any>> = keyof ReturnType<
  ReturnType<T>["styles"]
>;
