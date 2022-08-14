/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/system/src/factory.ts
 */

import {
  DOMElements,
  ElementType,
  filterUndefined,
  isEmptyObject,
  isFunction,
  runIfFn,
} from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import {
  As,
  createPolymorphicComponent,
  PolymorphicComponent,
} from "./create-polymorphic-component";
import { css } from "./stitches.config";
import { extractStyleProps } from "./styled-system/extract-style-props";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { HopeProps, SystemStyleObject, ThemeVars } from "./types";
import { packSx } from "./utils";

/** A component with Hope UI props. */
type HopeComponent<DefaultType extends As, Props = {}> = PolymorphicComponent<
  DefaultType,
  Props & HopeProps
>;

/**
 * All html and svg elements for hope components.
 * This is mostly for `hope.<element>` syntax.
 */
type HTMLHopeComponents = {
  [Tag in DOMElements]: HopeComponent<Tag>;
};

interface HopeFactoryStyleOptions<Props> {
  /** Props that will not be forwarded to the underlying dom element. */
  excludedProps?: Array<keyof Props>;

  /** Base style applied to the component. */
  baseStyle?:
    | SystemStyleObject
    | ((options: { vars: ThemeVars; props: Props }) => SystemStyleObject);
}

/**
 * Factory function that converts non Hope UI components or jsx element
 * to Hope UI components, so you can pass system style props to them.
 */
type HopeFactory = <T extends ElementType, Props = {}>(
  component: T,
  options?: HopeFactoryStyleOptions<Props>
) => HopeComponent<T, Props>;

/**
 * Singleton stitches `cssComponent`.
 * Used to inject styles at the consumption layer via the `css` prop.
 * Also act as a css reset for all Hope UI component.
 */
const systemCssComponent = css({
  boxSizing: "border-box",
  margin: 0,

  "&::before, &::after": {
    boxSizing: "border-box",
  },
});

function styled<T extends ElementType, Props = {}>(
  component: T,
  options: HopeFactoryStyleOptions<Props> = {}
) {
  const { excludedProps = [], baseStyle = {} } = options;

  const hopeComponent = createPolymorphicComponent<T, Props & HopeProps>(props => {
    const [local, styleProps, others] = splitProps(
      props,
      ["as", "class", "sx", "__css", ...excludedProps],
      extractStyleProps(props)
    );

    const theme = useTheme();

    const className = createMemo(() => {
      const styles = Object.assign(
        {},
        local.__css,
        isFunction(baseStyle) ? baseStyle({ vars: theme.vars, props }) : baseStyle,
        filterUndefined(styleProps),
        ...packSx(local.sx).map(partial => runIfFn(partial, theme.vars))
      );

      if (isEmptyObject(styles)) {
        return undefined;
      }

      const overrideCss = toCSSObject(styles, theme);

      return systemCssComponent({ css: overrideCss }).className;
    });

    return (
      <Dynamic
        component={local.as ?? component}
        class={clsx(className(), local.class) || undefined}
        {...others}
      />
    );
  });

  return hopeComponent as HopeComponent<T>;
}

function factory() {
  const cache = new Map<DOMElements, HopeComponent<DOMElements>>();

  return new Proxy(styled, {
    /**
     * @example
     * const Div = hope("div")
     * const WithHope = hope(AnotherComponent)
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
