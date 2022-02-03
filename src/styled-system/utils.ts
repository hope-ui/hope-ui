/* eslint-disable solid/reactivity */
import { StyleProps } from "./system";
import { SystemMediaCssSelector, SystemStyleObject } from "./types";

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
  const responsiveStyleObject: Record<SystemMediaCssSelector, SystemStyleObject> = {
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
      // entry is a pseudo prop
      styleObject[prop] = value;
    } else if (isObject(value)) {
      // entry is a responsive prop
      Object.keys(value).forEach(key => {
        if (key === "@initial") {
          // `@initial` prop is replaced by the normal css property declaration in the stitches `css` object.
          styleObject[prop] = value[key];
        } else if (key in responsiveStyleObject) {
          const atMediaRule = key as SystemMediaCssSelector;

          // group all prop with the same `@media` key in the same object as in the stitches `css` object.
          responsiveStyleObject[atMediaRule] = {
            ...responsiveStyleObject[atMediaRule],
            [prop]: value[atMediaRule],
          };
        }
      });
    } else {
      // entry is a normal css property declaration (ex: `color: value`)
      styleObject[prop] = value;
    }
  });

  // Add content of the `css` prop last to ensure css override works correctly.
  props.css &&
    Object.entries(props.css).forEach(([key, value]) => {
      if (isObject(value)) {
        if (key in responsiveStyleObject) {
          // entry is a responsive css rule (ex: '@sm': {})
          const atMediaRule = key as SystemMediaCssSelector;

          responsiveStyleObject[atMediaRule] = {
            ...responsiveStyleObject[atMediaRule],
            ...value,
          };
        } else {
          // entry is a normal css rule (ex: `.my-class: {}`, `&:hover: {}` or `_hover: {}`)
          styleObject[key] = {
            ...(styleObject[key] as SystemStyleObject),
            ...value,
          };
        }
      } else {
        // entry is a normal css property declaration (ex: `color: value`)
        styleObject[key] = value;
      }
    });

  // spread responsive values last
  return { ...styleObject, ...responsiveStyleObject };
}
