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
// eslint-disable-next-line import/no-unresolved
import { Dynamic } from "solid-js/web";

import { createHopeComponent, HopeComponent } from "./create-hope-component";
import { css } from "./stitches.config";
import { computeStyle } from "./styled-system/compute-style";
import { extractStyleProps } from "./styled-system/extract-style-props";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { BooleanMap, SxProp, SystemStyleObject, Theme, ThemeVarsAndBreakpoints } from "./types";
import { pack } from "./utils";
import { shouldApplyCompound } from "./utils/should-apply-compound";

/**
 * All html and svg elements for hope components.
 * This is mostly for `hope.<element>` syntax.
 */
type HTMLHopeComponents = {
  [Tag in DOMElements]: HopeComponent<Tag>;
};

type HopeVariantDefinitions = Record<string, SystemStyleObject>;

type HopeVariantGroups = Record<string, HopeVariantDefinitions>;

type HopeVariantSelection<Variants extends HopeVariantGroups> = {
  [VariantGroup in keyof Variants]?: BooleanMap<keyof Variants[VariantGroup]>;
};

interface HopeCompoundVariant<Variants extends HopeVariantGroups> {
  variants: HopeVariantSelection<Variants>;
  style: SystemStyleObject;
}

type HopeStyleOptions<Variants extends HopeVariantGroups> = {
  base?: SystemStyleObject;
  variants?: Variants;
  compoundVariants?: Array<HopeCompoundVariant<Variants>>;
  defaultVariants?: HopeVariantSelection<Variants>;
};

type HopeStyleOptionsInterpolation<Variants extends HopeVariantGroups> =
  | HopeStyleOptions<Variants>
  | ((theme: ThemeVarsAndBreakpoints) => HopeStyleOptions<Variants>);

type HopeStyleResult<Variants extends HopeVariantGroups> = {
  baseClassName: string;
  variantClassNames: {
    [K in keyof Variants]: {
      [V in keyof Variants[K]]: string;
    };
  };
  compoundVariants: Array<[HopeVariantSelection<Variants>, string]>;
};

/** Compute classNames from a hope style options. */
function computeStyleOptions<Variants extends HopeVariantGroups>(
  options: HopeStyleOptions<Variants>,
  theme: Theme
): HopeStyleResult<Variants> {
  const { base = {}, variants = {}, compoundVariants = [] } = options;

  return {
    baseClassName: computeStyle(base, theme),
    variantClassNames: Object.entries(variants).reduce((acc, [variant, definition]) => {
      // a variant (ex: "size")
      acc[variant] = Object.entries(definition as HopeVariantDefinitions).reduce(
        (acc, [value, style]) => {
          // a variant value (ex: "sm")
          acc[value] = computeStyle(style, theme);
          return acc;
        },
        {} as any
      );
      return acc;
    }, {} as any),
    compoundVariants: compoundVariants.map(compoundVariant => [
      compoundVariant.variants,
      computeStyle(compoundVariant.style, theme),
    ]),
  };
}

/**
 * Singleton stitches `cssComponent`.
 * Used to inject styles at the consumption layer via the `css` prop.
 */
const systemCssComponent = css({});

/*
 * Style injection order (first to last)
 * - base (least specific)
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

    const [local, styleProps, others] = splitProps(
      props,
      ["as", "class", "sx", "__css", ...variantPropsKeys],
      extractStyleProps(props)
    );

    const variantClassNames = createMemo(() => {
      if (styleResult == null) {
        return [];
      }

      const selectedVariants = {
        ...styleOptions?.defaultVariants,
        ...filterUndefined(local),
      } as HopeVariantSelection<Variants>;

      const { variantClassNames = {} as any, compoundVariants = [] } = styleResult;

      const classNames: Array<string> = [];

      // 1. add "variants" classNames.
      for (const name in selectedVariants) {
        const value = selectedVariants[name];

        if (value == null) {
          continue;
        }

        classNames.push(variantClassNames[name]?.[String(value)]);
      }

      // 2. add "compound variants" classNames.
      for (const [variants, className] of compoundVariants) {
        if (shouldApplyCompound(variants, selectedVariants)) {
          classNames.push(className);
        }
      }

      return classNames;
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
      // @ts-ignore
      <Dynamic
        component={local.as ?? component}
        class={
          clsx(
            staticClassName,
            styleResult?.baseClassName,
            ...variantClassNames(),
            sxClassName(),
            local.class
          ) || undefined
        }
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
