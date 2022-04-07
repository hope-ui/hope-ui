import { isFunction } from "./assertion";

export function isChildrenFunction(props: any): boolean {
  const childrenProp = Object.getOwnPropertyDescriptor(props, "children");

  if (childrenProp == null) {
    return false;
  }

  return isFunction(childrenProp.value);
}
