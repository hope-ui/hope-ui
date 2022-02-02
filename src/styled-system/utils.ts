/* eslint-disable solid/reactivity */
import { StyleProps } from "./system";
import {
  ResponsiveObject,
  SystemMediaCssSelector,
  SystemMediaCssSelectorWithoutInitalSelector,
  SystemStyleObject,
} from "./types";

export function isArray<T>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  const type = typeof value;
  return value != null && (type === "object" || type === "function") && !isArray(value);
}

/**
 * Return a valid Stitches CSS object based on the given style props
 */
export function toCss(props: StyleProps) {
  /**
   * Object containing all non-responsive styles.
   */
  const styleObject: SystemStyleObject = {};

  /**
   * Object containing all responsive styles grouped by `@media` rule.
   */
  const responsiveStyleObject: Record<
    SystemMediaCssSelectorWithoutInitalSelector,
    SystemStyleObject
  > = {
    "@sm": {},
    "@md": {},
    "@lg": {},
    "@xl": {},
    "@2xl": {},
    "@reduce-motion": {},
    "@light": {},
    "@dark": {},
  };

  Object.entries(props).forEach(([prop, value]) => {
    if (prop === "css") {
      return;
    } else if (prop.startsWith("_")) {
      // prop is a pseudo prop
      styleObject[prop] = value;
    } else if (isObject(value)) {
      // prop is a responsive prop
      Object.keys(value).forEach(key => {
        if (key === "@initial") {
          // no `@initial` prop in the stitches `css` prop, just the plain css key/value pair.
          styleObject[prop] = (value as ResponsiveObject)[key];
        } else if (key in responsiveStyleObject) {
          // group all prop with the same `@media` key in the same object like the stitches `css` prop does.
          responsiveStyleObject[key as SystemMediaCssSelectorWithoutInitalSelector] = {
            ...responsiveStyleObject[key as SystemMediaCssSelectorWithoutInitalSelector],
            [prop]: (value as ResponsiveObject)[key as SystemMediaCssSelector],
          };
        }
      });
    } else {
      // normal style prop (ex: color: value)
      styleObject[prop] = value;
    }
  });

  // Add content of the `css` prop last to ensure css override works correctly.
  props.css &&
    Object.entries(props.css).forEach(([key, value]) => {
      if (isObject(value)) {
        if (key in responsiveStyleObject) {
          // key is a responsive style (ex: '@sm': {})
          responsiveStyleObject[key as SystemMediaCssSelectorWithoutInitalSelector] = {
            ...responsiveStyleObject[key as SystemMediaCssSelectorWithoutInitalSelector],
            ...value,
          };
        } else {
          // key is a normal style object (ex: `_hover: {}` or `&:hover : {}` selectors)
          styleObject[key] = {
            ...(styleObject[key] as SystemStyleObject),
            ...value,
          };
        }
      } else {
        // key is a normal style prop (ex: color: value)
        styleObject[key] = value;
      }
    });

  // spread responsive values last
  return { ...styleObject, ...responsiveStyleObject };
}
