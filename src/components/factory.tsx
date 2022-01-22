import { StyledComponentProps } from "@stitches/core/types/styled-component";
import type * as Util from "@stitches/core/types/util";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { getIntersectionKeys, stylePropsConfig } from "@/styled-system/props/stylePropsConfig";
import { css } from "@/styled-system/stitches.config";
import { CSSComposer, SystemMedia, SystemStyleObject } from "@/styled-system/types";
import { domElements } from "@/styled-system/utils";

import { HopeComponentProps } from ".";
import { ElementType, HopeComponent, HopeFactory } from "./types";

/**
 * Function that can be used to enable custom component receive hope's style props.
 */
function styled<
  Type extends ElementType,
  Composers extends (string | Util.Function | { [name: string]: unknown })[]
>(
  type: Type,
  ...composers: CSSComposer<Composers>
): HopeComponent<Type, StyledComponentProps<Composers>, SystemMedia, SystemStyleObject> {
  const cssComponent = css(...(composers as CSSComposer<Composers> & string));

  /**
   * Get an array of all stitches variant name related to that component creation.
   * This run only once when calling `hope("tag", {})`.
   */
  const variantPropNames: string[] = [];
  composers.forEach(c => c.variants && variantPropNames.push(...Object.keys(c.variants)));

  /**
   * The Generated styled component function that is style props aware.
   */
  const styledComponent: any = <NewType extends ElementType = Type>(
    props: HopeComponentProps<
      NewType,
      StyledComponentProps<Composers>,
      SystemMedia,
      SystemStyleObject
    >
  ) => {
    /**
     * Get an array of prop names that are only used style props and doesn't have same name as a variant props.
     * This will ensure we pass the small array possible to `splitProps()`
     */
    const usedStylePropNames = getIntersectionKeys(props, stylePropsConfig).filter(
      name => !variantPropNames.includes(name)
    );

    const [local, variantProps, styleProps, others] = splitProps(
      props,
      ["as", "className", "css"],
      variantPropNames as any,
      usedStylePropNames as any
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

    return <Dynamic component={local.as ?? type} className={className()} {...others} />;
  };

  styledComponent.className = cssComponent.className;
  styledComponent.displayName = `Styled.${type}`;
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
  hope[tag] = hope(tag) as any;
});
