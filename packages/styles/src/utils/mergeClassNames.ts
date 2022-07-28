import { HopeProviderStyles } from "../theme/HopeProvider";

interface MergeClassNamesParams<T extends Record<string, string>> {
  /** A function that merge classNames. */
  cx(...classNames: any): string;

  /** The internal component classNames. */
  classes: T;

  /** The styles provided by the nearest `HopeProviderContext`. */
  context: HopeProviderStyles[];

  /** The external classNames provided to the component via props. */
  classNames?: Partial<T>;

  /** The name of the component/parts. */
  name?: string | string[];
}

export function mergeClassNames<T extends Record<string, string>>(
  params: MergeClassNamesParams<T>
) {
  const contextClassNames = params.context.reduce<Record<string, string>>((acc, item) => {
    Object.keys(item.classNames).forEach(key => {
      if (typeof acc[key] !== "string") {
        acc[key] = item.classNames[key];
      } else {
        acc[key] = `${acc[key]} ${item.classNames[key]}`;
      }
    });

    return acc;
  }, {});

  return Object.keys(params.classes).reduce((acc, className) => {
    let staticClass;

    if (Array.isArray(params.name)) {
      staticClass = params.name
        .filter(Boolean)
        .map(part => `hope-${part}-${className}`)
        .join(" ");
    } else {
      staticClass = params.name ? `hope-${params.name}-${className}` : null;
    }

    const mergedClassName = params.cx(
      params.classes[className],
      contextClassNames[className],
      params.classNames?.[className],
      staticClass
    );

    return {
      ...acc,
      [className]: mergedClassName,
    };
  }, {}) as T;
}
