import { ResponsiveValue } from "@/styled-system/types";

import { isObject } from "./assertion";

/**
 * Map a responsive value to a new one
 */
export function mapResponsive(prop: ResponsiveValue<any>, mapper: (val: any) => any) {
  if (isObject(prop)) {
    return Object.keys(prop).reduce((result: Record<string, any>, key) => {
      result[key] = mapper(prop[key]);
      return result;
    }, {});
  }

  if (prop != null) {
    return mapper(prop);
  }

  return null;
}
