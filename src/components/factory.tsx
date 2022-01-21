import { StyledComponentProps } from "@stitches/core/types/styled-component";
import type * as Util from "@stitches/core/types/util";
import { splitProps } from "solid-js";
import { Dynamic, isServer, ssr, ssrSpread } from "solid-js/web";

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
  Type extends ElementType | Util.Function,
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
  //const styledComponent = <T extends ElementType = C>(props: HopeComponentProps<T, Composers>) => {
  const styledComponent: any = (
    props: HopeComponentProps<Type, StyledComponentProps<Composers>, SystemMedia, SystemStyleObject>
  ) => {
    const Type = props.as || type;

    if (typeof Type === "function") {
      const forwardProps = cssComponent(props).props;
      delete forwardProps.as;
      return Type(forwardProps);
    }

    if (isServer) {
      const forwardProps = cssComponent(props).props;
      delete forwardProps.as;
      const [local, others] = splitProps(forwardProps, ["children"]);
      const args = [[`<${Type} `, ">", `</${Type}>`], ssrSpread(others), local.children || ""];
      const result = ssr(...args);
      return result;
    }

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
  hope[tag] = hope(tag);
});
