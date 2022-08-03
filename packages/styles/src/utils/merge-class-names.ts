import { clsx } from "clsx";

import { ClassNames } from "../types";
import { getComponentPartClassName } from "./get-component-part-class-name";

interface MergeClassNamesParams {
  /** The name of the component. */
  name: string;

  /** The base classNames. */
  baseClassNames: ClassNames<string>;

  /** The classNames provided by the closest `ThemeProviderContext`. */
  themeClassNames?: ClassNames<string>;

  /** The classNames provided to the component via props. */
  propClassNames?: ClassNames<string>;
}

export function mergeClassNames(params: MergeClassNamesParams) {
  return Object.keys(params.baseClassNames).reduce((acc, key) => {
    acc[key] = clsx(
      params.baseClassNames[key],
      params.themeClassNames?.[key],
      params.propClassNames?.[key],
      getComponentPartClassName(params.name, key)
    );

    return acc;
  }, {} as ClassNames<string>);
}
