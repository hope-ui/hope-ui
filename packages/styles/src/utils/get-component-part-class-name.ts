import { toKebabCase } from "@hope-ui/utils";

/** Return a css class for a component and part following BEM naming convention. */
export function getComponentPartClassName(component: string, part: string) {
  return `hope-${toKebabCase(component)}__${toKebabCase(part)}`;
}
