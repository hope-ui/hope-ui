import { DOMElements, ElementType, filterUndefined, isEmptyObject, runIfFn } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { css } from "./stitches.config";
import { extractStyleProps } from "./styled-system/extract-style-props";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { HopeComponent, HopeFactory, HopeProps, HTMLHopeComponents } from "./types";
import { packSx } from "./utils/pack-sx";

// singleton stitches cssComponent used for sx and system style props.
const systemCssComponent = css({});

const styled: HopeFactory = <T extends ElementType>(component: T) => {
  const hopeComponent = (props: HopeProps<T>) => {
    const [local, styleProps, others] = splitProps(
      props,
      ["as", "class", "sx"],
      extractStyleProps(props)
    );

    const theme = useTheme();

    const className = createMemo(() => {
      const systemStyles = Object.assign(
        {},
        filterUndefined(styleProps),
        ...packSx(local.sx).map(partial => runIfFn(partial, theme()))
      );

      if (isEmptyObject(systemStyles)) {
        return local.class;
      }

      // use `css` prop to have higher specificity than `createStyles`.
      const systemClass = systemCssComponent({ css: toCSSObject(systemStyles, theme()) }).className;

      return clsx(systemClass, local.class);
    });

    return <Dynamic component={local.as ?? component} class={className} {...others} />;
  };

  return hopeComponent as HopeComponent<T>;
};

function factory() {
  const cache = new Map<DOMElements, HopeComponent<DOMElements>>();

  return new Proxy(styled, {
    /**
     * @example
     * const Div = hope("div")
     * const StyledLink = hope(Link)
     */
    apply(target, thisArg, argArray: [ElementType]) {
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
