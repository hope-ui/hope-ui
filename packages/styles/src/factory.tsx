import { DOMElements, ElementType, filterUndefined, isEmptyObject, runIfFn } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { css } from "./stitches.config";
import { extractStyleProps } from "./styled-system/extract-style-props";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import {
  HopeComponent,
  HopeFactory,
  HopeFactoryStyleOptions,
  HopeProps,
  HTMLHopeComponents,
} from "./types";
import { packSx } from "./utils/pack-sx";

// singleton stitches cssComponent used for sx and system style props.
const systemCssComponent = css({});

const styled: HopeFactory = <T extends ElementType, Props = {}>(
  component: T,
  options: HopeFactoryStyleOptions<Props> = {}
) => {
  const { excludedProps = [], baseStyle: __baseStyle = {} } = options;

  const hopeComponent = (props: HopeProps<T, Props>) => {
    const [local, styleProps, others] = splitProps(
      props,
      ["as", "class", "sx", ...excludedProps],
      extractStyleProps(props)
    );

    const theme = useTheme();

    // className for hope factory `baseStyle`.
    const baseClass = createMemo(() => {
      const baseStyles = runIfFn(__baseStyle, { theme: theme(), props });

      if (isEmptyObject(baseStyles)) {
        return undefined;
      }

      const baseCssComponent = css(toCSSObject(baseStyles, theme()));

      return baseCssComponent.className;
    });

    // className for `sx` and `system style` props.
    const systemClass = createMemo(() => {
      const systemStyles = Object.assign(
        {},
        filterUndefined(styleProps),
        ...packSx(local.sx).map(partial => runIfFn(partial, theme()))
      );

      if (isEmptyObject(systemStyles)) {
        return undefined;
      }

      // use `css` prop to have higher specificity.
      return systemCssComponent({ css: toCSSObject(systemStyles, theme()) }).className;
    });

    return (
      <Dynamic
        component={local.as ?? component}
        class={clsx(baseClass(), systemClass(), local.class)}
        {...others}
      />
    );
  };

  return hopeComponent as HopeComponent<T, Props>;
};

function factory() {
  const cache = new Map<DOMElements, HopeComponent<DOMElements>>();

  return new Proxy(styled, {
    /**
     * @example
     * const Div = hope("div")
     * const WithHope = hope(AnotherComponent)
     */
    apply(target, thisArg, argArray: [ElementType, HopeFactoryStyleOptions<any>]) {
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
