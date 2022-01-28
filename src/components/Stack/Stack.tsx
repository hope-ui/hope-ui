import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { stackStyles, StackVariants } from "./Stack.styles";

type StackOptions = StackVariants & {
  wrap?: StackVariants["flexWrap"];
};

type StackProps<C extends ElementType> = PolymorphicComponentProps<C, StackOptions>;

const hopeStackClass = "hope-stack";

function Stack<C extends ElementType = "div">(props: StackProps<C>) {
  const defaultProps: StackProps<"div"> = {
    as: "div",
    alignItems: "center",
    justifyContent: "start",
    flexWrap: "no-wrap",
  };

  props = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...boxPropNames,
    "css",
    "wrap",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeStackClass,
      baseClass: stackStyles({
        ...styleProps,
        flexWrap: styleProps.wrap,
      }),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

Stack.toString = () => createCssSelector(hopeStackClass);

/* -------------------------------------------------------------------------------------------------
 * VStack
 * -----------------------------------------------------------------------------------------------*/

export type VStackOptions = StackOptions & {
  spacing?: StackVariants["gapY"];
};

export type VStackProps<C extends ElementType> = StackProps<C> & VStackOptions;

export function VStack<C extends ElementType = "div">(props: VStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);
  return <Stack flexDirection="column" gapY={local.spacing} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * HStack
 * -----------------------------------------------------------------------------------------------*/

export type HStackOptions = StackOptions & {
  spacing?: StackVariants["gapX"];
};

export type HStackProps<C extends ElementType> = StackProps<C> & HStackOptions;

export function HStack<C extends ElementType = "div">(props: HStackProps<C>) {
  const [local, others] = splitProps(props, ["spacing"]);
  return <Stack flexDirection="row" gapX={local.spacing} {...others} />;
}
