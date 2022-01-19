import type * as Util from "@stitches/core/types/util";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { getIntersectionKeys, stylePropsConfig } from "@/styled-system/props/stylePropsConfig";
import { CSSComposer } from "@/styled-system/types";
import { domElements } from "@/styled-system/utils";

import { css } from "..";
import { ElementType, HopeComponent, HopeComponentProps, HopeFactory } from "./types";
import { commonPropNames } from "./utils";

/**
 * Function that can be used to enable custom component receive hope's style props.
 */
function styled<
  C extends ElementType,
  Composers extends (string | Util.Function | { [name: string]: unknown })[]
>(component: C, ...composers: CSSComposer<Composers>): HopeComponent<C, Composers> {
  const cssComponent = css(...(composers as CSSComposer<Composers> & string));

  const styledComponent = <T extends ElementType = C>(props: HopeComponentProps<T, Composers>) => {
    const stylePropNames = getIntersectionKeys(props, stylePropsConfig);

    const [local, styleProps, others] = splitProps(props, commonPropNames, stylePropNames);

    const className = () => {
      const cssComponentClassName = cssComponent({
        css: {
          ...styleProps,
          ...local.css,
        },
      });

      return `${cssComponentClassName} ${local.className}`;
    };

    return <Dynamic component={local.as ?? component} className={className()} {...others} />;
  };

  const toString = () => cssComponent.selector;

  styledComponent.className = cssComponent.className;
  styledComponent.displayName = `Styled.${component}`;
  styledComponent.selector = cssComponent.selector;
  styledComponent.toString = toString;

  return styledComponent;
}

/**
 * Hope factory serves as an object of hope enabled JSX elements,
 * and also a function that can be used to enable custom component receive hope's style props.
 */
export const hope = styled as HopeFactory;

domElements.forEach(tag => {
  hope[tag] = hope(tag);
});
