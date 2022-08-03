import { DOMElements, ElementType, filterUndefined, runIfFn } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { css } from "./stitches.config";
import { extractStyleProps } from "./styled-system/extract-style-props";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { Sx } from "./types";
import { HopeComponent, HopeFactory, HopeProps, HTMLHopeComponents } from "./types/polymorphic";
import { packSx } from "./utils/pack-sx";

const styled: HopeFactory = <T extends ElementType>(component: T, baseStyles: Sx = {}) => {
  const hopeComponent = (props: HopeProps<T>) => {
    const [local, styleProps, others] = splitProps(
      props,
      ["as", "class", "sx"],
      extractStyleProps(props)
    );

    const theme = useTheme();

    const className = createMemo(() => {
      const finalStyles = Object.assign(
        {},
        runIfFn(baseStyles, theme()),
        filterUndefined(styleProps),
        ...packSx(local.sx).map(partial => runIfFn(partial, theme()))
      );

      const cssComponent = css(toCSSObject(finalStyles, theme()));

      return clsx(local.class, cssComponent().className);
    });

    return <Dynamic component={local.as ?? component} class={className()} {...others} />;
  };

  return hopeComponent as HopeComponent<T>;
};

function factory() {
  const cache = new Map<DOMElements, HopeComponent<DOMElements>>();

  return new Proxy(styled, {
    /**
     * @example
     * const Div = hope("div")
     * const WithHope = hope(AnotherComponent)
     */
    apply(target, thisArg, argArray: [ElementType, Sx]) {
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
