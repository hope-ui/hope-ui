import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { css } from "@/styled-system/stitches.config";
import { createStyledSystemClass, getUsedStylePropNames } from "@/styled-system/system";
import { SystemStyleObject } from "@/styled-system/types";
import { isFunction } from "@/utils/assertion";
import { classNames } from "@/utils/css";

import { DOMElements, ElementType, HopeComponent, HopeFactory, HTMLHopeComponents, HTMLHopeProps } from "./types";

// TODO: add stitches variant support

const styled: HopeFactory = <T extends ElementType>(
  component: T,
  baseStyle?: SystemStyleObject | ((props: HTMLHopeProps<T>) => SystemStyleObject)
) => {
  const cssComponent = css();

  const hopeComponent: HopeComponent<T> = props => {
    const usedStylePropNames = getUsedStylePropNames(props);

    const propsWithDefault: HTMLHopeProps<T> = mergeProps({ as: component }, props);

    const [local, styleProps, others] = splitProps(
      propsWithDefault,
      ["as", "class", "className", "__baseStyle"],
      usedStylePropNames
    );

    const __baseStyles = () => {
      const factoryBaseStyle = isFunction(baseStyle) ? baseStyle(props as any) : baseStyle;

      // order is import for css override
      return [factoryBaseStyle, local.__baseStyle];
    };

    const classes = () => {
      return classNames(
        local.class,
        local.className,
        cssComponent(),
        createStyledSystemClass(styleProps, __baseStyles())
      );
    };

    return <Dynamic component={local.as ?? "div"} class={classes()} {...others} />;
  };

  // In order to target the component in stitches css method and prop, like any other Hope UI components.
  hopeComponent.toString = () => cssComponent.selector;

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
    apply(target, thisArg, argArray: [ElementType, SystemStyleObject]) {
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
