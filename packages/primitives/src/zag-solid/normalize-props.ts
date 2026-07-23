// `JSX` comes from `@solidjs/web`, not upstream's `solid-js`: 2.0 moved the DOM/JSX types there,
// and it is this repo's `jsxImportSource`.
import type { JSX } from "@solidjs/web";
import { createNormalizer } from "@zag-js/types";
import { isNumber, isObject, isString } from "@zag-js/utils";

export type PropTypes = JSX.IntrinsicElements & {
  element: JSX.HTMLAttributes<any>;
  style: JSX.CSSProperties;
};

const eventMap: Record<string, string> = {
  onFocus: "onFocusIn",
  onBlur: "onFocusOut",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
  defaultChecked: "checked",
  defaultValue: "value",
  htmlFor: "for",
  className: "class",
};

const format = (v: string) => (v.startsWith("--") ? v : hyphenateStyleName(v));

type StyleObject = Record<string, any>;

function toSolidProp(prop: string) {
  return eventMap[prop] ?? prop;
}

type Dict = Record<string, any>;

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  const normalized: Dict = {};

  for (const key in props) {
    const value = props[key];

    if (key === "readOnly" && value === false) {
      continue;
    }

    // Zag emits ARIA state as real booleans (`aria-expanded: false`, `aria-modal: true`), which is
    // correct for React — its DOM layer stringifies `aria-*`. Solid's does not: `setAttribute` is
    // `value == null || value === false ? removeAttribute(name) : setAttribute(name, value === true
    // ? "" : value)`, and the SSR serializer agrees. So an unconverted boolean ships as
    // `aria-modal=""` (not a valid value for an enumerated ARIA attribute — axe raises
    // `aria-valid-attr-value`) or, when false, as no attribute at all, which silently loses the
    // state. Same class of bug as the `readOnly` rule above, and the reason for it is the same.
    //
    // A **deviation from upstream**, which has this bug too (invisible there because no Zag Solid
    // component is exercised against axe). Upstreaming it is the right fix; until then it lives
    // here, because every Solid Zag consumer hits it. See `machine.md`'s deviation table.
    if (typeof value === "boolean" && key.startsWith("aria-")) {
      normalized[key] = String(value);
      continue;
    }

    if (key === "style" && isObject(value)) {
      normalized["style"] = cssify(value);
      continue;
    }

    if (key === "children") {
      if (isString(value)) {
        normalized["textContent"] = value;
      }
      continue;
    }

    normalized[toSolidProp(key)] = value;
  }
  return normalized;
});

function cssify(style: StyleObject): StyleObject {
  const css = {} as StyleObject;
  for (const property in style) {
    const value = style[property];
    if (!isString(value) && !isNumber(value)) {
      continue;
    }
    css[format(property)] = value;
  }

  return css;
}

const uppercasePattern = /[A-Z]/g;
const msPattern = /^ms-/;

function toHyphenLower(match: string) {
  return `-${match.toLowerCase()}`;
}

const cache: Record<string, string> = {};

function hyphenateStyleName(name: string) {
  const cached = cache[name];
  if (cached !== undefined) {
    return cached;
  }
  const hyphenated = name.replace(uppercasePattern, toHyphenLower);
  const cssName = msPattern.test(hyphenated) ? `-${hyphenated}` : hyphenated;
  cache[name] = cssName;
  return cssName;
}
