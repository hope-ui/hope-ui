/** Return a css class for a component name and style name. */
export function getComponentStyleNameClass(componentName: string, styleName: string) {
  return `hope-${componentName}-${styleName}`;
}
