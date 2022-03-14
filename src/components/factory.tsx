import { createMemo, mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createStyledSystemClass, getUsedStylePropNames } from "@/styled-system/system";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import {
  DOMElements,
  ElementType,
  HopeComponent,
  HopeFactory,
  HopeFactoryStyleOptions,
  HTMLHopeComponents,
  HTMLHopeProps,
} from "./types";

// TODO: add stitches variant support

const styled: HopeFactory = <T extends ElementType>(component: T, styleOptions?: HopeFactoryStyleOptions<T>) => {
  const hopeComponent: HopeComponent<T> = props => {
    const usedStylePropNames = getUsedStylePropNames(props);

    const propsWithDefault: HTMLHopeProps<T> = mergeProps({ as: component }, props);

    const [local, styleProps, others] = splitProps(
      propsWithDefault,
      ["as", "class", "className", "__baseStyle"],
      usedStylePropNames
    );

    const __baseStyles = createMemo(() => {
      const factoryBaseStyle = isFunction(styleOptions?.baseStyle)
        ? styleOptions?.baseStyle(props as any)
        : styleOptions?.baseStyle;

      // order is important for css override
      return [factoryBaseStyle, local.__baseStyle];
    });

    const classes = () => {
      return classNames(
        styleOptions?.className, // In order to target the component in stitches css method and prop, like any other Hope UI components.
        local.class,
        local.className,
        createStyledSystemClass(styleProps, __baseStyles())
      );
    };

    return <Dynamic component={local.as ?? "div"} class={classes()} {...others} />;
  };

  // In order to target the component in stitches css method and prop, like any other Hope UI components.
  hopeComponent.toString = () => (styleOptions?.className ? createClassSelector(styleOptions.className) : "");

  return hopeComponent;
};

function factory() {
  const cache = new Map<DOMElements, HopeComponent<DOMElements>>();

  return new Proxy(styled, {
    /**
     * @example
     * const Div = hope("div")
     * const WithHope = hope(AnotherComponent)
     */
    apply(target, thisArg, argArray: [ElementType, HopeFactoryStyleOptions<ElementType>]) {
      return styled(...argArray);
    },

    /**
     * @example
     * <hope.div />
     */
    get(_, element: DOMElements) {
      if (!cache.has(element)) {
        cache.set(element, styled(element));
      }
      return cache.get(element);
    },
  }) as HopeFactory & HTMLHopeComponents;
}

export const hope = factory();
