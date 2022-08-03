import { ClassProps, DOMElements, ElementType, OverrideProps } from "@hope-ui/utils";
import { ComponentProps, JSX } from "solid-js";

import { SxProp, SystemStyleObject, SystemStyleProps } from "./system-style";
import { ThemeBase } from "./theme-base";

/** The "as" prop type. */
export type As<Props = any> = ElementType<Props>;

/** Props object that includes "system style" props and the "as" prop. */
export type HopeProps<Type extends As = As, Props = {}> = OverrideProps<
  ComponentProps<Type>,
  Props & SystemStyleProps & SxProp & ClassProps & { as?: Type; children?: JSX.Element }
>;

/** A component with Hope UI props. */
export type HopeComponent<DefaultType extends As, Props = {}> = {
  <Type extends As>(props: HopeProps<Type, Props> & { as: Type }): JSX.Element;
  (props: HopeProps<DefaultType, Props>): JSX.Element;
};

/**
 * All html and svg elements for hope components.
 * This is mostly for `hope.<element>` syntax.
 */
export type HTMLHopeComponents = {
  [Tag in DOMElements]: HopeComponent<Tag>;
};

export interface HopeFactoryStyleOptions<Props> {
  /** Props that will not be forwarded to the underlying dom element. */
  excludedProps?: Array<keyof Props>;

  /** Base style applied to the component. */
  baseStyle?:
    | SystemStyleObject
    | ((params: { theme: ThemeBase; props: Props }) => SystemStyleObject);
}

/**
 * Factory function that converts non Hope UI components or jsx element
 * to Hope UI components, so you can pass system style props to them.
 */
export type HopeFactory = <T extends ElementType, Props = {}>(
  component: T,
  options?: HopeFactoryStyleOptions<Props>
) => HopeComponent<T, Props>;
