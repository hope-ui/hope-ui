import { Component, ComponentProps, JSX } from "solid-js";

/**
 * All HTML and SVG elements.
 */
export type DOMElements = keyof JSX.IntrinsicElements;

/**
 * Any HTML element or SolidJS component.
 */
export type ElementType<Props = any> = DOMElements | Component<Props>;

/**
 * Allows for extending a set of props (`Source`) by an overriding set of props (`Override`),
 * ensuring that any duplicates are overridden by the overriding set of props.
 */
export type OverrideProps<Source = {}, Override = {}> = Omit<Source, keyof Override> & Override;

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
 * Props object that includes the "as" prop.
 */
export type PropsWithAs<Type extends As = As, Props = {}> = OverrideProps<
  ComponentProps<Type>,
  Props & ClassProps & { as?: Type; children?: JSX.Element }
>;

/**
 * A component with the "as" prop.
 */
export type ComponentWithAs<DefaultType extends As, Props = {}> = {
  <Type extends As>(props: PropsWithAs<Type, Props> & { as: Type }): JSX.Element;
  (props: PropsWithAs<DefaultType, Props>): JSX.Element;
};

/**
 * Factory function to create component with the "as" prop.
 */
export function createComponentWithAs<DefaultType extends As, Props = {}>(
  component: Component<any>
) {
  return component as unknown as ComponentWithAs<DefaultType, Props>;
}
