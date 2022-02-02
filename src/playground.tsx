/* eslint-disable solid/reactivity */
import "./playground.css";

import { CSS } from "@stitches/core";
import { render } from "solid-js/web";

import { config } from "./theme/stitches.config";

// Lib

export type SystemMedia = typeof config.media;
export type SystemStyleObject = CSS<typeof config>;

export type Prefixed<K extends string, T> = `${K}${Extract<T, boolean | number | string>}`;
export type Dict<T = any> = Record<string, T>;

export type TransformProps<Props, Media = SystemMedia> = {
  [K in keyof Props]:
    | Props[K]
    | ({
        [KMedia in Prefixed<"@", "initial" | keyof Media>]?: Props[K];
      } & {
        [KMedia in string]: Props[K];
      });
};

export type StyleProps = Partial<{
  m: SystemStyleObject["margin"];
  borderRadius: SystemStyleObject["borderRadius"];
  overflow: SystemStyleObject["overflow"];
  p: SystemStyleObject["padding"];
  bg: SystemStyleObject["color"];
  color: SystemStyleObject["color"];
  _hover: SystemStyleObject;
  _active: SystemStyleObject;
}>;

export type ResponsiveStyleProps = Omit<TransformProps<StyleProps>, "css"> & {
  css?: SystemStyleObject;
};

export type AtMediaRule = Prefixed<"@", keyof SystemMedia>;

export type ResponsiveObject = Record<"@initial" | AtMediaRule, string | number | boolean>;

export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

export function isObject(value: any): value is Dict {
  const type = typeof value;
  return value != null && (type === "object" || type === "function") && !isArray(value);
}

function toValidCSSProp(props: ResponsiveStyleProps) {
  const styleObject: SystemStyleObject = {};
  const responsiveStyleObject: Record<AtMediaRule, SystemStyleObject> = {
    "@sm": {},
    "@md": {},
    "@lg": {},
    "@xl": {},
    "@2xl": {},
    "@reduce-motion": {},
    "@light": {},
    "@dark": {},
  };

  const propsArray = Object.entries(props);

  propsArray.forEach(([prop, value]) => {
    if (prop === "css") {
      return;
    } else if (prop.startsWith("_")) {
      // prop is a pseudo prop
      styleObject[prop] = value;
    } else if (isObject(value)) {
      // prop is a responsive prop
      Object.keys(value).forEach(key => {
        if (key === "@initial") {
          // in the stitches `css` prop `@initial` is just the plain prop key/value pair.
          styleObject[prop] = (value as ResponsiveObject)[key];
        } else if (key in responsiveStyleObject) {
          // group all prop with the same `@media` key in the same object like the stitches `css` prop does.
          responsiveStyleObject[key as AtMediaRule] = {
            ...responsiveStyleObject[key as AtMediaRule],
            [prop]: (value as ResponsiveObject)[key as AtMediaRule],
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
          responsiveStyleObject[key as AtMediaRule] = {
            ...responsiveStyleObject[key as AtMediaRule],
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

// Sample

const testProps: ResponsiveStyleProps = {
  m: {
    "@xl": "$16",
  },
  css: {
    color: "salmon",
    borderRadius: "4px",
    overflow: "initial",
    _active: {
      fontWeight: 700,
    },
    "&:focus": {
      width: "40px",
      height: "100px",
    },

    "@sm": {
      fontSize: "16px",
      letterSpacing: "4px",
    },
    "@lg": {
      fontSize: "24px",
      letterSpacing: "8px",
    },
    "@2xl": {
      fontSize: "60px",
      letterSpacing: "12px",
    },
  },
  p: {
    "@initial": 12,
    "@sm": "20px",
    "@lg": "$4",
    "@2xl": "$8",
  },
  bg: {
    "@sm": "orange",
    "@md": "green",
    "@2xl": "blue",
  },
  _hover: {
    fontWeight: 600,
  },
  _active: {
    fontWeight: 900,
    lineHeight: 1,
  },
  color: "yellow",
};

console.log(JSON.stringify(toValidCSSProp(testProps), null, 2));

//

export function App() {
  return <div>Hope UI</div>;
}

render(() => <App />, document.getElementById("root") as HTMLElement);
