import { Component, ComponentProps, JSX } from "solid-js";

/**
 * Represent any HTML element or SolidJS component.
 */
export type ElementType = keyof JSX.IntrinsicElements | Component<unknown>;

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
 * The `as` props is an override of the default HTML tag.
 * Can also be another SolidJS component.
 */
export interface AsProp<C extends ElementType> {
  as?: C;
}

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type ExtendableProps<ExtendedProps = unknown, OverrideProps = unknown> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;
