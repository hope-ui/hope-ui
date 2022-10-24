/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/system/src/factory.ts
 *
 * Original code by SEEK
 * MIT Licensed, Copyright (c) 2021 SEEK.
 *
 * Credits to the SEEK team:
 * https://github.com/seek-oss/vanilla-extract/blob/master/packages/recipes/src/types.ts
 */

import {
  DOMElements,
  ElementType,
  filterUndefined,
  isEmptyObject,
  once,
  runIfFn,
} from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createHopeComponent, HopeComponent } from "./create-hope-component";
import {
  computeStyleOptions,
  getSelectedVariantClassNames,
  HopeStyleOptions,
  HopeStyleOptionsInterpolation,
  HopeStyleResult,
  HopeVariantGroups,
  HopeVariantSelection,
} from "./create-styles";
import { css } from "./stitches.config";
import { extractStyleProps } from "./styled-system/extract-style-props";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { HopeProps, PolymorphicProps, SxProp, Theme } from "./types";
import { pack } from "./utils";
import { getNativeHTMLProps, prefixedHTMLPropsMap } from "./utils/prefixed-html-props";

/**
 * All html and svg elements for hope components.
 * This is mostly for `hope.<element>` syntax.
 */
type HTMLHopeComponents = {
  [Tag in DOMElements]: HopeComponent<Tag>;
};

/**
 * Singleton stitches `cssComponent`.
 * Used to inject styles at the consumption layer via the `css` prop.
 */
const systemCssComponent = css({});

/*
 * Style injection order (first to last)
 * - baseStyle (least specific)
 * - variants
 * - compound variants
 * - __css
 * - style props
 * - sx (override all)
 */
/**
 * Create a `styled` component capable of using Hope UI `system style` props.
 * @param component The component/html element to render.
 * @param styleInterpolation The styles to apply.
 * @param staticClassName A static className for the component, used as a css selector.
 */
function styled<T extends ElementType, Variants extends HopeVariantGroups = {}>(
  component: T,
  styleInterpolation?: HopeStyleOptionsInterpolation<Variants>,
  staticClassName?: string
) {
  let styleOptions: HopeStyleOptions<Variants> | undefined;
  let styleResult: HopeStyleResult<Variants> | undefined;
  let variantPropsKeys: Array<keyof Variants> = [];

  const runOnce = once((theme: Theme) => {
    if (styleInterpolation == null) {
      return;
    }

    styleOptions = runIfFn(styleInterpolation, theme);
    styleResult = computeStyleOptions(styleOptions, theme);
    variantPropsKeys = styleOptions.variants ? Object.keys(styleOptions.variants) : [];
  });

  const hopeComponent = createHopeComponent<T, HopeVariantSelection<Variants>>(props => {
    const theme = useTheme();

    // generate style options classNames once.
    runOnce(theme);

    const [local, prefixedHTMLProps, variantProps, styleProps, others] = splitProps(
      props as PolymorphicProps<T, HopeProps & HopeVariantSelection<Variants>>, // hack to have correct TS types.
      ["as", "class", "sx", "__css"],
      [...prefixedHTMLPropsMap.keys()],
      variantPropsKeys,
      extractStyleProps(props)
    );

    const variantClassNames = createMemo(() => {
      if (styleResult == null) {
        return [];
      }

      const selectedVariants = {
        ...styleOptions?.defaultVariants,
        ...filterUndefined(variantProps),
      } as HopeVariantSelection<Variants>;

      return getSelectedVariantClassNames(styleResult, selectedVariants);
    });

    const sxClassName = createMemo(() => {
      const styleOverrides = Object.assign(
        {},
        local.__css,
        filterUndefined(styleProps),
        ...pack<SxProp["sx"]>(local.sx).map(partial => runIfFn(partial, theme))
      );

      if (isEmptyObject(styleOverrides)) {
        return;
      }

      // use `css` prop to have higher specificity.
      return systemCssComponent({ css: toCSSObject(styleOverrides, theme) }).className;
    });

    return (
      <Dynamic
        component={local.as ?? (component as ElementType)}
        class={
          clsx(
            staticClassName,
            styleResult?.baseClassName,
            ...variantClassNames(),
            sxClassName(),
            local.class
          ) || undefined
        }
        {...getNativeHTMLProps(prefixedHTMLProps)}
        {...others}
      />
    );
  });

  // Override `toString` to return a selector for the static className,
  // so the component can be referenced in css rules.
  if (staticClassName != null) {
    hopeComponent.toString = () => `.${staticClassName}`;
  }

  return hopeComponent;
}

function factory() {
  const cache = new Map<DOMElements, HopeComponent<DOMElements>>();

  return new Proxy(styled, {
    /**
     * @example
     * const Div = hope("div")
     * const WithHope = hope(AnotherComponent)
     */
    apply(target, thisArg, argArray: [ElementType, HopeStyleOptionsInterpolation<any>]) {
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
  }) as typeof styled & HTMLHopeComponents;
}

export const hope = factory();
