import { Component, ComponentProps, JSX, PropsWithChildren } from "solid-js";

import { StyleProps } from "@/styled-system/system";
import { SystemStyleObject } from "@/styled-system/types";
import { RightJoinProps } from "@/utils/types";

/**
 * Represent any HTML element or SolidJS component.
 */
export type ElementType<Props = any> = keyof JSX.IntrinsicElements | Component<Props>;

/**
 * All HTML and SVG elements.
 */
export type DOMElements = keyof JSX.IntrinsicElements;

/**
 * Take the props of the passed HTML element or component and returns its type.
 * It uses a more precise version of just ComponentProps on its own.
 * Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
 */
export type PropsOf<C extends ElementType> = JSX.LibraryManagedAttributes<C, ComponentProps<C>>;

/**
 * All SolidJS props that apply css classes.
 */
export interface ClassProps {
  class?: string;
  className?: string;
  classList?: { [key: string]: boolean };
}

/**
 * Hope UI specific props.
 */
export type HopeProps = StyleProps & ClassProps & { __baseStyle?: SystemStyleObject };

/**
 * Enhance props of a SolidJS component or jsx element with Hope UI props.
 */
export type HTMLHopeProps<C extends ElementType, AdditionalProps = {}> = RightJoinProps<
  PropsOf<C>,
  PropsWithChildren<HopeProps & AdditionalProps & { as?: C }>
>;

/**
 * A hope-enabled component that accept style props.
 */
export type HopeComponent<T extends ElementType, P = {}> = <C extends ElementType = T>(
  props: HTMLHopeProps<C, P>
) => JSX.Element;

/**
 * All html and svg elements for hope components.
 * This is mostly for `hope.<element>` syntax.
 */
export type HTMLHopeComponents = {
  [Tag in DOMElements]: HopeComponent<Tag>;
};

export interface HopeFactoryStyleOptions<T extends ElementType> {
  /**
   * The CSS class to use when targeting the component in a css selector.
   * This class will be applied to the rendered dom element of the component.
   */
  className?: string;

  /**
   * Base style applied to the component.
   */
  baseStyle?: SystemStyleObject | ((props: HTMLHopeProps<T>) => SystemStyleObject);
}

/**
 * Factory function that converts non-hope components or jsx element
 * to hope-enabled components so you can pass style props to them.
 */
export type HopeFactory = <T extends ElementType>(
  component: T,
  styleOptions?: HopeFactoryStyleOptions<T>
) => HopeComponent<T>;

/**
 * Style configuration for Hope UI single-part component.
 */
export interface SinglePartComponentStyleConfig<Props> {
  /**
   * Style object for base or default style
   */
  baseStyle?: SystemStyleObject;

  /**
   * Default component props values.
   */
  defaultProps?: Props;
}
