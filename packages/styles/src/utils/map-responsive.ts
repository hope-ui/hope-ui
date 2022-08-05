import { Dict, isArray, isObject, objectKeys } from "@hope-ui/utils";

/** Map a responsive value to a new one. */
export function mapResponsive(prop: any, mapper: (val: any) => any) {
  if (isArray(prop)) {
    return prop.map(item => {
      if (item === null) {
        return null;
      }
      return mapper(item);
    });
  }

  if (isObject(prop)) {
    return objectKeys(prop).reduce((result: Dict, key) => {
      result[key] = mapper(prop[key]);
      return result;
    }, {});
  }

  if (prop != null) {
    return mapper(prop);
  }

  return null;
}
