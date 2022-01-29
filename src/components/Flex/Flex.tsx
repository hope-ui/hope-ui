import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { baseFlexStyles, BaseFlexVariants } from "./Flex.styles";

export interface BaseFlexOptions extends BaseFlexVariants {
  direction?: BaseFlexVariants["flexDirection"];
  wrap?: BaseFlexVariants["flexWrap"];
}

export type BaseFlexProps<C extends ElementType> = PolymorphicComponentProps<C, BaseFlexOptions>;

/**
 * [Internal] Foundation of <Flex /> and <Stack /> components.
 */
export function BaseFlex<C extends ElementType = "div">(props: BaseFlexProps<C>) {
  const [local, styleProps, shorthandStyleProps, others] = splitProps(
    props,
    commonProps,
    [...boxPropNames, "css"],
    ["direction", "wrap"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: "",
      baseClass: baseFlexStyles({
        flexDirection: shorthandStyleProps.direction,
        flexWrap: shorthandStyleProps.wrap,
        ...styleProps, // longhand props if provided will override the short ones
      }),
      classProps: local,
    });
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * Flex
 * -----------------------------------------------------------------------------------------------*/

export type FlexProps<C extends ElementType> = BaseFlexProps<C>;

const hopeFlexClass = "hope-flex";

/**
 * Hope UI component used to create flexbox layouts.
 * It renders a `div` with `display: flex` and comes with helpful style shorthand.
 */
export function Flex<C extends ElementType = "div">(props: FlexProps<C>) {
  const defaultProps: FlexProps<"div"> = {
    as: "div",
    direction: "row",
    alignItems: "stretch",
    justifyContent: "start",
    wrap: "nowrap",
  };

  const propsWithDefault: FlexProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "className", "classList"]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeFlexClass,
      baseClass: "",
      classProps: local,
    });
  };

  return <BaseFlex classList={classList()} {...others} />;
}

Flex.toString = () => createCssSelector(hopeFlexClass);
