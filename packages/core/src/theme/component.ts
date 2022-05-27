/**
 * Shape of a component configuration.
 */
export interface ComponentConfig<T extends Record<string, any>> {
  defaultVariants?: Partial<T>;
}
