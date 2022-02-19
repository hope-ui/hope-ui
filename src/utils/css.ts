/**
 * Return a CSS class selector based on the provided class name.
 */
export function createClassSelector(className: string) {
  return `.${className}`;
}

/**
 * Return a single class names string from different css class.
 */
export function classNames(...classNames: Array<string | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
