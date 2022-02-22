import { mergeProps, splitProps } from "solid-js";

import { css } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system/types";
import { isFunction } from "@/utils/assertion";
import { classNames } from "@/utils/css";

import { Box } from "./box/box";
import { DOMElements, ElementType, HopeComponent, HopeFactory, HTMLHopeComponents, HTMLHopeProps } from "./types";

// TODO: add stitches variant support

const styled: HopeFactory = <T extends ElementType>(
  component: T,
  baseStyles?: SystemStyleObject | ((props: HTMLHopeProps<T>) => SystemStyleObject)
) => {
  const cssComponent = css();

  const hopeComponent: HopeComponent<T> = props => {
    const propsWithDefault = mergeProps({ as: component }, props);

    const [local, others] = splitProps(propsWithDefault, ["class"]);

    const classes = () => classNames(local.class, cssComponent());

    const __baseStyles = () => {
      return baseStyles && isFunction(baseStyles) ? baseStyles(props as any) : baseStyles;
    };

    return <Box class={classes()} __baseStyle={__baseStyles()} {...others} />;
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
