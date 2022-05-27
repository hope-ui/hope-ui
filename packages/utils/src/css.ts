/**
 * Return a css class combining a base class and a BEM modifier,
 * or undefined if the modifier is null or undefined.
 */
export function withBemModifier(
  baseClass: string,
  modifier: string | null | undefined
): string | undefined {
  if (modifier == null) {
    return;
  }

  return `${baseClass}--${modifier}`;
}

/**
 * Return an array of css classes combining a base class and each BEM modifiers.
 */
export function withBemModifiers(
  baseClass: string,
  modifiers: Array<string | null | undefined>
): Array<string | undefined> {
  return modifiers.map(modifier => withBemModifier(baseClass, modifier));
}
