import { StyledComponentProps, TransformProps } from "@stitches/core/types/styled-component";
import type * as Util from "@stitches/core/types/util";
import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, stitches, systemPropNames } from ".";
import { PseudoProps, StyleProps } from "./props";
import {
  AsProp,
  ChildrenProp,
  ClassProps,
  CSSComposer,
  PropsOf,
  SxProp,
  SystemMedia,
} from "./types";

export function styled<
  C extends ElementType,
  Composers extends (string | Util.Function | { [name: string]: unknown })[]
>(component: C, ...composers: CSSComposer<Composers>) {
  const cssComponent = stitches.css(...(composers as any));

  const styledComponent = <T extends ElementType = C>(
    props: Util.Assign<
      PropsOf<T> & AsProp<T> & ChildrenProp & ClassProps & SxProp,
      TransformProps<StyledComponentProps<Composers> & StyleProps & PseudoProps, SystemMedia>
    >
  ) => {
    const propsWithDefault = mergeProps({ as: component, sx: {} }, props);
    const baseStitchesClass = cssComponent(propsWithDefault);

    // Props that are not used by stitches
    const forwarProps = baseStitchesClass.props as any;

    const [local, styleProps, others] = splitProps(
      forwarProps,
      ["as", "class", "className", "classList", "sx"],
      systemPropNames
    );

    const rootClassList = () => {
      const stitchesClass = stitches.css(styleProps);

      const stitchesClassWithSxOverride = stitchesClass({ css: local.sx });

      return {
        [baseStitchesClass]: true,
        [stitchesClassWithSxOverride]: true,
        [local.class || ""]: true,
        [local.className || ""]: true,
        ...local.classList,
      };
    };

    return <Dynamic component={local.as} classList={rootClassList()} {...others} />;
  };

  const toString = () => cssComponent.selector;

  styledComponent.className = cssComponent.className;
  styledComponent.displayName = `Styled.${component}`;
  styledComponent.selector = cssComponent.selector;
  styledComponent.toString = toString;

  return styledComponent;
}
