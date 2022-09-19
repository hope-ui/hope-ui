import { Dict } from "@hope-ui/utils";

/**
 * A list of valid HTML props that needed to be prefixed because
 * they have same name as some Hope UI styles props.
 *
 * @example
 * <Image htmlWidth="100px"/>
 * =>
 * <img width="100px"/>
 */
export const prefixedHTMLPropsMap = new Map([
  ["htmlWidth", "width"],
  ["htmlHeight", "height"],
  ["htmlSize", "size"],
]);

/** Get the native HTML attributes from the Hope UI prefixed ones. */
export function getNativeHTMLProps(value: Dict) {
  return Object.entries(value).reduce((acc, [key, value]) => {
    const nativeKey = prefixedHTMLPropsMap.get(key);

    if (nativeKey != null && value != null) {
      acc[nativeKey] = value;
    }

    return acc;
  }, {} as any);
}
