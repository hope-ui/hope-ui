import { Component, ComponentProps, JSX } from "solid-js";

import { StyleProps } from "../styled-system/system";
import { SystemStyleObject } from "../styled-system/types";
import { OverrideProps } from "../utils/types";

/**
 * All HTML and SVG elements.
 */
export type DOMElements = keyof JSX.IntrinsicElements;

/**
 * Any HTML element or SolidJS component.
 */
export type ElementType<Props = any> = DOMElements | Component<Props>;

/**
 * All SolidJS props that apply css classes.
 */
export interface ClassProps {
  class?: string;
  classList?: { [key: string]: boolean };
}

/**
 * The "as" prop type.
 */
export type As<Props = any> = ElementType<Props>;

/**
 * Hope UI specific props.
 */
export type HopeProps = StyleProps & ClassProps & { __baseStyle?: SystemStyleObject };

/**
 * Enhance props of a SolidJS component or JSX element with Hope UI props.
 */
export type HTMLHopeProps<Type extends As = As, Props = {}> = OverrideProps<
  ComponentProps<Type>,
  Props & HopeProps & { as?: Type; children?: JSX.Element }
>;

/**
 * A hope-enabled component that accept style props.
 */
export type HopeComponent<DefaultType extends As, Props> = {
  <Type extends As>(props: HTMLHopeProps<Type, Props> & { as: Type }): JSX.Element;
  (props: HTMLHopeProps<DefaultType, Props>): JSX.Element;
};

/**
 * All html and svg elements for hope components.
 * This is mostly for `hope.<element>` syntax.
 */
export type HTMLHopeComponents = {
  [Tag in DOMElements]: HopeComponent<Tag, {}>;
};

export interface HopeFactoryStyleOptions<T extends ElementType> {
  /**
   * Base CSS class applied to the component.
   * This class will be used when targeting the component in a css selector.
   */
  baseClass?: string;

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
) => HopeComponent<T, {}>;

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
