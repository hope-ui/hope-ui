import type * as Util from "@stitches/core/types/util";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { getIntersectionKeys, stylePropsConfig } from "@/styled-system/props/stylePropsConfig";
import { css } from "@/styled-system/stitches.config";
import { CSSComposer } from "@/styled-system/types";
import { domElements } from "@/styled-system/utils";

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

  /**
   * Get an array of all stitches variant name related to that component creation.
   * This run only once when calling `hope("tag", {})`.
   */
  const variantPropNames = composers.flatMap(composer =>
    composer.variants ? Object.keys(composer.variants) : []
  );

  /**
   * The Generated styled component function that is style props aware.
   */
  const styledComponent = <T extends ElementType = C>(props: HopeComponentProps<T, Composers>) => {
    /**
     * Get an array of prop names that are only used style props and doesn't have same name as a variant props.
     * This will ensure we pass the small array possible to `splitProps()`
     */
    const usedStylePropNames = getIntersectionKeys(props, stylePropsConfig).filter(
      name => !variantPropNames.includes(name)
    );

    const [local, variantProps, styleProps, others] = splitProps(
      props,
      commonPropNames,
      variantPropNames,
      usedStylePropNames
    );

    const className = () => {
      const cssComponentClassName = cssComponent({
        ...variantProps, // variants are first class citizen in stitches api
        css: {
          ...styleProps, // style props are basically syntactic sugared css overrides
          ...local.css, // This should be last to ensure the `css` prop override style props
        },
      });

      return `${cssComponentClassName} ${local.className ?? ""}`.trim();
    };

    return <Dynamic component={local.as ?? component} className={className()} {...others} />;
  };

  styledComponent.className = cssComponent.className;
  styledComponent.displayName = `Styled.${component}`;
  styledComponent.selector = cssComponent.selector;
  styledComponent.toString = () => cssComponent.selector;

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
